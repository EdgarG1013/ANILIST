import type { JikanNamedResource, JikanImages, JikanDate, PopularItem } from "./jikan";

// ─── Tipos de manga (representación de la API de Jikan) ──────────────────────

export interface MangaJikan {
  mal_id: number;
  title: string;
  synopsis: string | null;
  images: JikanImages;
  genres: JikanNamedResource[];
  themes: JikanNamedResource[];
  /** Año de publicación (volúmenes/capítulos) */
  year: number | null;
  published: JikanDate;
  volumes: number | null;
  chapters: number | null;
  score: number;
  type: string;
}

// ─── Adaptador: manga Jikan → item normalizado del carrusel ──────────────────

export function toPopularManga(m: MangaJikan): PopularItem {
  const count = m.volumes ?? m.chapters;
  const countLabel = m.volumes != null ? "volumen" : "capítulo";
  return {
    id: m.mal_id,
    title: m.title,
    synopsis: m.synopsis,
    genres: [
      ...(m.genres || []),
      ...(m.themes || []),
    ].map((g: JikanNamedResource) => g.name),
    year: m.year ?? m.published?.prop?.from?.year ?? null,
    count,
    countLabel,
    img: m.images?.jpg?.large_image_url || m.images?.jpg?.image_url || "",
  };
}

// ─── Top Manga — carrusel de más populares ────────────────────────────────────

export const TOP_MANGA: MangaJikan[] = [
  {
    mal_id: 2,
    title: "Berserk",
    synopsis:
      "Guts, un espadachín maldito marcado con el Brand del Sacrificio, lucha por sobrevivir en un mundo oscuro y brutal. Perseguido por demonios, su destino se entrelaza con el jefe mercenario Griffith y su banda de halcones en una historia de traición, ambición y humanidad.",
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
        small_image_url: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/manga/1/157897.jpg",
      },
    },
    genres: [{ mal_id: 1, name: "Acción", url: "" }, { mal_id: 2, name: "Aventura", url: "" }],
    themes: [{ mal_id: 13, name: "Gore", url: "" }, { mal_id: 25, name: "Fantasy", url: "" }],
    year: 1989,
    published: { prop: { from: { year: 1989 } } },
    volumes: 41,
    chapters: 376,
    score: 9.4,
    type: "Manga",
  },
  {
    mal_id: 1,
    title: "One Piece",
    synopsis:
      "El joven Monkey D. Luffy sueña con convertirse en el Rey de los Piratas y encontrar el legendario tesoro One Piece. Con su tripulación de los Sombrero de Paja navega el Grand Line enfrentando a la Marina, yonko y criaturas imposibles en su búsqueda de libertad.",
    images: {
      jpg: {
        image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        small_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
      },
    },
    genres: [{ mal_id: 1, name: "Acción", url: "" }, { mal_id: 2, name: "Aventura", url: "" }],
    themes: [{ mal_id: 21, name: "Fantasy", url: "" }],
    year: 1997,
    published: { prop: { from: { year: 1997 } } },
    volumes: 111,
    chapters: 1140,
    score: 9.2,
    type: "Manga",
  },
  {
    mal_id: 12,
    title: "Fullmetal Alchemist",
    synopsis:
      "Los hermanos Edward y Alphonse Elric intentan revivir a su madre con alquimia y pagan un precio terrible: Edward pierde su brazo y pierna, Alphonse su cuerpo entero. En busca de la Piedra Filosofal descubren una conspiración que amenaza a toda la nación.",
    images: {
      jpg: {
        image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        small_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
      },
    },
    genres: [{ mal_id: 1, name: "Acción", url: "" }, { mal_id: 2, name: "Aventura", url: "" }],
    themes: [{ mal_id: 10, name: "Drama", url: "" }, { mal_id: 31, name: "Fantasy", url: "" }],
    year: 2001,
    published: { prop: { from: { year: 2001 } } },
    volumes: 27,
    chapters: 116,
    score: 9.3,
    type: "Manga",
  },
  {
    mal_id: 1429,
    title: "Attack on Titan",
    synopsis:
      "En un mundo donde la humanidad vive tras enormes muros para protegerse de los Titanes devoradores de personas, el joven Eren Yeager jura exterminarlos tras ver a su ciudad destruida y a su madre devorada. Una lucha desesperada por la supervivencia.",
    images: {
      jpg: {
        image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        small_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
      },
    },
    genres: [{ mal_id: 1, name: "Acción", url: "" }, { mal_id: 7, name: "Misterio", url: "" }],
    themes: [{ mal_id: 10, name: "Drama", url: "" }, { mal_id: 13, name: "Gore", url: "" }],
    year: 2009,
    published: { prop: { from: { year: 2009 } } },
    volumes: 34,
    chapters: 139,
    score: 8.9,
    type: "Manga",
  },
  {
    mal_id: 11,
    title: "Naruto",
    synopsis:
      "Naruto Uzumaki, un joven ninja rechazado por su aldea por llevar dentro al Zorro de Nueve Colas, sueña con convertirse en Hokage. En su viaje forja lazos inquebrantables y demuestra que la voluntad de no rendirse nunca puede superar cualquier destino.",
    images: {
      jpg: {
        image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        small_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
        large_image_url: "https://img.youtube.com/vi/jVl4bY81iIs/maxresdefault.jpg",
      },
    },
    genres: [{ mal_id: 1, name: "Acción", url: "" }, { mal_id: 2, name: "Aventura", url: "" }],
    themes: [{ mal_id: 27, name: "Comedia", url: "" }],
    year: 1999,
    published: { prop: { from: { year: 1999 } } },
    volumes: 72,
    chapters: 700,
    score: 8.3,
    type: "Manga",
  },
];