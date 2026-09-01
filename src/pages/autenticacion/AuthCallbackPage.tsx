import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../store/auth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cargarPerfil } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError(true);
      return;
    }

    localStorage.setItem("token", token);

    cargarPerfil()
      .then(() => {
        navigate("/panel", { replace: true });
      })
      .catch(() => {
        setError(true);
      });
  }, [searchParams, cargarPerfil, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0910] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <span className="text-2xl">✕</span>
          </div>
          <h1
            className="text-xl font-extrabold text-[#f0eefa]"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            Error de autenticación
          </h1>
          <p className="text-sm text-[#8b82a8] max-w-sm">
            No se pudo completar el inicio de sesión. Intenta de nuevo desde la página de login.
          </p>
          <button
            onClick={() => navigate("/iniciar-sesion", { replace: true })}
            className="mt-2 h-10 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0910] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#946ed9] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#8b82a8]">Iniciando sesión…</p>
      </div>
    </div>
  );
}
