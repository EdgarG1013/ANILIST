// ─── Tipos de datos ───────────────────────────────────────────────────────────

/** Tarjeta de anime para grids y listas */
export interface AnimeCard {
  id: number;
  title: string;
  year: number;
  score: number;
  type: string;
  img: string;
}

// ─── Colores por tipo de anime ────────────────────────────────────────────────

export const TIPO_COLORES: Record<string, string> = {
  TV: "#6b3fa0",
  ONA: "#0097a7",
  OVA: "#388e3c",
  Movie: "#d97706",
};
