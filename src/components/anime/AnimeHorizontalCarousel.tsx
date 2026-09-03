import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { AnimeCard } from "../../api/tiposService";
import { TIPO_COLORES } from "../../api/tiposService";

interface Props {
  titulo: string;
  icono: ReactNode;
  items: AnimeCard[];
  onSeleccionar: (id: number) => void;
}

export default function AnimeHorizontalCarousel({ titulo, icono, items, onSeleccionar }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [izq, setIzq] = useState(false);
  const [der, setDer] = useState(false);

  const verificar = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIzq(el.scrollLeft > 4);
    setDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    verificar();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", verificar, { passive: true });
    window.addEventListener("resize", verificar);
    return () => {
      el.removeEventListener("scroll", verificar);
      window.removeEventListener("resize", verificar);
    };
  }, [verificar, items]);

  const desplazar = (dir: "izq" | "der") => {
    const el = scrollRef.current;
    if (!el) return;
    const monto = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "der" ? monto : -monto, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-foreground flex items-center gap-2 text-2xl font-semibold"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          <span className="w-1 h-5 rounded-full inline-block bg-primary" />
          {icono}
          {titulo}
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => desplazar("izq")}
            disabled={!izq}
            aria-label="Desplazar a la izquierda"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: izq ? "#1c1928" : "#110f1a",
              color: izq ? "#946ed9" : "#5c5470",
              cursor: izq ? "pointer" : "default",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => desplazar("der")}
            disabled={!der}
            aria-label="Desplazar a la derecha"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: der ? "#1c1928" : "#110f1a",
              color: der ? "#946ed9" : "#5c5470",
              cursor: der ? "pointer" : "default",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSeleccionar(item.id)}
            className="group shrink-0 text-left"
            style={{ width: "160px" }}
          >
            <div
              className="rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 group-hover:border-primary/40 group-hover:-translate-y-0.5"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {item.score != null && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs">{item.score}</span>
                  </div>
                )}
                {item.type && (
                  <div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-white text-xs font-medium"
                    style={{ backgroundColor: TIPO_COLORES[item.type] || "#6b3fa0" }}
                  >
                    {item.type}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3
                  className="text-foreground truncate text-[13px] leading-snug font-semibold mb-1 uppercase tracking-wide"
                  style={{ fontFamily: "'Oxanium', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs">{item.year || "—"}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
