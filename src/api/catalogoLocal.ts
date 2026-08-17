import type { CatalogoFiltros, CatalogoItem, CatalogoRespuesta } from "./jikanClient";
import { TEMPORADA, PROXIMAMENTE, MAS_POPULARES } from "./anime";
import { TOP_MANGA } from "./manga";

// ─── Catálogo de respaldo (offline) ───────────────────────────────────────────
// Cuando Jikan no está disponible (p. ej. errores 504 por caída de MyAnimeList),
// usar estos datos curados para que la demo del panel siempre renderice algo.
// Fuente: datos ya existentes del proyecto, normalizados al formato del catálogo.

function aItem(
  x: { id: number; title: string; img: string; type: string; year: number; score: number },
): CatalogoItem {
  return {
    id: x.id,
    title: x.title,
    img: x.img,
    type: x.type,
    year: x.year || null,
    score: x.score || null,
    status: "",
    genres: [],
    synopsis: null,
    total: null,
  };
}

function anime(): CatalogoItem[] {
  return [
    ...TEMPORADA.map(aItem),
    ...PROXIMAMENTE.map(aItem),
    ...MAS_POPULARES.map(p => ({
      id: p.rank,
      title: p.title,
      img: p.img,
      type: p.type,
      year: p.year,
      score: 0,
      status: "",
      genres: p.genres,
      synopsis: p.synopsis,
      total: p.eps,
    })),
  ];
}

function manga(): CatalogoItem[] {
  return TOP_MANGA.map(m => ({
    id: m.mal_id,
    title: m.title,
    img: m.images?.jpg?.large_image_url || m.images?.jpg?.image_url || "",
    type: m.type,
    year: m.year ?? m.published?.prop?.from?.year ?? null,
    score: m.score ?? null,
    status: "",
    genres: [...(m.genres || []), ...(m.themes || [])].map(g => g.name),
    synopsis: m.synopsis,
    total: m.chapters ?? null,
  }));
}

/** Aplica los mismos filtros y paginación sobre el dataset local. */
export function catalogoLocal(f: CatalogoFiltros): CatalogoRespuesta {
  let items: CatalogoItem[] = f.medio === "anime" ? anime() : manga();

  if (f.q) {
    const q = f.q.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q));
  }
  if (f.tipo) {
    const tipo = f.tipo.toLowerCase();
    items = items.filter(i => i.type.toLowerCase() === tipo);
  }
  if (f.genero) {
    items = items.filter(i => i.genres.some(g => g.toLowerCase() === f.genero!.toLowerCase()));
  }
  if (f.estado) {
    // El dataset local no distingue estado; se devuelve como está.
  }
  if (f.anio) {
    items = items.filter(i => i.year === Number(f.anio));
  }
  if (f.orden) {
    const [by, dir] = f.orden.split(":");
    const signo = dir === "desc" ? -1 : 1;
    items = [...items].sort((a, b) => {
      if (by === "score") return signo * ((a.score ?? 0) - (b.score ?? 0));
      if (by === "title") return signo * a.title.localeCompare(b.title);
      if (by === "popularity") return signo * (a.id - b.id);
      if (by === "start_date") return signo * ((a.year ?? 0) - (b.year ?? 0));
      return 0;
    });
  }

  const total = items.length;
  const pagina = f.pagina || 1;
  const porPagina = 20;
  const inicio = (pagina - 1) * porPagina;

  return {
    items: items.slice(inicio, inicio + porPagina),
    paginaActual: pagina,
    ultimaPagina: Math.max(1, Math.ceil(total / porPagina)),
    total,
  };
}