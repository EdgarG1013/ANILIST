import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, LayoutDashboard, User } from "lucide-react";
import logo from "../../assets/logo.svg";
import { useAuth } from "../../store/auth";

// ─── Navegación principal ─────────────────────────────────────────────────────

const ENLACES_NAV = ["Temporada", "Próximos", "Top Anime y Manga"] as const;

function Avatar({ avatar }: { avatar: string }) {
  return (
    <span className="w-7 h-7 rounded-full bg-[#1c1928] border border-[#2a2140] overflow-hidden flex items-center justify-center shrink-0">
      {avatar
        ? <img src={avatar} alt="" className="w-full h-full object-cover" />
        : <User className="w-3.5 h-3.5 text-[#8b82a8]" />}
    </span>
  );
}

export default function Navbar() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const { usuario, autenticado } = useAuth();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0910]/90 border-b border-[#2a2140]">
      <div className="flex items-center max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 gap-4">

        {/* Logotipo */}
        <a href="/" className="shrink-0 flex items-center" aria-label="ANILIST — Ir al inicio">
          <img src={logo} alt="ANILIST" className="h-6 w-auto" />
        </a>

        {/* Enlace de navegación — solo visibles en desktop */}
        <div className="hidden md:flex items-center gap-0.5 ml-2">
          {ENLACES_NAV.map(enlace => (
            <a
              key={enlace}
              href="/"
              className="text-[#8b82a8] hover:text-[#f0eefa] text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
            >
              {enlace}
            </a>
          ))}
        </div>

        {/* Espaciador flexible */}
        <div className="flex-1" />

        {/* Buscador — visible desde tablet */}
        <div className="hidden sm:block w-60 lg:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b82a8]" />
            <input
              type="search"
              placeholder="Buscar anime, manga…"
              className="w-full h-9 bg-[#16141e] border border-[#2a2140] text-sm pl-9 pr-4 rounded-xl text-[#f0eefa] placeholder:text-[#8b82a8] focus:outline-none focus:border-[#946ed9] transition-colors"
            />
          </div>
        </div>

        {/* Botones de autenticación / Dashboard — desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {autenticado ? (
            <Link
              to="/panel"
              className="h-9 px-3 pl-2 flex items-center gap-2 text-sm font-semibold text-white rounded-xl border border-[#946ed9]/60 hover:border-[#b08ee8] hover:opacity-95 transition-all"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
            >
              <Avatar avatar={usuario!.avatar} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/iniciar-sesion"
                className="h-9 px-4 text-sm font-semibold text-[#f0eefa] border border-[#2a2140] rounded-xl hover:border-[#946ed9]/50 hover:bg-[#16141e] transition-all flex items-center"
                style={{ fontFamily: "'Oxanium', sans-serif" }}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="h-9 px-4 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 flex items-center"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Controles móviles: buscador + hamburguesa */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            aria-label="Buscar"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8]"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMenuMovilAbierto(o => !o)}
            aria-label="Menú"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8]"
          >
            {menuMovilAbierto ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Menú desplegable móvil ── */}
      {menuMovilAbierto && (
        <div className="sm:hidden bg-[#110f1a] border-t border-[#2a2140] px-4 py-3 space-y-1">
          {/* Enlace de secciones */}
          {ENLACES_NAV.map(enlace => (
            <a
              key={enlace}
              href="/"
              className="block text-[#8b82a8] hover:text-[#f0eefa] text-sm px-3 py-2 rounded-lg transition-colors"
            >
              {enlace}
            </a>
          ))}

          {/* Buscador móvil */}
          <div className="relative pt-1">
            <Search className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 w-4 h-4 text-[#8b82a8]" />
            <input
              type="search"
              placeholder="Buscar anime, manga…"
              className="w-full h-9 bg-[#16141e] border border-[#2a2140] text-sm pl-9 pr-4 rounded-xl text-[#f0eefa] placeholder:text-[#8b82a8] focus:outline-none"
            />
          </div>

          {/* Botones de auth / Dashboard en móvil */}
          <div className="flex gap-2 pt-3">
            {autenticado ? (
              <Link
                to="/panel"
                className="flex-1 h-9 text-xs font-semibold text-white rounded-xl flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
                onClick={() => setMenuMovilAbierto(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/iniciar-sesion"
                  className="flex-1 h-9 text-xs font-semibold text-[#f0eefa] border border-[#2a2140] rounded-xl flex items-center justify-center"
                  style={{ fontFamily: "'Oxanium', sans-serif" }}
                  onClick={() => setMenuMovilAbierto(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="flex-1 h-9 text-xs font-semibold text-white rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
                  onClick={() => setMenuMovilAbierto(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}