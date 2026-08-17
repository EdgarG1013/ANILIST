// ─── Cliente de la API pública Jikan (v4) ─────────────────────────────────────
// Usado por el panel de usuario para el catálogo de anime y manga.
// Si Jikan no responde, cae a un catálogo local de respaldo (catalogoLocal).

import { catalogoLocal } from "./catalogoLocal";

const BASE = "https://api.jikan.moe/v4";

export type Medio = "anime" | "manga";

export interface CatalogoItem {
  id: number;
  title: string;
  img: string;
  type: string;
  year: number | null;
  score: number | null;
  status: string;
  genres: string[];
  synopsis: string | null;
  /** Episodios (anime) o capítulos (manga) */
  total: number | null;
}

export interface CatalogoRespuesta {
  items: CatalogoItem[];
  paginaActual: number;
  ultimaPagina: number;
  total: number;
}

export interface CatalogoFiltros {
  medio: Medio;
  q?: string;
  letra?: string;
  tipo?: string;
  genero?: string;
  anio?: string;
  estado?: string;
  orden?: string;
  pagina?: number;
}

/** Tipos disponibles por medio */
export const TIPOS: Record<Medio, string[]> = {
  anime: ["TV", "Movie", "OVA", "ONA", "Special", "Music"],
  manga: ["Manga", "Novel", "Lightnovel", "Oneshot", "Doujin", "Manhwa", "Manhua"],
};

/** Estados disponibles por medio (valores que acepta Jikan) */
export const ESTADOS: Record<Medio, { valor: string; etiqueta: string }[]> = {
  anime: [
    { valor: "airing", etiqueta: "En emisión" },
    { valor: "complete", etiqueta: "Finalizado" },
    { valor: "upcoming", etiqueta: "Próximamente" },
  ],
  manga: [
    { valor: "publishing", etiqueta: "En publicación" },
    { valor: "complete", etiqueta: "Finalizado" },
    { valor: "upcoming", etiqueta: "Próximamente" },
  ],
};

/** Géneros más usados (mal_id de Jikan, compartidos entre anime y manga) */
export const GENEROS: { id: number; nombre: string }[] = [
  { id: 1, nombre: "Acción" },
  { id: 2, nombre: "Aventura" },
  { id: 4, nombre: "Comedia" },
  { id: 8, nombre: "Drama" },
  { id: 10, nombre: "Fantasía" },
  { id: 7, nombre: "Misterio" },
  { id: 22, nombre: "Romance" },
  { id: 24, nombre: "Sci-Fi" },
  { id: 36, nombre: "Recuentos de la vida" },
  { id: 30, nombre: "Deportes" },
  { id: 37, nombre: "Sobrenatural" },
  { id: 41, nombre: "Suspenso" },
];

export const ANIOS: number[] = Array.from({ length: 37 }, (_, i) => 2026 - i);

export const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Ordenamientos soportados por el catálogo */
export const ORDENES = [
  { valor: "", etiqueta: "Predeterminado" },
  { valor: "score:desc", etiqueta: "Mejor puntuados" },
  { valor: "popularity:asc", etiqueta: "Más populares" },
  { valor: "title:asc", etiqueta: "Título (A-Z)" },
  { valor: "title:desc", etiqueta: "Título (Z-A)" },
  { valor: "start_date:desc", etiqueta: "Más recientes" },
];

interface JikanEntrada {
  mal_id: number;
  title: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  type?: string | null;
  year?: number | null;
  aired?: { prop?: { from?: { year?: number | null } } };
  published?: { prop?: { from?: { year?: number | null } } };
  score?: number | null;
  status?: string | null;
  genres?: { name: string }[];
  themes?: { name: string }[];
  synopsis?: string | null;
  episodes?: number | null;
  chapters?: number | null;
}

function normalizar(e: JikanEntrada, medio: Medio): CatalogoItem {
  return {
    id: e.mal_id,
    title: e.title,
    img: e.images?.jpg?.large_image_url || e.images?.jpg?.image_url || "",
    type: e.type || (medio === "anime" ? "TV" : "Manga"),
    year: e.year ?? e.aired?.prop?.from?.year ?? e.published?.prop?.from?.year ?? null,
    score: e.score ?? null,
    status: e.status || "",
    genres: [...(e.genres || []), ...(e.themes || [])].map(g => g.name),
    synopsis: e.synopsis ?? null,
    total: medio === "anime" ? e.episodes ?? null : e.chapters ?? null,
  };
}

// Jikan limita a ~3 peticiones por segundo: encolamos y reintentamos ante 429.
let cola: Promise<unknown> = Promise.resolve();
const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));

async function pedir(url: string, intentos = 3): Promise<Response> {
  const ejecutar = async (): Promise<Response> => {
    for (let i = 0; i < intentos; i++) {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (res.status === 429 || res.status === 504) {
        await esperar(900 * (i + 1));
        continue;
      }
      return res;
    }
    return fetch(url, { signal: AbortSignal.timeout(12000) });
  };
  const siguiente = cola.then(ejecutar);
  cola = siguiente.then(() => esperar(400), () => esperar(400));
  return siguiente;
}

/** Consulta el catálogo con filtros y paginación */
export async function buscarCatalogo(f: CatalogoFiltros): Promise<CatalogoRespuesta> {

  const p = new URLSearchParams();
  p.set("page", String(f.pagina || 1));
  p.set("limit", "20");
  p.set("sfw", "true");
  if (f.q) p.set("q", f.q);
  if (f.letra) p.set("letter", f.letra);
  if (f.tipo) p.set("type", f.tipo.toLowerCase());
  if (f.genero) p.set("genres", f.genero);
  if (f.estado) p.set("status", f.estado);
  if (f.anio) {
    p.set("start_date", `${f.anio}-01-01`);
    p.set("end_date", `${f.anio}-12-31`);
  }
  if (f.orden) {
    const [by, dir] = f.orden.split(":");
    p.set("order_by", by);
    p.set("sort", dir);
  }

  try {
    const res = await pedir(`${BASE}/${f.medio}?${p.toString()}`);
    if (!res.ok) throw new Error(`Jikan respondió ${res.status}`);
    const json = (await res.json()) as {
      data: JikanEntrada[];
      pagination?: { current_page?: number; last_visible_page?: number; items?: { total?: number } };
    };

    return {
      items: (json.data || []).map(e => normalizar(e, f.medio)),
      paginaActual: json.pagination?.current_page ?? 1,
      ultimaPagina: Math.min(json.pagination?.last_visible_page ?? 1, 100),
      total: json.pagination?.items?.total ?? (json.data || []).length,
    };
  } catch {
    // Jikan no disponible (red, 429/504, caída de MyAnimeList…): respaldo local.
    return catalogoLocal(f);
  }
}
