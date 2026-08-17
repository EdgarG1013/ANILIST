import { CalendarClock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PROXIMAMENTE } from "../../api/anime";
import { TipoBadge } from "./badges";

// ─── Sección: Próximos — próximos estrenos de anime ──────────────────────────

export default function ProximosSection() {
  return (
    <section className="mb-14" aria-label="Próximos estrenos">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#946ed9]/15 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-[#946ed9]" />
          </div>
          <h2
            className="font-semibold text-xl tracking-wider"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            Próximos
          </h2>
        </div>
        <a href="#" className="flex items-center gap-1 text-[#946ed9] text-sm hover:text-[#b08ee8] transition-colors">
          Ver todo <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grilla responsiva: 2 cols móvil → 3 tablet → 4 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {PROXIMAMENTE.map(anime => (
          <Link key={anime.id} to={`/anime/${anime.id}`} className="block group">
            <div className="bg-[#110f1a] rounded-2xl overflow-hidden border border-[#2a2140] group-hover:border-[#946ed9]/40 transition-all duration-200 group-hover:-translate-y-0.5 shadow-lg">
              {/* Portada con badge de tipo superpuesto */}
              <div className="relative aspect-[2/3] bg-[#1c1928]">
                <img src={anime.img} alt={anime.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <TipoBadge tipo={anime.type} />
                </div>
              </div>
              {/* Información del anime — sin puntuación */}
              <div className="p-3">
                <h3
                  className="font-semibold truncate text-[13px] mb-1 uppercase tracking-wide"
                  style={{ fontFamily: "'Oxanium', sans-serif" }}
                >
                  {anime.title}
                </h3>
                <p className="text-[#8b82a8] text-xs">
                  {anime.year ? anime.year : "Sin confirmar"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}