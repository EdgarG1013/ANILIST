import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { PopularItem } from "../../api/jikan";

interface MostPopularCarouselProps {
  items: PopularItem[];
  /** Título de la sección (Anime / Manga) */
  title: string;
  /** Etiqueta del enlace "Ver todo" */
  viewAllLabel?: string;
  /** Ruta base para los enlaces de detalle */
  basePath: string;
}

function truncateSynopsis(text: string | null, maxWords: number = 60): string {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function MostPopularCarousel({ items, title, viewAllLabel = "Ver todo", basePath }: MostPopularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeState, setFadeState] = useState<"visible" | "fading-out" | "fading-in">("visible");

  const carouselItems = items.slice(0, 5);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setFadeState("fading-out");
      setCurrentIndex(index);
    },
    [isTransitioning],
  );

  // Cuando termina el fade-out, se cambia el contenido y se hace fade-in
  useEffect(() => {
    if (fadeState === "fading-out") {
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex);
        setFadeState("fading-in");
      }, 250);
      return () => clearTimeout(timer);
    }

    if (fadeState === "fading-in") {
      const timer = setTimeout(() => {
        setFadeState("visible");
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fadeState, currentIndex]);

  const goPrev = useCallback(() => {
    goTo(currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1);
  }, [currentIndex, carouselItems.length, goTo]);

  const goNext = useCallback(() => {
    goTo(currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, carouselItems.length, goTo]);

  if (carouselItems.length === 0) return null;

  // displayIndex solo cambia a mitad de la transición
  const item = carouselItems[displayIndex];

  const contentStyle: React.CSSProperties = {
    transition: "opacity 0.25s ease, transform 0.3s ease",
    opacity: fadeState === "fading-out" ? 0 : 1,
    transform: fadeState === "fading-out" ? "translateX(-12px)" : "translateX(0)",
  };

  const navButtons = (
    <>
      <button
        onClick={goPrev}
        disabled={isTransitioning}
        aria-label="Anterior"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8] hover:border-[#946ed9]/50 hover:bg-[#16141e] hover:text-[#f0eefa] transition-colors disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={goNext}
        disabled={isTransitioning}
        aria-label="Siguiente"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8] hover:border-[#946ed9]/50 hover:bg-[#16141e] hover:text-[#f0eefa] transition-colors disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </>
  );

  return (
    <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden">
      {/* Encabezado de la sección */}
      <div className="flex items-center justify-between border-b border-[#2a2140] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="font-bold text-[15px]">{title}</h2>
        </div>
        <Link
          to={basePath}
          className="flex items-center gap-1 text-sm text-[#946ed9] hover:text-[#b08ee8] transition-colors hover:gap-2"
        >
          {viewAllLabel} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Contenido del carrusel */}
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-0">
        {/* Columna 1: Poster */}
        <Link
          to={`${basePath}/${item.id}`}
          className="block relative sm:h-full aspect-[2/3] sm:aspect-auto overflow-hidden"
        >
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="eager"
          />
          <span
            className="absolute bottom-2 right-2 font-extrabold leading-none"
            style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "3rem", color: "rgba(240,238,250,0.85)" }}
          >
            #{displayIndex + 1}
          </span>
        </Link>

        {/* Columna 2: Información */}
        <div className="flex flex-col justify-between p-5 min-h-[200px]">
          <div style={contentStyle}>
            {/* Título */}
            <Link to={`${basePath}/${item.id}`}>
              <h3
                className="text-[#f0eefa] uppercase tracking-tight leading-none mb-3 cursor-pointer transition-colors hover:text-[#946ed9]"
                style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "1.75rem", lineHeight: 0.95 }}
              >
                {item.title}
              </h3>
            </Link>

            {/* Año · Cantidad */}
            <div className="flex items-center gap-2 text-[#8b82a8] text-sm mb-3">
              {item.year && <span>{item.year}</span>}
              {item.year && item.count && <span className="w-px h-3.5 bg-[#8b82a8] opacity-40" />}
              {item.count && (
                <span>
                  {item.count} {item.countLabel}
                  {item.count !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Sinopsis */}
            <p className="text-[#8b82a8] text-sm leading-relaxed mb-4">
              {truncateSynopsis(item.synopsis)}
            </p>

            {/* Géneros */}
            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.genres.slice(0, 5).map(genre => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full border border-[#2a2140] text-[#c4bbd8] text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navegación inferior */}
          <div className="flex items-center justify-between mt-5">
            <span
              className="font-extrabold text-[#946ed9]"
              style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "1.5rem", lineHeight: 1 }}
            >
              #{displayIndex + 1}
            </span>
            <div className="flex gap-2">{navButtons}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(MostPopularCarousel);