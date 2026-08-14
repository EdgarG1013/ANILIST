import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { TOP_SEMANAL, TOP_MENSUAL, type TopAnimeItem } from "../../api/anime";
import { TipoBadge } from "./badges";

// ─── Sección: Top Anime ───────────────────────────────────────────────────────

export default function TopAnimeSection() {
  const [periodoRanking, setPeriodoRanking] = useState<"semanal" | "mensual">("semanal");

  const listaRanking = periodoRanking === "semanal" ? TOP_SEMANAL : TOP_MENSUAL;

  return (
    <section className="mb-14" aria-label="Top anime">
      <div className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden">

        {/* Encabezado con toggle de período */}
        <div className="flex items-center justify-between border-b border-[#2a2140] px-5 py-4">
          <div className="flex items-center gap-2.5 font-bold text-[15px]">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span>Top Anime</span>
          </div>
          {/* Selector Semanal / Mensual */}
          <div className="flex gap-0.5 bg-[#1c1928] p-0.5 rounded-[10px]">
            {(["Semanal", "Mensual"] as const).map(p => {
              const clave = p === "Semanal" ? "semanal" : "mensual";
              return (
                <button
                  key={p}
                  onClick={() => setPeriodoRanking(clave)}
                  className={[
                    "text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all",
                    periodoRanking === clave
                      ? "bg-[#110f1a] text-[#f0eefa] shadow"
                      : "text-[#8b82a8] hover:text-[#f0eefa]",
                  ].join(" ")}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista en 2 columnas en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {listaRanking.map((anime: TopAnimeItem, i: number) => (
            <a
              key={anime.id}
              href="#"
              className={[
                "flex items-center gap-3 px-5 py-3 hover:bg-[#16141e] transition-colors",
                /* línea divisoria entre columnas en desktop */
                i % 2 === 0 ? "sm:border-r border-[#2a2140]" : "",
                /* borde inferior entre filas (excepto la última fila) */
                i < listaRanking.length - 2 ? "border-b border-[#2a2140]" : "",
                i === listaRanking.length - 2 ? "sm:border-b border-[#2a2140]" : "",
              ].join(" ")}
            >
              {/* Número de posición — violeta para el top 3 */}
              <span
                className="shrink-0 w-7 text-center font-bold text-[17px] leading-none"
                style={{
                  fontFamily: "'Oxanium', sans-serif",
                  color: i === 0 ? "#946ed9" : i < 3 ? "#a78de0" : "#8b82a8",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Miniatura del anime */}
              <div className="w-9 h-[50px] rounded-md overflow-hidden bg-[#1c1928] shrink-0">
                <img src={anime.img} alt={anime.title} className="w-full h-full object-cover" />
              </div>
              <span className="grow truncate text-[13px] font-semibold basis-0 min-w-0">
                {anime.title}
              </span>
              <TipoBadge tipo={anime.type} className="shrink-0 text-[10px] tracking-wider" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}