// ─── Tipos de datos para la página de detalle de anime ───────────────────────
// Reutiliza AnimeCard (definido en ./anime) para las secciones relacionadas.

import type { AnimeCard } from "./anime";

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
}

// ─── Detalles hardcodeados (datos de ejemplo hasta que exista el backend) ───

const imagenKimetsu =
  "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F9f93c6413e608ae491ba456fac96fb11b04917d1.webp?generation=1786160569298445&alt=media";
const imagenShingeki =
  "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F03f9cd95d3a162bf982aa1ccb9a65c697e8115d9.jpg?generation=1780151446887126&alt=media";

export const DETALLE: Record<number, AnimeDetalle> = {
  1: {
    id: 1,
    titulo: "Kimetsu no Yaiba",
    tituloIngles: "Demon Slayer: Kimetsu no Yaiba",
    score: 8.4,
    votos: 2230000,
    rank: 212,
    popularidad: 1,
    tipo: "TV",
    year: 2019,
    estudio: "ufotable",
    eps: 26,
    estado: "Finalizado",
    fuente: "Manga",
    clasificacion: "PG-13",
    duracion: "23 min por episodio",
    generos: ["Acción", "Premiado", "Sobrenatural", "Histórico"],
    sinopsis:
      "Desde la muerte de su padre, la carga de mantener a la familia recae sobre Tanjirou Kamado. Un día, regresa a casa para encontrar a su familia masacrada y a su hermana Nezuko convertida en demonio. Comienza así su viaje como cazador de demonios, decidido a encontrar una cura y devolverle su humanidad.",
    img: imagenKimetsu,
    banner: imagenKimetsu,
    trailerYtId: "",
    openings: [
      "Gurenge — LiSA",
      "Zankyou Sanka — Aimer",
      "Akeboshi — LiSA",
    ],
    endings: ["from the edge — FictionJunction feat. LiSA"],
    personajes: [
      { nombre: "Tanjirou Kamado", rol: "Protagonista", seiyuu: "Natsuki Hanae" },
      { nombre: "Nezuko Kamado", rol: "Protagonista", seiyuu: "Akari Kitou" },
      { nombre: "Zenitsu Agatsuma", rol: "Compañero", seiyuu: "Hiro Shimono" },
      { nombre: "Inosuke Hashibira", rol: "Compañero", seiyuu: "Yoshitsugu Matsuoka" },
      { nombre: "Giyuu Tomioka", rol: "Pilar del Agua", seiyuu: "Takahiro Sakurai" },
    ],
    episodios: [
      { num: 1, titulo: "Crueldad", fecha: "6 abr 2019" },
      { num: 2, titulo: "El entrenador de espadas Sakonji Urokodaki", fecha: "13 abr 2019" },
      { num: 3, titulo: "Sabito y Makomo", fecha: "20 abr 2019" },
      { num: 4, titulo: "Selección final", fecha: "27 abr 2019" },
      { num: 5, titulo: "Mi propia acero", fecha: "4 may 2019" },
      { num: 6, titulo: "El espadachín que acompaña a un demonio", fecha: "11 may 2019" },
      { num: 7, titulo: "Muzan Kibutsuji", fecha: "18 may 2019" },
      { num: 8, titulo: "El olor del encanto", fecha: "25 may 2019" },
      { num: 9, titulo: "Los demonios de la araña", fecha: "1 jun 2019" },
      { num: 10, titulo: "El demonio de la familia araña", fecha: "8 jun 2019" },
    ],
    relacionados: [
      { id: 1, title: "Kimetsu no Yaiba", year: 2019, score: 8.4, type: "TV", img: imagenKimetsu },
      { id: 20, title: "Kimetsu no Yaiba Movie", year: 2020, score: 8.8, type: "Movie", img: imagenKimetsu },
      { id: 30, title: "Kimetsu no Yaiba S2", year: 2021, score: 8.5, type: "TV", img: imagenKimetsu },
    ],
    similares: [
      { id: 2, title: "Shingeki no Kyojin", year: 2013, score: 9.1, type: "TV", img: imagenShingeki },
      { id: 5, title: "Steel Ball Run", year: 2026, score: 9.2, type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F4aa825c6b64fcc0c69cc7be0484dc3043f187b4c.jpg?generation=1786160569653404&alt=media" },
    ],
  },
  2: {
    id: 2,
    titulo: "Shingeki no Kyojin",
    tituloIngles: "Attack on Titan",
    score: 9.1,
    votos: 3120000,
    rank: 1,
    popularidad: 2,
    tipo: "TV",
    year: 2013,
    estudio: "Wit Studio",
    eps: 25,
    estado: "Finalizado",
    fuente: "Manga",
    clasificacion: "R - 17+",
    duracion: "24 min por episodio",
    generos: ["Acción", "Premiado", "Drama", "Suspenso"],
    sinopsis:
      "Hace siglos, la humanidad fue diezmada por criaturas humanoides gigantes llamadas Titanes. Los supervivientes se refugiaron tras enormes muros que los separan del mundo exterior. Cuando el muro exterior es destruido por un Titán colosal, la lucha por la supervivencia vuelve a comenzar con Eren Yeager y sus amigos como protagonistas.",
    img: imagenShingeki,
    banner: imagenShingeki,
    trailerYtId: "",
    openings: ["Guren no Yumiya — Linked Horizon"],
    endings: ["Utsukushiki Zankoku na Sekai — Yoko Hikasa"],
    personajes: [
      { nombre: "Eren Yeager", rol: "Protagonista", seiyuu: "Yuki Kaji" },
      { nombre: "Mikasa Ackerman", rol: "Protagonista", seiyuu: "Yui Ishikawa" },
      { nombre: "Armin Arlert", rol: "Protagonista", seiyuu: "Marina Inoue" },
      { nombre: "Levi Ackerman", rol: "Capitán", seiyuu: "Hiroshi Kamiya" },
    ],
    episodios: [
      { num: 1, titulo: "A ti, en 2000 años — La caída de Shiganshina (1)", fecha: "7 abr 2013" },
      { num: 2, titulo: "Aquel día — La caída de Shiganshina (2)", fecha: "14 abr 2013" },
      { num: 3, titulo: "Una luz tenue en medio de la desesperación — La humanidad renace", fecha: "21 abr 2013" },
      { num: 4, titulo: "La noche de la ceremonia de graduación", fecha: "28 abr 2013" },
      { num: 5, titulo: "La primera batalla", fecha: "5 may 2013" },
    ],
    relacionados: [
      { id: 2, title: "Shingeki no Kyojin", year: 2013, score: 9.1, type: "TV", img: imagenShingeki },
      { id: 40, title: "Shingeki no Kyojin S2", year: 2017, score: 8.7, type: "TV", img: imagenShingeki },
      { id: 50, title: "Shingeki no Kyojin S3", year: 2018, score: 8.9, type: "TV", img: imagenShingeki },
    ],
    similares: [
      { id: 1, title: "Kimetsu no Yaiba", year: 2019, score: 8.4, type: "TV", img: imagenKimetsu },
      { id: 5, title: "Steel Ball Run", year: 2026, score: 9.2, type: "ONA", img: "https://storage.googleapis.com/download/storage/v1/b/prd-storytodesign.appspot.com/o/h2d-ext-asset%2F4aa825c6b64fcc0c69cc7be0484dc3043f187b4c.jpg?generation=1786160569653404&alt=media" },
    ],
  },
};

/** Devuelve los detalles de un anime por id, o undefined si no existe. */
export function obtenerDetalle(id: number): AnimeDetalle | undefined {
  return DETALLE[id];
}
