import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { type AuthMode, AUTH_BG } from "../../api/anime";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

// ─── Props del modal de autenticación ────────────────────────────────────────

interface AuthModalProps {
  /** Modo de visualización actual del modal */
  modo: Exclude<AuthMode, "ninguno">;
  /** Cierra el modal */
  onCerrar: () => void;
  /** Cambia entre las diferentes vistas de autenticación */
  onCambiarModo: (modo: Exclude<AuthMode, "ninguno">) => void;
  /** Llamado cuando la autenticación fue exitosa */
  onExito: (usuario: string) => void;
}

// ─── Modal contenedor de autenticación ───────────────────────────────────────
// Muestra la vista de login, registro o recuperación según el modo activo.
// Fondo: imagen fotográfica sin degradado, solo una capa plana oscura para
// mantener la legibilidad del formulario.

export default function AuthModal({ modo, onCerrar, onCambiarModo, onExito }: AuthModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCerrar]);

  // Bloquear el scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Cerrar al hacer clic en el overlay (fuera del card)
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onCerrar();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* ── Fondo fotográfico — sin degradado ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={AUTH_BG}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Capa plana oscura — no es degradado, solo opacidad uniforme */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Botón de cierre */}
      <button
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* ── Card del formulario ── */}
      <div className="relative z-10 w-full max-w-md my-8 bg-[#0e0c18]/92 backdrop-blur-2xl border border-[#2a2140] rounded-2xl shadow-2xl overflow-hidden">

        {/* Línea de acento violeta en el tope del card */}
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, #946ed9, transparent)" }}
        />

        <div className="p-7 sm:p-8 flex flex-col gap-6">

          {/* Selector de modo: solo visible en login y registro, no en recuperación */}
          {modo !== "recuperar" && (
            <div className="flex bg-[#0d0b16] border border-[#2a2140] rounded-xl p-1 gap-1">
              {(["login", "registro"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onCambiarModo(m)}
                  className={[
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    modo === m
                      ? "bg-[#946ed9] text-white shadow"
                      : "text-[#8b82a8] hover:text-[#f0eefa]",
                  ].join(" ")}
                >
                  {m === "login" ? "Iniciar sesión" : "Registrarse"}
                </button>
              ))}
            </div>
          )}

          {/* Renderiza la vista correspondiente al modo activo */}
          {modo === "login" && (
            <LoginPage
              onIrARegistro={() => onCambiarModo("registro")}
              onIrARecuperar={() => onCambiarModo("recuperar")}
              onExito={onExito}
            />
          )}
          {modo === "registro" && (
            <RegisterPage
              onIrALogin={() => onCambiarModo("login")}
              onExito={onExito}
            />
          )}
          {modo === "recuperar" && (
            <ForgotPasswordPage
              onIrALogin={() => onCambiarModo("login")}
            />
          )}

        </div>
      </div>
    </div>
  );
}
