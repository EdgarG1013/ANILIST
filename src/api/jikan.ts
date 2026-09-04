// ─── Tipos compartidos ────────────────────────────────────────────────────────

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
