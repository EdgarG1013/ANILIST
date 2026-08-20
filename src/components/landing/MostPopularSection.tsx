import { useEffect, useState } from "react";
import MostPopularCarousel from "./MostPopularCarousel";
import { buscarCatalogo, type CatalogoItem } from "../../api/jikanClient";
import type { PopularItem } from "../../api/jikan";

// ─── Sección: Más populares (anime y manga) ──────────────────────

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

  if (cargando) {
    return (
      <section className="mb-14" aria-label="Más populares">
        <div className="space-y-6">
          {[0, 1].map(i => (
            <div key={i} className="h-[280px] lg:h-[460px] rounded-2xl bg-[#16141e] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Más populares">
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
        reverse
      />
    </section>
  );
}