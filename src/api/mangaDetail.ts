// ─── Tipos y datos para la página de detalle de manga ────────────────────────
// Reutiliza AnimeCard (definido en ./anime) para las secciones relacionadas.

import type { AnimeCard } from "./anime";
import { pedirJikan } from "./jikanClient";

/** Datos completos de un manga para su página de detalle. */
export interface MangaDetalle {
  id: number;
  titulo: string;
  tituloIngles?: string;
  tituloJapones?: string;
  score: number;
  votos: number;
  rank: number;
  popularidad: number;
  tipo: string;
  year: number;
  volumenes: number;
  capitulos: number;
  estado: string;
  fuente: string;
  generos: string[];
  sinopsis: string;
  img: string;
  autores: string[];
  relacionados: AnimeCard[];
  similares: AnimeCard[];
}

interface ApiNamed { mal_id: number; name: string; type?: string }

interface ApiManga {
  mal_id: number;
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  score?: number | null;
  scored_by?: number | null;
  rank?: number | null;
  popularity?: number | null;
  type?: string | null;
  published?: { prop?: { from?: { year?: number | null } } };
  volumes?: number | null;
  chapters?: number | null;
  status?: string | null;
  synopsis?: string | null;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  genres?: ApiNamed[];
  themes?: ApiNamed[];
  demographics?: ApiNamed[];
  authors?: { person?: { name?: string } }[];
}

interface ApiRecommendation { entry?: { mal_id?: number; images?: { jpg?: { large_image_url?: string; image_url?: string } }; title?: string } }

function mapearManga(m: ApiManga): MangaDetalle {
  const img = m.images?.jpg?.large_image_url || m.images?.jpg?.image_url || "";
  return {
    id: m.mal_id,
    titulo: m.title,
    tituloIngles: m.title_english ?? undefined,
    tituloJapones: m.title_japanese ?? undefined,
    score: m.score ?? 0,
    votos: m.scored_by ?? 0,
    rank: m.rank ?? 0,
    popularidad: m.popularity ?? 0,
    tipo: m.type ?? "Manga",
    year: m.published?.prop?.from?.year ?? 0,
    volumenes: m.volumes ?? 0,
    capitulos: m.chapters ?? 0,
    estado: m.status ?? "",
    fuente: "Manga",
    generos: [...(m.genres || []), ...(m.themes || []), ...(m.demographics || [])].map(g => g.name),
    sinopsis: m.synopsis ?? "Sin sinopsis disponible.",
    img,
    autores: (m.authors || []).map(a => a.person?.name ?? "").filter(Boolean),
    relacionados: [],
    similares: [],
  };
}

/**
 * Obtiene los detalles completos de un manga desde la API.
 * Consulta /manga/{id}/full y /manga/{id}/recommendations.
 */
export async function obtenerMangaDetalleApi(id: number): Promise<MangaDetalle> {
  const [{ data: base }, { data: recomendaciones }] = await Promise.all([
    pedirJikan<{ data: ApiManga }>(`/manga/${id}/full`),
    pedirJikan<{ data: ApiRecommendation[] }>(`/manga/${id}/recommendations`),
  ]);

  const detalle = mapearManga(base);

  detalle.similares = (recomendaciones || []).slice(0, 8).map(r => ({
    id: r.entry?.mal_id ?? 0,
    title: r.entry?.title ?? "",
    year: 0,
    score: 0,
    type: "Manga",
    img: r.entry?.images?.jpg?.large_image_url || r.entry?.images?.jpg?.image_url || "",
  }));

  return detalle;
}