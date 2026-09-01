import { MonitorPlay, ExternalLink } from "lucide-react";
import type { LinkExterno } from "../../api/animeDetail";

export default function AnimeStreaming({ streaming }: { streaming: LinkExterno[] }) {
  if (streaming.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
      <h3 className="text-foreground mb-4 text-sm font-semibold flex items-center gap-2">
        <MonitorPlay size={14} className="text-muted-foreground" />
        Plataformas de streaming
      </h3>
      <div className="space-y-2">
        {streaming.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors bg-secondary hover:bg-secondary"
          >
            <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/15 text-primary font-bold text-xs">
              {s.nombre[0]}
            </span>
            <span className="text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {s.nombre}
            </span>
            <ExternalLink size={13} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}