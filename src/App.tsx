import { useState } from "react";
import { type AuthMode } from "./api/anime";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import HomePage from "./pages/home/HomePage";
import AuthModal from "./pages/auth/AuthModal";

// ─── Punto de entrada principal de ANILIST ────────────────────────────────────
// Gestiona el estado global de autenticación y orquesta las vistas/modales.
// Para agregar más páginas en el futuro, crear el componente en /pages y
// añadir el estado de navegación aquí.

export default function App() {
  /** Usuario autenticado. null indica que no hay sesión activa */
  const [usuario, setUsuario] = useState<string | null>(null);

  /** Modo del modal de autenticación. "ninguno" = modal cerrado */
  const [modoAuth, setModoAuth] = useState<AuthMode>("ninguno");

  // ─── Manejadores de autenticación ─────────────────────────────────────────

  function handleExitoAuth(nombreUsuario: string) {
    setUsuario(nombreUsuario);
    setModoAuth("ninguno");
  }

  function handleCerrarSesion() {
    setUsuario(null);
  }

  return (
    <div
      className="min-h-screen bg-[#0a0910] text-[#f0eefa] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Modal de autenticación — se monta solo cuando está activo */}
      {modoAuth !== "ninguno" && (
        <AuthModal
          modo={modoAuth}
          onCerrar={() => setModoAuth("ninguno")}
          onCambiarModo={setModoAuth}
          onExito={handleExitoAuth}
        />
      )}

      {/* Barra de navegación superior (sticky) */}
      <Navbar
        usuario={usuario}
        onIniciarSesion={() => setModoAuth("login")}
        onRegistrarse={() => setModoAuth("registro")}
        onCerrarSesion={handleCerrarSesion}
      />

      {/* Página de inicio — hero + secciones de anime */}
      <HomePage />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}

