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
import {
  obtenerGrupos,
  crearGrupo as crearGrupoApi,
  actualizarGrupo as actualizarGrupoApi,
  eliminarGrupo as eliminarGrupoApi,
  type GrupoEntrada,
} from "../api/grupoService";

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
  portadaUrl: string | null;
  etiquetas: string[];
  listas: ListaPersonalizada[];
  externos: ItemExterno[];
  creadoEn: string;
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
  crearGrupo: (g: Omit<Grupo, "id" | "creadoEn" | "listas" | "externos">) => Promise<void>;
  actualizarGrupo: (id: string, cambios: Partial<Grupo>) => Promise<void>;
  eliminarGrupo: (id: string) => Promise<void>;
  subirPortadaGrupo: (id: string, archivo: File) => Promise<string | null>;
  crearListaGrupo: (grupoId: string, nombre: string) => Promise<void>;
  actualizarListaGrupo: (listaId: string, data: { nombre?: string; orden?: number }) => Promise<void>;
  eliminarListaGrupo: (listaId: string) => Promise<void>;
  agregarItemGrupo: (listaId: string, medio: Medio, tenraiId: string, externo?: ItemExterno) => Promise<void>;
  eliminarItemGrupo: (listaId: string, medio: Medio, tenraiId: string) => Promise<void>;
  agregarExternoGrupo: (grupoId: string, externo: ItemExterno) => Promise<void>;
  eliminarExternoGrupo: (grupoId: string, clave: string) => Promise<void>;
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
      grupos: (p.grupos ?? []).map(g => ({
        ...g,
        portadaUrl: g.portadaUrl ?? null,
        externos: g.externos ?? [],
        creadoEn: g.creadoEn ?? new Date().toISOString(),
      })),
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

/** Convierte un grupo del backend al formato local */
function deBackendAGrupo(g: GrupoEntrada): Grupo {
  return {
    id: g.id,
    titulo: g.titulo,
    descripcion: g.descripcion,
    portadaUrl: g.portadaUrl,
    etiquetas: g.etiquetas,
    listas: g.listas.map(l => ({
      id: l.id,
      nombre: l.nombre,
      orden: l.orden,
      items: l.items.map(i => i.clave),
    })),
    externos: g.externos.map(x => ({
      clave: x.clave,
      id: Number(x.tenraiId),
      medio: x.medio as Medio,
      titulo: x.titulo,
      img: x.img,
      tipo: x.tipo,
    })),
    creadoEn: g.creadoEn,
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
      const [listas, gruposBackend] = await Promise.all([
        obtenerListas(),
        obtenerGrupos(),
      ]);
      const entradasBackend = listas.map(deBackendAEntrada);
      setEntradas(entradasBackend);
      setGrupos(gruposBackend.map(deBackendAGrupo));
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

  const crearGrupo = useCallback(async (g: Omit<Grupo, "id" | "creadoEn" | "listas" | "externos">) => {
    try {
      const nuevo = await crearGrupoApi({
        titulo: g.titulo,
        descripcion: g.descripcion,
        etiquetas: g.etiquetas,
      });
      setGrupos(prev => [...prev, deBackendAGrupo(nuevo)]);
    } catch (err) {
      console.error("Error creando grupo:", err);
    }
  }, []);

  const actualizarGrupo = useCallback(async (id: string, cambios: Partial<Grupo>) => {
    // Optimistic update
    setGrupos(prev => prev.map(g => (g.id === id ? { ...g, ...cambios } : g)));

    try {
      await actualizarGrupoApi(id, {
        titulo: cambios.titulo,
        descripcion: cambios.descripcion,
        etiquetas: cambios.etiquetas,
      });
    } catch (err) {
      console.error("Error actualizando grupo:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const eliminarGrupo = useCallback(async (id: string) => {
    setGrupos(prev => prev.filter(g => g.id !== id));
    try {
      await eliminarGrupoApi(id);
    } catch (err) {
      console.error("Error eliminando grupo:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const subirPortadaGrupo = useCallback(async (id: string, archivo: File): Promise<string | null> => {
    try {
      const { subirPortada } = await import("../api/grupoService");
      const resultado = await subirPortada(id, archivo);
      setGrupos(prev => prev.map(g => (g.id === id ? { ...g, portadaUrl: resultado.portadaUrl } : g)));
      return resultado.portadaUrl;
    } catch (err) {
      console.error("Error subiendo portada:", err);
      return null;
    }
  }, []);

  const crearListaGrupo = useCallback(async (grupoId: string, nombre: string) => {
    try {
      const { crearListaGrupo: crearListaApi } = await import("../api/grupoService");
      const nueva = await crearListaApi(grupoId, { nombre });
      setGrupos(prev => prev.map(g => {
        if (g.id !== grupoId) return g;
        return {
          ...g,
          listas: [...g.listas, { id: nueva.id, nombre: nueva.nombre, orden: nueva.orden, items: [] }],
        };
      }));
    } catch (err) {
      console.error("Error creando lista:", err);
    }
  }, []);

  const actualizarListaGrupo = useCallback(async (listaId: string, data: { nombre?: string; orden?: number }) => {
    setGrupos(prev => prev.map(g => ({
      ...g,
      listas: g.listas.map(l => (l.id === listaId ? { ...l, ...data } : l)),
    })));
    try {
      const { actualizarListaGrupo: actualizarListaApi } = await import("../api/grupoService");
      await actualizarListaApi(listaId, data);
    } catch (err) {
      console.error("Error actualizando lista:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const eliminarListaGrupo = useCallback(async (listaId: string) => {
    setGrupos(prev => prev.map(g => ({
      ...g,
      listas: g.listas.filter(l => l.id !== listaId),
    })));
    try {
      const { eliminarListaGrupo: eliminarListaApi } = await import("../api/grupoService");
      await eliminarListaApi(listaId);
    } catch (err) {
      console.error("Error eliminando lista:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const agregarItemGrupo = useCallback(async (listaId: string, medio: Medio, tenraiId: string, externo?: ItemExterno) => {
    const clave = `${medio}:${tenraiId}`;
    // Optimistic update
    setGrupos(prev => prev.map(g => ({
      ...g,
      listas: g.listas.map(l => (l.id === listaId ? { ...l, items: [...l.items, clave] } : l)),
      externos: externo ? [...g.externos, externo] : g.externos,
    })));
    try {
      const { agregarItemGrupo: agregarItemApi, agregarExternoGrupo: agregarExternoApi } = await import("../api/grupoService");
      if (externo) {
        // Buscar el grupoId de la lista
        const grupo = grupos.find(g => g.listas.some(l => l.id === listaId));
        if (grupo) await agregarExternoApi(grupo.id, externo as any);
      }
      await agregarItemApi(listaId, { medio, tenraiId });
    } catch (err) {
      console.error("Error agregando item:", err);
      sincronizarConBackend();
    }
  }, [grupos, sincronizarConBackend]);

  const eliminarItemGrupo = useCallback(async (listaId: string, medio: Medio, tenraiId: string) => {
    const clave = `${medio}:${tenraiId}`;
    setGrupos(prev => prev.map(g => ({
      ...g,
      listas: g.listas.map(l => (l.id === listaId ? { ...l, items: l.items.filter(i => i !== clave) } : l)),
    })));
    try {
      const { eliminarItemGrupo: eliminarItemApi } = await import("../api/grupoService");
      await eliminarItemApi(listaId, medio, tenraiId);
    } catch (err) {
      console.error("Error eliminando item:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const agregarExternoGrupo = useCallback(async (grupoId: string, externo: ItemExterno) => {
    setGrupos(prev => prev.map(g => {
      if (g.id !== grupoId) return g;
      return { ...g, externos: [...g.externos, externo] };
    }));
    try {
      const { agregarExternoGrupo: agregarExternoApi } = await import("../api/grupoService");
      await agregarExternoApi(grupoId, {
        medio: externo.medio,
        tenraiId: String(externo.id),
        titulo: externo.titulo,
        img: externo.img,
        tipo: externo.tipo,
      });
    } catch (err) {
      console.error("Error agregando externo:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

  const eliminarExternoGrupo = useCallback(async (grupoId: string, clave: string) => {
    setGrupos(prev => prev.map(g => {
      if (g.id !== grupoId) return g;
      return { ...g, externos: g.externos.filter(e => e.clave !== clave) };
    }));
    try {
      const { eliminarExternoGrupo: eliminarExternoApi } = await import("../api/grupoService");
      await eliminarExternoApi(grupoId, clave);
    } catch (err) {
      console.error("Error eliminando externo:", err);
      sincronizarConBackend();
    }
  }, [sincronizarConBackend]);

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
    subirPortadaGrupo,
    crearListaGrupo,
    actualizarListaGrupo,
    eliminarListaGrupo,
    agregarItemGrupo,
    eliminarItemGrupo,
    agregarExternoGrupo,
    eliminarExternoGrupo,
    setPerfil,
    sincronizarConAuth,
    sincronizarConBackend,
    preferencias,
    setPreferencias,
    reemplazarTodo,
  }), [
    entradas, grupos, perfil, clave, agregar, quitar, actualizar,
    reordenar, crearGrupo, actualizarGrupo, eliminarGrupo,
    subirPortadaGrupo, crearListaGrupo, actualizarListaGrupo, eliminarListaGrupo,
    agregarItemGrupo, eliminarItemGrupo, agregarExternoGrupo, eliminarExternoGrupo,
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
