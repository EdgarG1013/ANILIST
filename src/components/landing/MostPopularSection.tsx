import { useEffect, useState } from "react";
import MostPopularCarousel from "./MostPopularCarousel";
import { buscarCatalogo, type CatalogoItem } from "../../api/jikanClient";
import type { PopularItem } from "../../api/jikan";
import { TrendingUp } from "lucide-react";

// ─── Sección: Más populares (anime y manga lado a lado) ──────────────────────

function aPopular(item: CatalogoItem, countLabel: string): PopularItem {
  return {
    id: item.id,
    title: item.title,
    synopsis: item.synopsis,
    genres: item.genres,
    year: item.year,
    count: item.total,
    countLabel,
    img: item.img,
  };
}

export default function MostPopularSection() {
  const [animes, setAnimes] = useState<CatalogoItem[]>([]);
  const [mangas, setMangas] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([
      buscarCatalogo({ medio: "anime", orden: "popularity:asc" }),
      buscarCatalogo({ medio: "manga", orden: "popularity:asc" }),
    ]).then(([a, m]) => {
      if (!vivo) return;
      if (a.status === "fulfilled") setAnimes(a.value.items);
      if (m.status === "fulfilled") setMangas(m.value.items);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, []);

  const itemsAnime = animes.slice(0, 5).map(i => aPopular(i, "episodio"));
  const itemsManga = mangas.slice(0, 5).map(i => aPopular(i, "capítulo"));

  return (
    <section className="mb-14" aria-label="Más populares">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-lg bg-[#946ed9]/15 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#946ed9]" />
        </div>
        <h2
          className="font-semibold text-xl tracking-wider"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          Top Anime y Manga
        </h2>
      </div>

      {cargando ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="h-[280px] rounded-2xl bg-[#16141e] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MostPopularCarousel
            title="Top Anime"
            viewAllLabel="Ver todo"
            basePath="/anime"
            items={itemsAnime}
          />
          <MostPopularCarousel
            title="Top Manga"
            viewAllLabel="Ver todo"
            basePath="/manga"
            items={itemsManga}
          />
        </div>
      )}
    </section>
  );
}