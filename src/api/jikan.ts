// ─── Tipos compartidos de Jikan API ──────────────────────────────────────────
// Estas interfaces representan la forma que devuelve la API de Jikan (jikan.moe).
// Los datos en /api son una representación local/hardcodeada de dicha respuesta.

/** Recurso con nombre (géneros, temas, etc.) */
export interface JikanNamedResource {
  mal_id: number;
  name: string;
  url: string;
}

/** Estructura de imágenes de Jikan */
export interface JikanImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

/** Estructura de fecha de Jikan (aired/published) */
export interface JikanDate {
  from?: string | null;
  to?: string | null;
  prop?: {
    from?: { year?: number | null; month?: number | null; day?: number | null };
    to?: { year?: number | null; month?: number | null; day?: number | null };
  };
}

// ─── Tipo normalizado para el carrusel de populares ──────────────────────────

/** Item normalizado que consume el carrusel "Más populares" (anime o manga) */
export interface PopularItem {
  id: number;
  title: string;
  synopsis: string | null;
  genres: string[];
  year: number | null;
  /** Cantidad a mostrar en la metadata (episodios, volúmenes, capítulos) */
  count: number | null;
  /** Etiqueta del contador en singular (episodio, volumen, capítulo) */
  countLabel: string;
  img: string;
}