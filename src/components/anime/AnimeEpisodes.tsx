import { useState } from "react";
import { Tv } from "lucide-react";
import type { Episodio } from "../../api/catalogoService";

export default function AnimeEpisodes({ episodios }: { episodios: Episodio[] }) {
  const [verTodos, setVerTodos] = useState(false);

  if (episodios.length === 0) return null;

  const visibles = verTodos ? episodios : episodios.slice(0, 12);

  return (
    <section>
      <h2
        className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        <span className="w-1 h-5 rounded-full inline-block bg-primary" />
        <Tv size={16} className="text-muted-foreground" />
        Episodios
      </h2>
      <div className="bg-card rounded-2xl overflow-hidden border border-border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
        {visibles.map((ep, i) => (
          <div
            key={ep.num}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary transition-colors"
            style={{ borderBottom: i < visibles.length - 1 ? "1px solid #2a2140" : "none" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-secondary text-primary font-semibold">
              {ep.num}
            </div>
            <p className="flex-1 text-muted-foreground text-sm">
              {ep.titulo || `Episodio ${ep.num}`}
            </p>
            <p className="text-muted-foreground text-xs shrink-0 opacity-70">{ep.fecha}</p>
          </div>
        ))}
      </div>
      {episodios.length > 12 && !verTodos && (
        <button
          onClick={() => setVerTodos(true)}
          className="mt-3 w-full py-2.5 text-sm text-primary hover:bg-secondary rounded-xl transition-colors font-medium"
        >
          Ver todos los episodios ({episodios.length})
        </button>
      )}
    </section>
  );
}
