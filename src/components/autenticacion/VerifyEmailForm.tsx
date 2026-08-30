import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verificarEmail } from "../../api/authService";

export default function VerifyEmailForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [estado, setEstado] = useState<"cargando" | "exito" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setMensaje("El enlace de verificación no es válido o está incompleto.");
      return;
    }

    verificarEmail(token)
      .then(res => {
        setEstado("exito");
        setMensaje(res.mensaje || "Tu correo ha sido verificado correctamente.");
      })
      .catch(err => {
        setEstado("error");
        setMensaje(
          err?.response?.data?.mensaje ||
          "El enlace expiró o es inválido. Solicita uno nuevo."
        );
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-9 text-center py-4">
      {estado === "cargando" && (
        <>
          <div className="w-16 h-16 rounded-full bg-[#946ed9]/15 border border-[#946ed9]/30 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#946ed9] animate-spin" />
          </div>
          <div>
            <h2
              className="text-2xl font-extrabold text-[#f0eefa] mb-2"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              Verificando tu correo...
            </h2>
            <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">
              Un momento mientras confirmamos tu dirección de correo.
            </p>
          </div>
        </>
      )}

      {estado === "exito" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h2
              className="text-2xl font-extrabold text-[#f0eefa] mb-2"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              ¡Correo verificado!
            </h2>
            <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">{mensaje}</p>
          </div>
          <Link
            to="/iniciar-sesion"
            className="h-11 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 inline-flex items-center"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
          >
            Iniciar sesión
          </Link>
        </>
      )}

      {estado === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2
              className="text-2xl font-extrabold text-[#f0eefa] mb-2"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              No se pudo verificar
            </h2>
            <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">{mensaje}</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              to="/registro"
              className="h-11 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 inline-flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
            >
              Crear otra cuenta
            </Link>
            <Link
              to="/iniciar-sesion"
              className="flex items-center justify-center gap-1.5 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </>
      )}
    </div>
  );
}