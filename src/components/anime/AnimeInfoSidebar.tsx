import { useState } from "react";
import { Music, Play } from "lucide-react";
import type { AnimeDetalle } from "../../api/catalogoService";

const formatearNumero = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil` : String(n);

function CancionItem({ cancion }: { cancion: string }) {
  const [hovered, setHovered] = useState(false);
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(cancion)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors bg-secondary hover:bg-secondary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md">
        <Play size={10} className={hovered ? "text-red-500" : "text-muted-foreground"} fill="currentColor" />
      </span>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
        {cancion}
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded-lg bg-gray-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
        Buscar en YouTube
      </span>
    </a>
  );
}

export default function AnimeInfoSidebar({ anime }: { anime: AnimeDetalle }) {
  return (
    <div className="space-y-6">
      {/* Información */}
      <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
        <h3 className="text-foreground mb-4 text-sm font-semibold">Información</h3>
        <dl className="space-y-3">
          {[
            { label: "Puntuación", value: anime.score ? `${anime.score} / 10` : "—" },
            { label: "Votos", value: anime.votos ? formatearNumero(anime.votos) : "—" },
            { label: "Ranking", value: anime.rank ? `#${anime.rank}` : "—" },
            { label: "Popularidad", value: anime.popularidad ? `#${anime.popularidad}` : "—" },
            { label: "Estudio", value: anime.estudio },
            { label: "Tipo", value: anime.tipo || "—" },
            { label: "Año", value: anime.year ? String(anime.year) : "—" },
            { label: "Episodios", value: anime.eps ? String(anime.eps) : "—" },
            { label: "Duración", value: anime.duracion || "—" },
            { label: "Estado", value: anime.estado || "—" },
            { label: "Fuente", value: anime.fuente || "—" },
            { label: "Clasificación", value: anime.clasificacion || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <dt className="text-muted-foreground text-xs shrink-0">{label}</dt>
              <dd className="text-muted-foreground text-xs text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Canciones */}
      {(anime.openings.length > 0 || anime.endings.length > 0) && (
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
          <h3 className="text-foreground mb-4 text-sm font-semibold flex items-center gap-2">
            <Music size={14} className="text-muted-foreground" />
            Canciones
          </h3>

          {anime.openings.length > 0 && (
            <div className="mb-3">
              <p className="text-muted-foreground text-xs mb-2">Openings</p>
              <div className="space-y-1.5">
                {anime.openings.map((s, i) => (
                  <CancionItem key={i} cancion={s} />
                ))}
              </div>
            </div>
          )}

          {anime.endings.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs mb-2">Endings</p>
              <div className="space-y-1.5">
                {anime.endings.map((s, i) => (
                  <CancionItem key={i} cancion={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
