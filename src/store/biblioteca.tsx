import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogoItem, Medio } from "../api/jikanClient";
import {
  obtenerListas,
  agregarALista,
  actualizarLista,
  eliminarDeLista,
  type ListaEntrada,
  type CrearListaPayload,
  type ActualizarListaPayload,
} from "../api/listaService";

// ─── Estado global de la biblioteca personal ─────────────────────────────────
// Backend como fuente de verdad, localStorage como caché offline.

export type EstadoAnime = "viendo" | "por-ver" | "completado" | "pausado" | "descartado";
export type EstadoManga = "leyendo" | "por-leer" | "completado" | "pausado" | "descartado";
export type Estado = EstadoAnime | EstadoManga;

export interface Entrada {
  /** UUID de la tabla listas en el backend (null si es local-only) */
  listaId: string | null;
  /** ID de Jikan/Tenrai (mal_id) */
  id: number;
  medio: Medio;
  titulo: string;
  img: string;
  tipo: string;
  estado: Estado;
  progreso: number;
  total: number | null;
  favorito: boolean;
  puntuacion: number;
  notas: string;
  fechaInicio: string;
  fechaFin: string;
  agregado: string;
  orden: number;
  etiquetas: string[];
  /** URL de respaldo en Supabase Storage */
  urlRespaldo: string | null;
}

export interface ListaPersonalizada {
  id: string;
  nombre: string;
  items: string[];
  orden: number;
}

export interface ItemExterno {
  clave: string;
  id: number;
  medio: Medio;
  titulo: string;
  img: string;
  tipo: string;
}

export interface Grupo {
  id: string;
  titulo: string;
  descripcion: string;
  portada: string;
  etiquetas: string[];
  listas: ListaPersonalizada[];
  externos: ItemExterno[];
  creado: string;
}

export interface Perfil {
  nombre: string;
  avatar: string;
  correo: string;
}

export interface Preferencias {
  sfw: boolean;
}

interface BibliotecaCtx {
  entradas: Entrada[];
  grupos: Grupo[];
  perfil: Perfil;
  clave: (medio: Medio, id: number) => string;
  enBiblioteca: (medio: Medio, id: number) => Entrada | undefined;
  agregar: (item: CatalogoItem, medio: Medio, estado?: Estado) => Promise<void>;
  quitar: (medio: Medio, id: number) => Promise<void>;
  actualizar: (medio: Medio, id: number, cambios: Partial<Entrada>) => Promise<void>;
  reordenar: (medio: Medio, estado: Estado | "todos", clavesOrdenadas: string[]) => void;
  crearGrupo: (g: Omit<Grupo, "id" | "creado" | "listas" | "externos">) => void;
  actualizarGrupo: (id: string, cambios: Partial<Grupo>) => void;
  eliminarGrupo: (id: string) => void;
  setPerfil: (p: Partial<Perfil>) => void;
  sincronizarConAuth: (u: { nombre: string; correo: string; avatar: string | null; preferencias: { sfw: boolean } | null }) => void;
  sincronizarConBackend: () => Promise<void>;
  reemplazarTodo: (datos: { entradas?: Entrada[]; grupos?: Grupo[] }) => void;
  preferencias: Preferencias;
  setPreferencias: (p: Partial<Preferencias>) => void;
}

const LLAVE = "anilist:biblioteca:v1";

const Ctx = createContext<BibliotecaCtx | null>(null);

const PERFIL_INICIAL: Perfil = {
  nombre: "",
  avatar: "",
  correo: "",
};

const PREFERENCIAS_INICIALES: Preferencias = { sfw: true };

interface Guardado {
  entradas: Entrada[];
  grupos: Grupo[];
  perfil: Perfil;
  preferencias: Preferencias;
}

function leer(): Guardado {
  if (typeof window === "undefined") return { entradas: [], grupos: [], perfil: PERFIL_INICIAL, preferencias: PREFERENCIAS_INICIALES };
  try {
    const raw = localStorage.getItem(LLAVE);
    if (!raw) return { entradas: [], grupos: [], perfil: PERFIL_INICIAL, preferencias: PREFERENCIAS_INICIALES };
    const p = JSON.parse(raw) as Partial<Guardado>;
    const entradas = (p.entradas ?? []).map(e => {
      const raw = e as unknown as Record<string, unknown>;
      return {
        ...e,
        listaId: raw.listaId ?? null,
        puntuacion: raw.puntuacion ?? 0,
        notas: raw.notas ?? "",
        fechaInicio: raw.fechaInicio ?? "",
        fechaFin: raw.fechaFin ?? "",
        urlRespaldo: raw.urlRespaldo ?? null,
      };
    }) as Entrada[];
    return {
      entradas,
      grupos: (p.grupos ?? []).map(g => ({ ...g, portada: g.portada ?? "", externos: g.externos ?? [] })),
      perfil: { ...PERFIL_INICIAL, ...(p.perfil ?? {}) },
      preferencias: { ...PREFERENCIAS_INICIALES, ...(p.preferencias ?? {}) },
    };
  } catch {
    return { entradas: [], grupos: [], perfil: PERFIL_INICIAL, preferencias: PREFERENCIAS_INICIALES };
  }
}

/** Convierte una entrada del backend al formato local */
function deBackendAEntrada(l: ListaEntrada): Entrada {
  const datos = l.datosJson as Record<string, unknown>;
  const images = datos?.images as Record<string, Record<string, string>> | undefined;
  const img = images?.jpg?.large_image_url || images?.jpg?.image_url || "";
  const title = (datos?.title as string) || "";
  const type = (datos?.type as string) || "";
  const episodes = (datos?.episodes as number) ?? null;
  const chapters = (datos?.chapters as number) ?? null;
  const total = l.medio === "anime" ? episodes : chapters;

  return {
    listaId: l.id,
    id: Number(l.tenraiId),
    medio: l.medio as Medio,
    titulo: title,
    img,
    tipo: type,
    estado: l.estado as Estado,
    progreso: l.progreso,
    total,
    favorito: l.favorito,
    puntuacion: l.puntuacion,
    notas: l.notas ?? "",
    fechaInicio: l.fechaInicio ?? "",
    fechaFin: l.fechaFin ?? "",
    agregado: l.creadoEn,
    orden: l.orden,
    etiquetas: l.etiquetas,
    urlRespaldo: l.urlRespaldo,
  };
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const inicial = useMemo(leer, []);
  const [entradas, setEntradas] = useState<Entrada[]>(inicial.entradas);
  const [grupos, setGrupos] = useState<Grupo[]>(inicial.grupos);
  const [perfil, setPerfilEstado] = useState<Perfil>(inicial.perfil);
  const [preferencias, setPreferenciasEstado] = useState<Preferencias>(inicial.preferencias);

  // Persistir a localStorage como caché offline
  useEffect(() => {
    localStorage.setItem(LLAVE, JSON.stringify({ entradas, grupos, perfil, preferencias }));
  }, [entradas, grupos, perfil, preferencias]);

  const clave = useCallback((medio: Medio, id: number) => `${medio}:${id}`, []);

  const sincronizarConAuth = useCallback((u: { nombre: string; correo: string; avatar: string | null; preferencias: { sfw: boolean } | null }) => {
    setPerfilEstado({ nombre: u.nombre, correo: u.correo, avatar: u.avatar ?? "" });
    if (u.preferencias) setPreferenciasEstado({ sfw: u.preferencias.sfw });
  }, []);

  /** Cargar todas las listas del backend y reemplazar el estado local */
  const sincronizarConBackend = useCallback(async () => {
    try {
      const listas = await obtenerListas();
      const entradasBackend = listas.map(deBackendAEntrada);
      setEntradas(entradasBackend);
    } catch {
      // Si el backend no responde, mantener datos de localStorage
      console.warn("No se pudo sincronizar con el backend, usando caché local");
    }
  }, []);

  /** Agregar contenido a la lista (optimistic + backend) */
  const agregar = useCallback(async (item: CatalogoItem, medio: Medio, estado?: Estado) => {
    const porDefecto: Estado = estado ?? (medio === "anime" ? "por-ver" : "por-leer");

    // Optimistic update
    const nuevaEntrada: Entrada = {
      listaId: null,
      id: item.id,
      medio,
      titulo: item.title,
      img: item.img,
      tipo: item.type,
      estado: porDefecto,
      progreso: 0,
      total: item.total,
      favorito: false,
      puntuacion: 0,
      notas: "",
      fechaInicio: "",
      fechaFin: "",
      agregado: new Date().toISOString(),
      orden: 0,
      etiquetas: item.genres,
      urlRespaldo: null,
    };

    setEntradas(prev => {
      if (prev.some(e => e.medio === medio && e.id === item.id)) return prev;
      return [...prev, nuevaEntrada];
    });

    // Backend call
    try {
      const payload: CrearListaPayload = {
        tenraiId: String(item.id),
        medio,
        estado: porDefecto,
        etiquetas: item.genres,
        datosCatalogo: item as unknown as Record<string, unknown>,
      };
      const resultado = await agregarALista(payload);

      // Actualizar con el ID del backend y la URL de respaldo
      setEntradas(prev =>
        prev.map(e =>
          e.medio === medio && e.id === item.id
            ? { ...e, listaId: resultado.id, urlRespaldo: resultado.urlRespaldo }
            : e,
        ),
      );
    } catch (err) {
      console.error("Error agregando al backend:", err);
      // Revertir optimistic update si falla
      setEntradas(prev => prev.filter(e => !(e.medio === medio && e.id === item.id)));
    }
  }, []);

  /** Quitar contenido de la lista (optimistic + backend) */
  const quitar = useCallback(async (medio: Medio, id: number) => {
    const entrada = entradas.find(e => e.medio === medio && e.id === id);

    // Optimistic update
    setEntradas(prev => prev.filter(e => !(e.medio === medio && e.id === id)));

    // Backend call
    if (entrada?.listaId) {
      try {
        await eliminarDeLista(entrada.listaId);
      } catch (err) {
        console.error("Error eliminando del backend:", err);
        // Revertir si falla
        if (entrada) setEntradas(prev => [...prev, entrada]);
      }
    }
  }, [entradas]);

  /** Actualizar una entrada (optimistic + backend) */
  const actualizar = useCallback(async (medio: Medio, id: number, cambios: Partial<Entrada>) => {
    const entrada = entradas.find(e => e.medio === medio && e.id === id);
    if (!entrada) return;

    // Optimistic update
    setEntradas(prev =>
      prev.map(e => (e.medio === medio && e.id === id ? { ...e, ...cambios } : e)),
    );

    // Backend call
    if (entrada.listaId) {
      try {
        const payload: ActualizarListaPayload = {};
        if (cambios.estado !== undefined) payload.estado = cambios.estado;
        if (cambios.progreso !== undefined) payload.progreso = cambios.progreso;
        if (cambios.favorito !== undefined) payload.favorito = cambios.favorito;
        if (cambios.puntuacion !== undefined) payload.puntuacion = cambios.puntuacion;
        if (cambios.notas !== undefined) payload.notas = cambios.notas;
        if (cambios.fechaInicio !== undefined) payload.fechaInicio = cambios.fechaInicio;
        if (cambios.fechaFin !== undefined) payload.fechaFin = cambios.fechaFin;
        if (cambios.orden !== undefined) payload.orden = cambios.orden;
        if (cambios.etiquetas !== undefined) payload.etiquetas = cambios.etiquetas;

        await actualizarLista(entrada.listaId, payload);
      } catch (err) {
        console.error("Error actualizando en backend:", err);
        // Revertir optimistic update
        setEntradas(prev =>
          prev.map(e => (e.medio === medio && e.id === id ? entrada : e)),
        );
      }
    }
  }, [entradas]);

  const reordenar = useCallback((medio: Medio, _estado: Estado | "todos", clavesOrdenadas: string[]) => {
    setEntradas(prev =>
      prev.map(e => {
        const i = clavesOrdenadas.indexOf(`${e.medio}:${e.id}`);
        return e.medio === medio && i !== -1 ? { ...e, orden: i } : e;
      }),
    );
  }, []);

  const crearGrupo = useCallback((g: Omit<Grupo, "id" | "creado" | "listas" | "externos">) => {
    setGrupos(prev => [
      ...prev,
      { ...g, id: crypto.randomUUID(), creado: new Date().toISOString(), listas: [], externos: [] },
    ]);
  }, []);

  const actualizarGrupo = useCallback((id: string, cambios: Partial<Grupo>) => {
    setGrupos(prev => prev.map(g => (g.id === id ? { ...g, ...cambios } : g)));
  }, []);

  const eliminarGrupo = useCallback((id: string) => {
    setGrupos(prev => prev.filter(g => g.id !== id));
  }, []);

  const setPerfil = useCallback((p: Partial<Perfil>) => {
    setPerfilEstado(prev => ({ ...prev, ...p }));
  }, []);

  const setPreferencias = useCallback((p: Partial<Preferencias>) => {
    setPreferenciasEstado(prev => ({ ...prev, ...p }));
  }, []);

  const reemplazarTodo = useCallback((datos: { entradas?: Entrada[]; grupos?: Grupo[] }) => {
    if (datos.entradas) setEntradas(datos.entradas);
    if (datos.grupos) setGrupos(datos.grupos);
  }, []);

  const valor: BibliotecaCtx = useMemo(() => ({
    entradas,
    grupos,
    perfil,
    clave,
    enBiblioteca: (medio, id) => entradas.find(e => e.medio === medio && e.id === id),
    agregar,
    quitar,
    actualizar,
    reordenar,
    crearGrupo,
    actualizarGrupo,
    eliminarGrupo,
    setPerfil,
    sincronizarConAuth,
    sincronizarConBackend,
    preferencias,
    setPreferencias,
    reemplazarTodo,
  }), [
    entradas, grupos, perfil, clave, agregar, quitar, actualizar,
    reordenar, crearGrupo, actualizarGrupo, eliminarGrupo,
    setPerfil, sincronizarConAuth, sincronizarConBackend,
    preferencias, setPreferencias, reemplazarTodo,
  ]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useBiblioteca() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBiblioteca debe usarse dentro de <BibliotecaProvider>");
  return ctx;
}

// ─── Etiquetas de estado por medio ───────────────────────────────────────────

export const ESTADOS_ANIME: { valor: EstadoAnime; etiqueta: string }[] = [
  { valor: "viendo", etiqueta: "Viendo" },
  { valor: "por-ver", etiqueta: "Por ver" },
  { valor: "completado", etiqueta: "Completado" },
  { valor: "pausado", etiqueta: "Pausado" },
  { valor: "descartado", etiqueta: "Descartado" },
];

export const ESTADOS_MANGA: { valor: EstadoManga; etiqueta: string }[] = [
  { valor: "leyendo", etiqueta: "Leyendo" },
  { valor: "por-leer", etiqueta: "Por leer" },
  { valor: "completado", etiqueta: "Completado" },
  { valor: "pausado", etiqueta: "Pausado" },
  { valor: "descartado", etiqueta: "Descartado" },
];
