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
}

const LLAVE = "anilist:biblioteca:v1";

const Ctx = createContext<BibliotecaCtx | null>(null);

const PERFIL_INICIAL: Perfil = {
  nombre: "Edgar Stiven",
  avatar: "",
  correo: "edgar@anilist.app",
};

interface Guardado {
  entradas: Entrada[];
  grupos: Grupo[];
  perfil: Perfil;
}

function leer(): Guardado {
  if (typeof window === "undefined") return { entradas: [], grupos: [], perfil: PERFIL_INICIAL };
  try {
    const raw = localStorage.getItem(LLAVE);
    if (!raw) return { entradas: [], grupos: [], perfil: PERFIL_INICIAL };
    const p = JSON.parse(raw) as Partial<Guardado>;
    return {
      entradas: p.entradas ?? [],
      grupos: p.grupos ?? [],
      perfil: { ...PERFIL_INICIAL, ...(p.perfil ?? {}) },
    };
  } catch {
    return { entradas: [], grupos: [], perfil: PERFIL_INICIAL };
  }
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const inicial = useMemo(leer, []);
  const [entradas, setEntradas] = useState<Entrada[]>(inicial.entradas);
  const [grupos, setGrupos] = useState<Grupo[]>(inicial.grupos);
  const [perfil, setPerfilEstado] = useState<Perfil>(inicial.perfil);

  useEffect(() => {
    localStorage.setItem(LLAVE, JSON.stringify({ entradas, grupos, perfil }));
  }, [entradas, grupos, perfil]);

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
