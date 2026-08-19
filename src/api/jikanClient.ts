// ─── Cliente de la API pública Jikan (v4) ─────────────────────────────────────
// Usado por el panel de usuario para el catálogo de anime y manga.
// Nota: usa el endpoint de Tenrai (https://api.tenrai.org/v1), un mirror de la
// API de Jikan con la misma forma de respuestas, porque api.jikan.moe está
// devolviendo 504 (caída de MyAnimeList) y será descontinuado en oct 2026.
// Si la API no responde, cae a un catálogo local de respaldo (catalogoLocal).

import { catalogoLocal } from "./catalogoLocal";

const BASE = "https://api.tenrai.org/v1";

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
  temporada?: string;
  estado?: string;
  orden?: string;
  pagina?: number;
  /** Si es false, no se filtra por contenido seguro (muestra títulos para adultos) */
  sfw?: boolean;
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

/** Temporadas del año (valores que acepta Jikan en /seasons) */
export const TEMPORADAS: { valor: string; etiqueta: string; meses: [number, number] }[] = [
  { valor: "winter", etiqueta: "Invierno", meses: [1, 3] },
  { valor: "spring", etiqueta: "Primavera", meses: [4, 6] },
  { valor: "summer", etiqueta: "Verano", meses: [7, 9] },
  { valor: "fall", etiqueta: "Otoño", meses: [10, 12] },
];

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

// Jikan limita a ~3 peticiones por segundo: encolamos y reintentamos ante 429/5xx.
let cola: Promise<unknown> = Promise.resolve();
const esperar = (ms: number) => new Promise(r => setTimeout(r, ms));

const MAX_INTENTOS = 3;
const REINTENTABLES = [429, 503, 504];

/**
 * Realiza una petición con límite de ritmo y reintentos con backoff.
 * Devuelve la respuesta JSON tipada o lanza si la API no responde tras los
 * reintentos. Expuesto para que otras partes de la app (detalle de anime,
 * etc.) reutilicen la misma cola de rate-limit.
 */
export async function pedirJikan<T>(endpoint: string): Promise<T> {
  const ejecutar = async (): Promise<T> => {
    for (let i = 0; i < MAX_INTENTOS; i++) {
      const res = await fetch(`${BASE}${endpoint}`, {
        signal: AbortSignal.timeout(15000),
      });

      if (REINTENTABLES.includes(res.status) && i < MAX_INTENTOS - 1) {
        await esperar(1000 * Math.pow(2, i)); // 1s, 2s
        continue;
      }

      if (!res.ok) throw new Error(`Jikan respondió ${res.status}`);
      return (await res.json()) as T;
    }

    throw new Error("La API no respondió tras los reintentos");
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
  p.set("sfw", f.sfw === false ? "false" : "true");
  if (f.q) p.set("q", f.q);
  if (f.letra) p.set("letter", f.letra);
  if (f.tipo) p.set("type", f.tipo.toLowerCase());
  if (f.genero) p.set("genres", f.genero);
  if (f.estado) p.set("status", f.estado);
  if (f.anio || f.temporada) {
    const anio = f.anio ? Number(f.anio) : new Date().getFullYear();
    const temp = TEMPORADAS.find(t => t.valor === f.temporada);
    if (temp) {
      const [m1, m2] = temp.meses;
      const diaFin = new Date(anio, m2, 0).getDate(); // último día del mes
      p.set("start_date", `${anio}-${String(m1).padStart(2, "0")}-01`);
      p.set("end_date", `${anio}-${String(m2).padStart(2, "0")}-${String(diaFin).padStart(2, "0")}`);
    } else {
      p.set("start_date", `${anio}-01-01`);
      p.set("end_date", `${anio}-12-31`);
    }
  }
  if (f.orden) {
    const [by, dir] = f.orden.split(":");
    p.set("order_by", by);
    p.set("sort", dir);
  }

  try {
    const json = await pedirJikan<{
      data: JikanEntrada[];
      pagination?: { current_page?: number; last_visible_page?: number; items?: { total?: number } };
    }>(`/${f.medio}?${p.toString()}`);

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

export type Temporada = "winter" | "spring" | "summer" | "fall";

/**
 * Consulta el catálogo de una temporada y año concretos (p. ej. 2026/winter).
 * Usa el endpoint /seasons/{year}/{season} de Jikan/Tenrai.
 */
export async function buscarPorTemporada(
  anio: number,
  temporada: Temporada,
  pagina = 1,
  sfw = true,
): Promise<CatalogoRespuesta> {
  const p = new URLSearchParams();
  p.set("page", String(pagina));
  p.set("limit", "20");
  p.set("sfw", sfw ? "true" : "false");

  try {
    const json = await pedirJikan<{
      data: JikanEntrada[];
      pagination?: { current_page?: number; last_visible_page?: number; items?: { total?: number } };
    }>(`/seasons/${anio}/${temporada}?${p.toString()}`);

    return {
      items: (json.data || []).map(e => normalizar(e, "anime")),
      paginaActual: json.pagination?.current_page ?? 1,
      ultimaPagina: Math.min(json.pagination?.last_visible_page ?? 1, 100),
      total: json.pagination?.items?.total ?? (json.data || []).length,
    };
  } catch {
    // Fallback local basado en el año (no hay datos por temporada en el respaldo).
    return catalogoLocal({ medio: "anime", anio: String(anio), pagina, sfw });
  }
}

// ─── Noticias de la industria (API Tenrai / Jikan) ───────────────────────────

export interface Noticia {
  id: number;
  titulo: string;
  extracto: string;
  img: string;
  fuente: string;
  fecha: string;
  url: string;
}

interface JikanNoticia {
  mal_id: number;
  title: string;
  excerpt?: string;
  images?: { jpg?: { image_url?: string } };
  author_username?: string;
  date?: string;
  url?: string;
}

/** Devuelve las noticias recientes de la industria (anime/manga) */
export async function obtenerNoticias(cantidad = 5): Promise<Noticia[]> {
  try {
    const json = await pedirJikan<{ data: JikanNoticia[] }>(`/news?limit=${cantidad}`);
    return (json.data || []).map(n => ({
      id: n.mal_id,
      titulo: n.title,
      extracto: n.excerpt ?? "",
      img: n.images?.jpg?.image_url || "",
      fuente: n.author_username || "ANILIST",
      fecha: n.date || "",
      url: n.url || "",
    }));
  } catch {
    return [];
  }
}
