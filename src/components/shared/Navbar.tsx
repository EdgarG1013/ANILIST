import { useState } from "react";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";

// ─── Props de la barra de navegación ──────────────────────────────────────────

interface NavbarProps {
  /** Usuario autenticado. null si no hay sesión iniciada */
  usuario: string | null;
  /** Abre el modal de inicio de sesión */
  onIniciarSesion: () => void;
  /** Abre el modal de registro */
  onRegistrarse: () => void;
  /** Cierra la sesión del usuario actual */
  onCerrarSesion: () => void;
}

// ─── Navegación principal ─────────────────────────────────────────────────────

const ENLACES_NAV = ["Populares", "Temporada", "Próximos", "Top en emisión"] as const;

export default function Navbar({ usuario, onIniciarSesion, onRegistrarse, onCerrarSesion }: NavbarProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0910]/90 border-b border-[#2a2140]">
      <div className="flex items-center max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 gap-4">

        {/* Logotipo */}
        <a href="#" className="shrink-0 flex items-center" aria-label="ANILIST — Ir al inicio">
          <Logo className="h-6 w-auto" />
        </a>

        {/* Enlace de navegación — solo visibles en desktop */}
        <div className="hidden md:flex items-center gap-0.5 ml-2">
          {ENLACES_NAV.map(enlace => (
            <a
              key={enlace}
              href="#"
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

        {/* Sección de autenticación — desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {usuario ? (
            /* Usuario autenticado: muestra avatar + menú desplegable */
            <div className="relative">
              <button
                onClick={() => setMenuUsuarioAbierto(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#16141e] transition-colors"
              >
                {/* Avatar con inicial del usuario */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#946ed9] to-[#7c4dca] flex items-center justify-center text-white text-xs font-bold uppercase">
                  {usuario[0]}
                </div>
                <span className="text-sm hidden lg:block">{usuario}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8b82a8]" />
              </button>

              {/* Menú desplegable del usuario */}
              {menuUsuarioAbierto && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#110f1a] border border-[#2a2140] rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                  {["Mi lista", "Perfil", "Configuración"].map(item => (
                    <button
                      key={item}
                      className="w-full text-left px-4 py-2 text-sm text-[#c4bbd8] hover:bg-[#1c1928] hover:text-[#f0eefa] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                  <div className="h-px bg-[#2a2140] my-1" />
                  <button
                    onClick={() => { onCerrarSesion(); setMenuUsuarioAbierto(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1c1928] transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Sin sesión: muestra botones de auth */
            <>
              <button
                onClick={onIniciarSesion}
                className="h-9 px-4 text-sm font-semibold text-[#f0eefa] border border-[#2a2140] rounded-xl hover:border-[#946ed9]/50 hover:bg-[#16141e] transition-all"
              >
                Iniciar sesión
              </button>
              <button
                onClick={onRegistrarse}
                className="h-9 px-4 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
              >
                Registrarse
              </button>
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
              href="#"
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

          {/* Botones de auth en móvil */}
          {!usuario ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMenuMovilAbierto(false); onIniciarSesion(); }}
                className="flex-1 h-9 text-sm font-semibold text-[#f0eefa] border border-[#2a2140] rounded-xl"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setMenuMovilAbierto(false); onRegistrarse(); }}
                className="flex-1 h-9 text-sm font-semibold text-white rounded-xl"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
              >
                Registrarse
              </button>
            </div>
          ) : (
            /* Usuario autenticado en móvil */
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#946ed9] to-[#7c4dca] flex items-center justify-center text-white text-xs font-bold uppercase">
                {usuario[0]}
              </div>
              <span className="text-sm flex-1">{usuario}</span>
              <button
                onClick={onCerrarSesion}
                className="text-sm text-red-400"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
