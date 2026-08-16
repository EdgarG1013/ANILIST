import MostPopularCarousel from "./MostPopularCarousel";
import { MAS_POPULARES, toPopularAnime } from "../../api/anime";
import { TOP_MANGA, toPopularManga } from "../../api/manga";
import { TrendingUp } from "lucide-react";

// ─── Sección: Más populares (anime y manga lado a lado) ──────────────────────

const ITEMS_ANIME = MAS_POPULARES.map(toPopularAnime);
const ITEMS_MANGA = TOP_MANGA.map(toPopularManga);

export default function MostPopularSection() {
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

      {/* Anime y manga lado a lado en desktop, apilados en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MostPopularCarousel
          title="Top Anime"
          viewAllLabel="Ver todo"
          basePath="/anime"
          items={ITEMS_ANIME}
        />
        <MostPopularCarousel
          title="Top Manga"
          viewAllLabel="Ver todo"
          basePath="/manga"
          items={ITEMS_MANGA}
        />
      </div>
    </section>
  );
}