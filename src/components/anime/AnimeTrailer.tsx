import { Play } from "lucide-react";

export default function AnimeTrailer({ trailerYtId }: { trailerYtId?: string }) {
  return (
    <section>
      <h2
        className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        <span className="w-1 h-5 rounded-full inline-block bg-primary" />
        <Play size={16} className="text-muted-foreground" />
        Tráiler
      </h2>
      {trailerYtId ? (
        <div className="rounded-2xl overflow-hidden bg-card shadow-lg border border-border">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${trailerYtId}`}
              title="Tráiler"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden bg-card flex items-center justify-center border border-border"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)", aspectRatio: "16/9" }}
        >
          <div className="text-center">
            <Play size={32} className="text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-muted-foreground text-sm">Tráiler no disponible</p>
          </div>
        </div>
      )}
    </section>
  );
}
