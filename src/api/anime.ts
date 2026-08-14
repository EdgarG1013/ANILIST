// ─── Tipos de datos ───────────────────────────────────────────────────────────

import type { PopularItem } from "./jikan";

/** Anime destacado en el hero / carrusel principal */
export interface HeroAnime {
  id: number;
  title: string;
  altTitle: string;
  score: number;
  type: string;
  year: number;
  studio: string;
  eps: number;
  genres: string[];
  synopsis: string;
  img: string;
}

/** Tarjeta de anime para grids y listas */
export interface AnimeCard {
  id: number;
  title: string;
  year: number;
  score: number;
  type: string;
  img: string;
}

/** Elemento del ranking Top Anime */
export interface TopAnimeItem {
  id: number;
  title: string;
  type: string;
  img: string;
}

/** Anime de la sección "Más populares" con info extendida */
export interface AnimePopular {
  rank: number;
  title: string;
  year: number;
  eps: number;
  type: string;
  genres: string[];
  synopsis: string;
  img: string;
}

/** Adaptador: anime popular → item normalizado del carrusel */
export function toPopularAnime(a: AnimePopular): PopularItem {
  return {
    id: a.rank,
    title: a.title,
    synopsis: a.synopsis,
    genres: a.genres,
    year: a.year,
    count: a.eps,
    countLabel: "episodio",
    img: a.img,
  };
}

// ─── Colores por tipo de anime ────────────────────────────────────────────────

export const TIPO_COLORES: Record<string, string> = {
  TV: "bg-[#6b3fa0]",
  ONA: "bg-[#0097a7]",
  OVA: "bg-[#388e3c]",
  Movie: "bg-[#d97706]",
};

// ─── Hero — carrusel principal ────────────────────────────────────────────────

export const HERO: HeroAnime[] = [
  {
    id: 1,
    title: "Kimetsu no Yaiba",
    altTitle: "Demon Slayer: Kimetsu no Yaiba",
    score: 8.4,
    type: "TV",
    year: 2019,
    studio: "ufotable",
    eps: 26,
    genres: ["Acción", "Premiado", "Sobrenatural", "Histórico"],
    synopsis:
      "Desde la muerte de su padre, la carga de mantener a la familia recae sobre Tanjirou Kamado. Un día, regresa a casa para encontrar a su familia masacrada y a su hermana convertida en demonio. Comienza así su viaje para convertirla de vuelta en humana…",
    img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F9f93c6413e608ae491ba456fac96fb11b04917d1.webp?generation=1786160569298445&alt=media",
  },
  {
    id: 2,
    title: "Re:Zero kara Hajimeru",
    altTitle: "Re:Zero − Starting Life in Another World S4",
    score: 8.8,
    type: "TV",
    year: 2026,
    studio: "White Fox",
    eps: 24,
    genres: ["Drama", "Fantasía", "Suspenso"],
    synopsis:
      "Subaru Natsuki continúa su lucha usando su poder de Regreso por Muerte para proteger a quienes ama. La cuarta temporada eleva las apuestas más que nunca en un mundo lleno de misterios y peligros.",
    img: "https://m.media-amazon.com/images/M/MV5BOTYwZDAzNzYtODc3Zi00ZWM2LThmY2YtNzZhMDA4ZGMyMzZiXkEyXkFqcGc@._V1_.jpg",
  }
];

// ─── En Temporada — grid de anime actuales ────────────────────────────────────

export const TEMPORADA: AnimeCard[] = [
  { id: 59193, title: "Mushoku Tensei III: Isekai Ittara Honki Dasu", year: 2026, score: 8.67, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fd7aab65e2425f63f165f513bfe09a0e34f8f383a.jpg?generation=1786160569274158&alt=media" },
  { id: 49233, title: "Youjo Senki II", year: 2026, score: 8.32, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F526e03ae8b36ae32b0b8528ecaa010ac7184c257.jpg?generation=1786160569444493&alt=media" },
  { id: 62076, title: "Super no Ura de Yani Suu Futari", year: 2026, score: 8.36, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Faaec2ea8243499092d6c1043ab42169cdaac1ea5.jpg?generation=1780550347996002&alt=media" },
  { id: 60636, title: "Bleach: Sennen Kessen-hen - Kashin-tan", year: 2026, score: 9.03, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F33c218901a33c7a3b58abccdabe37414e6122abe.jpg?generation=1786160569464556&alt=media" },
  { id: 63403, title: "Yani Neko", year: 2026, score: 7.05, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F0d510081259d0fa5d8556664e8e3e16205a825ca.jpg?generation=1786160569464197&alt=media" },
  { id: 54000, title: "Otome Game Sekai wa Mob ni Kibishii Sekai desu 2", year: 2026, score: 6.68, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fb82c1dd49ee1b0f5c53ff0164819ecd1fcc6806f.jpg?generation=1786160569509276&alt=media" },
  { id: 62542, title: "Grand Blue Season 3", year: 2026, score: 8.39, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fcbf1677bc9f3ff0c1a90b8f3e35d69d11d6674d5.jpg?generation=1786160569626844&alt=media" },
  { id: 63832, title: "Seihantai na Kimi to Boku 2nd Season", year: 2026, score: 8.42, type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fb84dc3a17c382c9b03f1020d17dfb6f1c9eeb137.jpg?generation=1786160569631433&alt=media" },
];

export const PROXIMAMENTE: AnimeCard[] = [
  {
    id: 62516, title: "Dandadan 3rd Season", year: 2027, score: 0, type: "TV", img: "https://cdn.myanimelist.net/images/anime/1671/154516l.jpg" },
  {
    id: 57584, title: "Kage no Jitsuryokusha ni Naritakute! Movie: Zankyou-hen",
    year: 2027,
    score: 0,
    type: "Movie",
    img: "https://cdn.myanimelist.net/images/anime/1797/156362l.jpg"
  },
  {
    id: 59068,
    title: "Dungeon Meshi Season 2",
    year: 2027,
    score: 0,
    type: "TV",
    img: "https://cdn.myanimelist.net/images/anime/1830/158890l.jpg"
  },
  {
    id: 61987,
    title: "Kusuriya no Hitorigoto 3rd Season",
    year: 2026,
    score: 0,
    type: "TV",
    img: "https://cdn.myanimelist.net/images/anime/1862/152811l.jpg"
  },
  {
    id: 61006,
    title: "Bocchi the Rock! 2nd Season",
    year: 0,
    score: 0,
    type: "TV",
    img: "https://cdn.myanimelist.net/images/anime/1142/148003l.jpg"
  },
  {
    id: 60636,
    title: "Bleach: Sennen Kessen-hen - Kashin-tan",
    year: 2026,
    score: 0,
    type: "TV",
    img: "https://cdn.myanimelist.net/images/anime/1275/158595l.jpg"
  },
  {
    id: 59873,
    title: "Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san Season 2",
    year: 2027,
    score: 0,
    type: "TV",
    img: "https://cdn.myanimelist.net/images/anime/1711/156333l.jpg"
  },
  {
    id: 61990,
    title: "Cyberpunk: Edgerunners 2",
    year: 2026,
    score: 0,
    type: "ONA",
    img: "https://cdn.myanimelist.net/images/anime/1880/158764l.jpg"
  },
];

// ─── Top Anime — ranking semanal ─────────────────────────────────────────────

export const TOP_SEMANAL: TopAnimeItem[] = [
  { id: 61316, title: "Re:Zero kara Hajimeru Isekai Seikatsu 4th Season", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F1a7fb8f72c6e87c31f4a24955637f11bdc296065.jpg?generation=1786160569657849&alt=media" },
  { id: 61469, title: "Steel Ball Run: JoJo no Kimyou na Bouken", type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F4aa825c6b64fcc0c69cc7be0484dc3043f187b4c.jpg?generation=1786160569653404&alt=media" },
  { id: 60636, title: "Bleach: Sennen Kessen-hen - Kashin-tan", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fdac84bf662747e635095d143a57aca2fdf79eeef.jpg?generation=1786160569661681&alt=media" },
  { id: 21, title: "One Piece", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fc0af4a378a11dddc3376727c7e51b4ddbad4056c.jpg?generation=1786160569676855&alt=media" },
  { id: 59193, title: "Mushoku Tensei III: Isekai Ittara Honki Dasu", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fe48ba9f20a17b4d07cf110abacdc986e34ed8848.jpg?generation=1786160569691254&alt=media" },
  { id: 50250, title: "Chiikawa", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Faf2460ad066c3bb25cf6a0081b94fe1b7d6ea97f.jpg?generation=1786160569776707&alt=media" },
  { id: 55809, title: "Xian Ni", type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fe6b5218dac9434144d8b8d1b3bd852271aa03825.jpg?generation=1786160569833331&alt=media" },
  { id: 60988, title: "Tian Guan Cifu Short Films", type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fca4c39cf58ed1bd3ee6681fc3f859057e1584dc5.jpg?generation=1786160569824997&alt=media" },
  { id: 61483, title: "Tenmaku no Jaadugar", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F817d52402a68152ae7935477a591cba335b79da4.jpg?generation=1786160569828739&alt=media" },
  { id: 63832, title: "Seihantai na Kimi to Boku 2nd Season", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fabb4e0beb10a075034a132ec97a5258f127d72f9.jpg?generation=1786160569827580&alt=media" },
];

// ─── Top Anime — ranking mensual ──────────────────────────────────────────────

export const TOP_MENSUAL: TopAnimeItem[] = [
  { id: 16498, title: "Shingeki no Kyojin", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F03f9cd95d3a162bf982aa1ccb9a65c697e8115d9.jpg?generation=1780151446887126&alt=media" },
  { id: 5114, title: "Fullmetal Alchemist: Brotherhood", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F1a7fb8f72c6e87c31f4a24955637f11bdc296065.jpg?generation=1786160569657849&alt=media" },
  { id: 61469, title: "Steel Ball Run: JoJo no Kimyou na Bouken", type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F4aa825c6b64fcc0c69cc7be0484dc3043f187b4c.jpg?generation=1786160569653404&alt=media" },
  { id: 38000, title: "Kimetsu no Yaiba", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F9f93c6413e608ae491ba456fac96fb11b04917d1.webp?generation=1786160569298445&alt=media" },
  { id: 60636, title: "Bleach: Sennen Kessen-hen - Kashin-tan", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fdac84bf662747e635095d143a57aca2fdf79eeef.jpg?generation=1786160569661681&alt=media" },
  { id: 21, title: "One Piece", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fc0af4a378a11dddc3376727c7e51b4ddbad4056c.jpg?generation=1786160569676855&alt=media" },
  { id: 61316, title: "Re:Zero kara Hajimeru Isekai Seikatsu 4th Season", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F1a7fb8f72c6e87c31f4a24955637f11bdc296065.jpg?generation=1786160569657849&alt=media" },
  { id: 59193, title: "Mushoku Tensei III: Isekai Ittara Honki Dasu", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fe48ba9f20a17b4d07cf110abacdc986e34ed8848.jpg?generation=1786160569691254&alt=media" },
  { id: 55809, title: "Xian Ni", type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fe6b5218dac9434144d8b8d1b3bd852271aa03825.jpg?generation=1786160569833331&alt=media" },
  { id: 62542, title: "Grand Blue Season 3", type: "TV", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2Fcbf1677bc9f3ff0c1a90b8f3e35d69d11d6674d5.jpg?generation=1786160569626844&alt=media" },
];

// ─── Más Populares — carrusel con sinopsis ────────────────────────────────────

export const MAS_POPULARES: AnimePopular[] = [
  {
    rank: 1,
    title: "Shingeki no Kyojin",
    year: 2013,
    eps: 25,
    type: "TV",
    genres: ["Acción", "Premiado", "Drama", "Suspenso", "Gore", "Militar"],
    synopsis:
      "Hace siglos, la humanidad fue diezmada por Titanes que devoran personas. Los supervivientes viven dentro de enormes muros. Cuando el muro exterior cae, la desesperada lucha por sobrevivir vuelve a comenzar con Eren Yeager como protagonista.",
    img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F03f9cd95d3a162bf982aa1ccb9a65c697e8115d9.jpg?generation=1780151446887126&alt=media",
  },
  {
    rank: 2,
    title: "Fullmetal Alchemist: Brotherhood",
    year: 2009,
    eps: 64,
    type: "TV",
    genres: ["Acción", "Aventura", "Drama", "Fantasía"],
    synopsis:
      "Los hermanos Edward y Alphonse Elric perdieron sus cuerpos intentando revivir a su madre con alquimia. En su búsqueda de la Piedra Filosofal para recuperarlos, descubren una conspiración que amenaza a toda la nación.",
    img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F1a7fb8f72c6e87c31f4a24955637f11bdc296065.jpg?generation=1786160569657849&alt=media",
  },
  {
    rank: 3,
    title: "Steel Ball Run",
    year: 2026,
    eps: 37,
    type: "ONA",
    genres: ["Acción", "Aventura", "Sobrenatural"],
    synopsis:
      "En la América de 1890, el presidente Funny Valentine organiza una carrera transcontinental a caballo. Johnny Joestar y Gyro Zeppeli forman una alianza improbable y descubren que la carrera esconde secretos sobrenaturales ligados a reliquias sagradas.",
    img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F4aa825c6b64fcc0c69cc7be0484dc3043f187b4c.jpg?generation=1786160569653404&alt=media",
  },
];
