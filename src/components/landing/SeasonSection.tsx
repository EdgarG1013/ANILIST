import { useEffect, useState } from "react";
import { Flame, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { buscarCatalogo, type CatalogoItem } from "../../api/jikanClient";
import { TipoBadge, PuntuacionBadge } from "./badges";

// ─── Sección: En Temporada ────────────────────────────────────────────────────

export default function SeasonSection() {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    buscarCatalogo({ medio: "anime", estado: "airing", orden: "popularity:asc" })
      .then(r => vivo && setItems(r.items))
      .catch(() => vivo && setItems([]))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, []);

  return (
    <section className="mb-14" aria-label="Anime en temporada">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <h2
            className="font-semibold text-xl tracking-wider"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            En Temporada
          </h2>
        </div>
        <Link to="/explorar?type=season" className="flex items-center gap-1 text-[#946ed9] text-sm hover:text-[#b08ee8] transition-colors">
          Ver todo <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grilla responsiva: 2 cols móvil → 3 tablet → 5 desktop (10 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cargando
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-[#16141e] animate-pulse" />
            ))
          : items.slice(0, 10).map(anime => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="block group">
                <div className="bg-[#110f1a] rounded-2xl overflow-hidden border border-[#2a2140] group-hover:border-[#946ed9]/40 transition-all duration-200 group-hover:-translate-y-0.5 shadow-lg">
                  {/* Portada con badges superpuestos */}
                  <div className="relative aspect-[2/3] bg-[#1c1928]">
                    <img src={anime.img} alt={anime.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <TipoBadge tipo={anime.type} />
                    </div>
                    {anime.score != null && (
                      <div className="absolute top-2 left-2">
                        <PuntuacionBadge score={anime.score} />
                      </div>
                    )}
                  </div>
                  {/* Información del anime */}
                  <div className="p-3">
                    <h3
                      className="font-semibold truncate text-[13px] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: "'Oxanium', sans-serif" }}
                    >
                      {anime.title}
                    </h3>
                    <p className="text-[#8b82a8] text-xs">{anime.year || "Sin confirmar"}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}