import { useState, useEffect } from "react";
import { Star, ChevronRight, Flame, TrendingUp, Play, } from "lucide-react";
import { TIPO_COLORES, HERO, TEMPORADA, TOP_SEMANAL, TOP_MENSUAL, type TopAnimeItem } from "../../api/anime";

// ─── Badge de tipo de anime (TV, ONA, OVA, Movie) ────────────────────────────

function TipoBadge({ tipo, className = "" }: { tipo: string; className?: string }) {
  const color = TIPO_COLORES[tipo] ?? "bg-[#6b3fa0]";
  return (
    <span className={`text-white text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${color} ${className}`}>
      {tipo}
    </span>
  );
}

// ─── Badge de puntuación con estrella ─────────────────────────────────────────

function PuntuacionBadge({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1 bg-black/55 backdrop-blur-sm text-[11px] px-2 py-0.5 rounded-md">
      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
      <span className="text-white font-medium">{score}</span>
    </span>
  );
}

// ─── Página de inicio — Landing page ─────────────────────────────────────────

export default function HomePage() {
  const [slideActual, setSlideActual] = useState(0);
  const [periodoRanking, setPeriodoRanking] = useState<"semanal" | "mensual">("semanal");

  // Avanza el carrusel del hero automáticamente cada 6 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual(s => (s + 1) % HERO.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, []);

  const heroActual = HERO[slideActual];
  const listaRanking = periodoRanking === "semanal" ? TOP_SEMANAL : TOP_MENSUAL;

  return (
    <div>
      {/* ── HERO — Carrusel principal ── */}
      <section
        className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] overflow-hidden bg-[#0a0910]"
        aria-label="Anime destacado"
      >
        {/* Imagen de fondo con degradados para legibilidad del texto */}
        <div className="absolute inset-0">
          <img
            key={heroActual.id}
            src={heroActual.img}
            alt={heroActual.title}
            className="w-full h-full object-cover transition-opacity duration-700"
            style={{ objectPosition: "50% 20%" }}
          />
          {/* Degradado lateral (izquierda opaca, derecha transparente) */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(10,9,16,0.94) 0%, rgba(10,9,16,0.65) 45%, rgba(10,9,16,0.15) 100%)" }}
          />
          {/* Degradado inferior para integrar con el fondo de la página */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, #0a0910 0%, rgba(10,9,16,0) 40%)" }}
          />
        </div>

        {/* Contenido del hero */}
        <div className="relative h-full flex items-center max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-sm sm:max-w-md lg:max-w-xl">

            {/* Badges de puntuación y tipo */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="flex items-center gap-1.5 text-white text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
              >
                <Star className="w-3 h-3 fill-white" />
                {heroActual.score}
              </span>
              <span className="text-white text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                {heroActual.type} · {heroActual.year}
              </span>
            </div>

            {/* Título principal */}
            <h1
              className="font-extrabold text-white leading-none tracking-tight mb-2 text-3xl sm:text-5xl lg:text-[3.5rem]"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              {heroActual.title}
            </h1>
            <p className="text-white/55 mb-3 text-sm">{heroActual.altTitle}</p>

            {/* Metadatos del anime */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm font-semibold">{heroActual.score}</span>
              </div>
              <span className="text-white/30">•</span>
              <span className="text-white/70 text-sm">{heroActual.studio}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70 text-sm">{heroActual.eps} eps.</span>
            </div>

            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-4">
              {heroActual.genres.map(g => (
                <span
                  key={g}
                  className="text-white/90 text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Sinopsis recortada a 3 líneas */}
            <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-3">
              {heroActual.synopsis}
            </p>

            {/* Botón de acción */}
            <a
              href="#"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
            >
              <Play className="w-4 h-4 fill-white" />
              Ver detalles
            </a>
          </div>
        </div>

        {/* Indicadores de posición del carrusel */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {HERO.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideActual(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === slideActual
                  ? "w-6 h-2 bg-[#946ed9]"
                  : "w-2 h-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── SECCIÓN: En Temporada ── */}
        <section className="mb-14" aria-label="Anime en temporada">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <h2
                className="font-semibold text-xl tracking-wider"
                style={{ fontFamily: "'Oxanium', sans-serif" }}
              >
                En Temporada
              </h2>
            </div>
            <a href="#" className="flex items-center gap-1 text-[#946ed9] text-sm hover:text-[#b08ee8] transition-colors">
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Grilla responsiva: 2 cols móvil → 3 tablet → 4 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {TEMPORADA.map(anime => (
              <a key={anime.id} href="#" className="block group">
                <div className="bg-[#110f1a] rounded-2xl overflow-hidden border border-[#2a2140] group-hover:border-[#946ed9]/40 transition-all duration-200 group-hover:-translate-y-0.5 shadow-lg">
                  {/* Portada con badges superpuestos */}
                  <div className="relative aspect-[2/3] bg-[#1c1928]">
                    <img src={anime.img} alt={anime.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <TipoBadge tipo={anime.type} />
                    </div>
                    <div className="absolute top-2 left-2">
                      <PuntuacionBadge score={anime.score} />
                    </div>
                  </div>
                  {/* Información del anime */}
                  <div className="p-3">
                    <h3
                      className="font-semibold truncate text-[13px] mb-1 uppercase tracking-wide"
                      style={{ fontFamily: "'Oxanium', sans-serif" }}
                    >
                      {anime.title}
                    </h3>
                    <p className="text-[#8b82a8] text-xs">{anime.year}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN: Top Anime ── */}
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

      </main>
    </div>
  );
}
