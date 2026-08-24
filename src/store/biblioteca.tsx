import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogoItem, Medio } from "../api/jikanClient";

// ─── Estado global de la biblioteca personal ─────────────────────────────────
// Persistido en localStorage. Guarda entradas (anime/manga), grupos y perfil.

export type EstadoAnime = "viendo" | "por-ver" | "completado" | "pausado" | "descartado";
export type EstadoManga = "leyendo" | "por-leer" | "completado" | "pausado" | "descartado";
export type Estado = EstadoAnime | EstadoManga;

export interface Entrada {
  id: number;
  medio: Medio;
  titulo: string;
  img: string;
  tipo: string;
  estado: Estado;
  progreso: number;
  total: number | null;
  favorito: boolean;
  /** Puntuación personal del 1 al 10 (0 = sin puntuar) */
  puntuacion: number;
  /** Notas personales */
  notas: string;
  /** Fecha de inicio (ISO) */
  fechaInicio: string;
  /** Fecha de finalización (ISO) */
  fechaFin: string;
  /** Fecha (ISO) en la que se agregó a la biblioteca */
  agregado: string;
  /** Posición manual dentro de su estado (menor = más arriba) */
  orden: number;
  etiquetas: string[];
}

export interface ListaPersonalizada {
  id: string;
  nombre: string;
  /** Claves "medio:id" de las entradas incluidas */
  items: string[];
  orden: number;
}

export interface Grupo {
  id: string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
  listas: ListaPersonalizada[];
  creado: string;
}

export interface Perfil {
  nombre: string;
  avatar: string;
  correo: string;
}

/** Preferencias de contenido del panel */
export interface Preferencias {
  /** Si es false, no se filtra por contenido seguro (muestra títulos para adultos) */
  sfw: boolean;
}

interface BibliotecaCtx {
  entradas: Entrada[];
  grupos: Grupo[];
  perfil: Perfil;
  clave: (medio: Medio, id: number) => string;
  enBiblioteca: (medio: Medio, id: number) => Entrada | undefined;
  agregar: (item: CatalogoItem, medio: Medio, estado?: Estado) => void;
  quitar: (medio: Medio, id: number) => void;
  actualizar: (medio: Medio, id: number, cambios: Partial<Entrada>) => void;
  reordenar: (medio: Medio, estado: Estado | "todos", clavesOrdenadas: string[]) => void;
  crearGrupo: (g: Omit<Grupo, "id" | "creado" | "listas">) => void;
  actualizarGrupo: (id: string, cambios: Partial<Grupo>) => void;
  eliminarGrupo: (id: string) => void;
  setPerfil: (p: Partial<Perfil>) => void;
  reemplazarTodo: (datos: { entradas?: Entrada[]; grupos?: Grupo[] }) => void;
  preferencias: Preferencias;
  setPreferencias: (p: Partial<Preferencias>) => void;
}

const LLAVE = "anilist:biblioteca:v1";

const Ctx = createContext<BibliotecaCtx | null>(null);

const PERFIL_INICIAL: Perfil = {
  nombre: "Edgar Stiven",
  avatar: "",
  correo: "edgar@anilist.app",
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
        puntuacion: raw.puntuacion ?? 0,
        notas: raw.notas ?? "",
        fechaInicio: raw.fechaInicio ?? "",
        fechaFin: raw.fechaFin ?? "",
      };
    }) as Entrada[];
    return {
      entradas,
      grupos: p.grupos ?? [],
      perfil: { ...PERFIL_INICIAL, ...(p.perfil ?? {}) },
      preferencias: { ...PREFERENCIAS_INICIALES, ...(p.preferencias ?? {}) },
    };
  } catch {
    return { entradas: [], grupos: [], perfil: PERFIL_INICIAL, preferencias: PREFERENCIAS_INICIALES };
  }
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const inicial = useMemo(leer, []);
  const [entradas, setEntradas] = useState<Entrada[]>(inicial.entradas);
  const [grupos, setGrupos] = useState<Grupo[]>(inicial.grupos);
  const [perfil, setPerfilEstado] = useState<Perfil>(inicial.perfil);
  const [preferencias, setPreferenciasEstado] = useState<Preferencias>(inicial.preferencias);

  useEffect(() => {
    localStorage.setItem(LLAVE, JSON.stringify({ entradas, grupos, perfil, preferencias }));
  }, [entradas, grupos, perfil, preferencias]);

  const clave = (medio: Medio, id: number) => `${medio}:${id}`;

  const valor: BibliotecaCtx = {
    entradas,
    grupos,
    perfil,
    clave,
    enBiblioteca: (medio, id) => entradas.find(e => e.medio === medio && e.id === id),
    agregar: (item, medio, estado) =>
      setEntradas(prev => {
        if (prev.some(e => e.medio === medio && e.id === item.id)) return prev;
        const porDefecto: Estado = estado ?? (medio === "anime" ? "por-ver" : "por-leer");
        return [
          ...prev,
          {
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
            orden: prev.filter(e => e.medio === medio).length,
            etiquetas: [],
          },
        ];
      }),
    quitar: (medio, id) => setEntradas(prev => prev.filter(e => !(e.medio === medio && e.id === id))),
    actualizar: (medio, id, cambios) =>
      setEntradas(prev => prev.map(e => (e.medio === medio && e.id === id ? { ...e, ...cambios } : e))),
    reordenar: (medio, _estado, clavesOrdenadas) =>
      setEntradas(prev =>
        prev.map(e => {
          const i = clavesOrdenadas.indexOf(`${e.medio}:${e.id}`);
          return e.medio === medio && i !== -1 ? { ...e, orden: i } : e;
        }),
      ),
    crearGrupo: g =>
      setGrupos(prev => [
        ...prev,
        { ...g, id: crypto.randomUUID(), creado: new Date().toISOString(), listas: [] },
      ]),
    actualizarGrupo: (id, cambios) =>
      setGrupos(prev => prev.map(g => (g.id === id ? { ...g, ...cambios } : g))),
    eliminarGrupo: id => setGrupos(prev => prev.filter(g => g.id !== id)),
    setPerfil: p => setPerfilEstado(prev => ({ ...prev, ...p })),
    preferencias,
    setPreferencias: p => setPreferenciasEstado(prev => ({ ...prev, ...p })),
    reemplazarTodo: datos => {
      if (datos.entradas) setEntradas(datos.entradas);
      if (datos.grupos) setGrupos(datos.grupos);
    },
  };

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
