import { Users } from "lucide-react";
import type { Personaje } from "../../api/catalogoService";

export default function AnimeCharacters({ personajes }: { personajes: Personaje[] }) {
  if (personajes.length === 0) return null;

  return (
    <section>
      <h2
        className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        <span className="w-1 h-5 rounded-full inline-block bg-primary" />
        <Users size={16} className="text-muted-foreground" />
        Personajes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personajes.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
          >
            {p.img ? (
              <img
                src={p.img}
                alt={p.nombre}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                {p.nombre[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-foreground text-sm truncate font-medium">{p.nombre}</p>
              <p className="text-muted-foreground text-xs">{p.rol}</p>
              {p.seiyuu && <p className="text-muted-foreground text-xs truncate opacity-80">{p.seiyuu}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
