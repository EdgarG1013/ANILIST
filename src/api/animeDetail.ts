// ─── Tipos de datos para la página de detalle de anime ───────────────────────
// Reutiliza AnimeCard (definido en ./anime) para las secciones relacionadas.

import type { AnimeCard } from "./anime";
import { pedirJikan } from "./jikanClient";

/** Personaje del anime con su actor de doblaje japonés */
export interface Personaje {
  nombre: string;
  rol: string;
  img?: string;
  seiyuu?: string;
}

/** Episodio individual del anime */
export interface Episodio {
  num: number;
  titulo: string;
  fecha: string;
}

/** Plataforma de streaming o enlace externo */
export interface LinkExterno {
  nombre: string;
  url: string;
}

/** Datos completos de un anime para la página de detalle.
 *  Incluye información extra de la API de Jikan (votos, ranking, popularidad,
 *  clasificación, duración, fuente, estado) que no estaban en sorai. */
export interface AnimeDetalle {
  id: number;
  titulo: string;
  tituloIngles?: string;
  score: number;
  votos: number;
  rank: number;
  popularidad: number;
  tipo: string;
  year: number;
  estudio: string;
  eps: number;
  estado: string;
  fuente: string;
  clasificacion: string;
  duracion: string;
  generos: string[];
  sinopsis: string;
  img: string;
  banner: string;
  trailerYtId?: string;
  openings: string[];
  endings: string[];
  personajes: Personaje[];
  episodios: Episodio[];
  relacionados: AnimeCard[];
  similares: AnimeCard[];
  streaming: LinkExterno[];
  externales: LinkExterno[];
}

// ─── Detalle en vivo desde la API (Tenrai / Jikan v4) ────────────────────────

interface ApiNamed { mal_id: number; name: string; type?: string }

interface ApiAnime {
  mal_id: number;
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  score?: number | null;
  scored_by?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  type?: string | null;
  year?: number | null;
  episodes?: number | null;
  status?: string | null;
  source?: string | null;
  rating?: string | null;
  duration?: string | null;
  synopsis?: string | null;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  trailer?: { youtube_id?: string | null };
  aired?: { prop?: { from?: { year?: number | null } } };
  studios?: ApiNamed[];
  genres?: ApiNamed[];
  themes?: ApiNamed[];
  demographics?: ApiNamed[];
  theme?: { openings?: string[]; endings?: string[] };
  streaming?: { name?: string; url?: string }[];
  external?: { name?: string; url?: string }[];
}

interface ApiCharacter {
  character?: { mal_id?: number; name?: string; images?: { jpg?: { image_url?: string } } };
  role?: string;
  voice_actors?: { person?: { name?: string } }[];
}

interface ApiEpisode { mal_id?: number; title?: string; aired?: string | null }

interface ApiRelation { relation?: string; entry?: { mal_id?: number; type?: string; name?: string; url?: string }[] }

interface ApiRecommendation { entry?: { mal_id?: number; images?: { jpg?: { large_image_url?: string; image_url?: string } }; title?: string } }

function mapearDetalle(a: ApiAnime): AnimeDetalle {
  const img = a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || "";
  const generos = [
    ...(a.genres || []),
    ...(a.themes || []),
    ...(a.demographics || []),
  ].map(g => g.name);

  return {
    id: a.mal_id,
    titulo: a.title,
    tituloIngles: a.title_english ?? undefined,
    score: a.score ?? 0,
    votos: a.scored_by ?? 0,
    rank: a.rank ?? 0,
    popularidad: a.popularity ?? 0,
    tipo: a.type ?? "TV",
    year: a.year ?? a.aired?.prop?.from?.year ?? 0,
    estudio: (a.studios || [])[0]?.name ?? "",
    eps: a.episodes ?? 0,
    estado: a.status ?? "",
    fuente: a.source ?? "",
    clasificacion: a.rating ?? "",
    duracion: a.duration ?? "",
    generos,
    sinopsis: a.synopsis ?? "Sin sinopsis disponible.",
    img,
    banner: img,
    trailerYtId: a.trailer?.youtube_id ?? undefined,
    openings: a.theme?.openings ?? [],
    endings: a.theme?.endings ?? [],
    personajes: [],
    episodios: [],
    relacionados: [],
    similares: [],
    streaming: (a.streaming || []).map(s => ({ nombre: s.name ?? "", url: s.url ?? "" })),
    externales: (a.external || []).map(e => ({ nombre: e.name ?? "", url: e.url ?? "" })),
  };
}

/**
 * Obtiene los detalles completos de un anime desde la API.
 * Consulta /full, /characters, /episodes, /relations y /recommendations.
 * Si la API falla, cae a los datos hardcodeados (si existen) o lanza.
 */
export async function obtenerDetalleApi(id: number): Promise<AnimeDetalle> {
  try {
    const [{ data: base }, { data: personajes }, { data: episodios }, { data: relaciones }, { data: recomendaciones }] =
      await Promise.all([
        pedirJikan<{ data: ApiAnime }>(`/anime/${id}/full`),
        pedirJikan<{ data: ApiCharacter[] }>(`/anime/${id}/characters`),
        pedirJikan<{ data: ApiEpisode[] }>(`/anime/${id}/episodes`),
        pedirJikan<{ data: ApiRelation[] }>(`/anime/${id}/relations`),
        pedirJikan<{ data: ApiRecommendation[] }>(`/anime/${id}/recommendations`),
      ]);

    const detalle = mapearDetalle(base);

    detalle.personajes = (personajes || []).slice(0, 12).map(c => ({
      nombre: c.character?.name ?? "Personaje",
      rol: c.role ?? "",
      img: c.character?.images?.jpg?.image_url,
      seiyuu: c.voice_actors?.[0]?.person?.name,
    }));

    detalle.episodios = (episodios || []).map(ep => ({
      num: ep.mal_id ?? 0,
      titulo: ep.title ?? `Episodio ${ep.mal_id ?? ""}`,
      fecha: ep.aired ?? "",
    }));

    detalle.relacionados = await Promise.all(
      (relaciones || [])
        .flatMap(r => (r.entry || []).filter(e => e.type === "anime").map(e => e.mal_id))
        .filter((v): v is number => v != null && v > 0)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 8)
        .map(async id => {
          try {
            const { data: rel } = await pedirJikan<{ data: ApiAnime }>(`/anime/${id}`);
            return {
              id,
              title: rel.title || "Sin título",
              year: rel.year ?? rel.aired?.prop?.from?.year ?? 0,
              score: rel.score ?? 0,
              type: rel.type || "TV",
              img: rel.images?.jpg?.large_image_url || rel.images?.jpg?.image_url || "",
            };
          } catch {
            return { id, title: "", year: 0, score: 0, type: "TV", img: "" };
          }
        }),
    );
    detalle.relacionados = detalle.relacionados.filter(r => r.img);

    detalle.similares = await Promise.all(
      (recomendaciones || [])
        .map(r => r.entry?.mal_id)
        .filter((v): v is number => v != null && v > 0)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 8)
        .map(async id => {
          try {
            const { data: rec } = await pedirJikan<{ data: ApiAnime }>(`/anime/${id}`);
            return {
              id,
              title: rec.title || "Sin título",
              year: rec.year ?? rec.aired?.prop?.from?.year ?? 0,
              score: rec.score ?? 0,
              type: rec.type || "TV",
              img: rec.images?.jpg?.large_image_url || rec.images?.jpg?.image_url || "",
            };
          } catch {
            return { id, title: "", year: 0, score: 0, type: "TV", img: "" };
          }
        }),
    );

    return detalle;
  } catch {
    throw new Error("No se pudieron cargar los detalles del anime");
  }
}
