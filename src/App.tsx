import { Outlet } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";

// ─── Layout principal de ANILIST ──────────────────────────────────────────────
// Envuelve todas las páginas con la barra de navegación y el pie de página.
// El contenido de cada ruta se renderiza a través de <Outlet />.

export default function App() {
  return (
    <div
      className="min-h-screen bg-[#0a0910] text-[#f0eefa] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Barra de navegación superior (sticky) */}
      <Navbar />

      {/* Contenido de la ruta activa */}
      <Outlet />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
