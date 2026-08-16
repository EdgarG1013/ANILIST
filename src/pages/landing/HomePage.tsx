import HeroSection from "../../components/landing/HeroSection";
import SeasonSection from "../../components/landing/SeasonSection";
import ProximosSection from "../../components/landing/ProximosSection";
import MostPopularSection from "../../components/landing/MostPopularSection";

// ─── Página de inicio — Landing page ─────────────────────────────────────────
// Compone las secciones de la landing. Cada sección vive en /components/landing.

export default function HomePage() {
  return (
    <div>
      {/* HERO — Carrusel principal */}
      <HeroSection />

      {/* Contenido principal */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* En Temporada */}
        <SeasonSection />

        {/* Próximos estrenos */}
        <ProximosSection />

        {/* Más Populares — anime y manga */}
        <MostPopularSection />

      </main>
    </div>
  );
}