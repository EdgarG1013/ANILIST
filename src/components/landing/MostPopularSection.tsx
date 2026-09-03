import { useEffect, useState } from "react";
import MostPopularCarousel from "./MostPopularCarousel";
import { obtenerTopAnime, obtenerTopManga, type PopularItem } from "../../api/catalogoService";

// ─── Sección: Más populares (anime y manga) ──────────────────────

export default function MostPopularSection() {
  const [animes, setAnimes] = useState<PopularItem[]>([]);
  const [mangas, setMangas] = useState<PopularItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([
      obtenerTopAnime(),
      obtenerTopManga(),
    ]).then(([a, m]) => {
      if (!vivo) return;
      if (a.status === "fulfilled") setAnimes(a.value);
      if (m.status === "fulfilled") setMangas(m.value);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, []);

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
        basePath="/explorar?type=popular"
        items={animes}
      />
      <MostPopularCarousel
        title="Top Manga"
        viewAllLabel="Ver todo"
        basePath="/explorar?type=popular&medio=manga"
        items={mangas}
        reverse
      />
    </section>
  );
}
