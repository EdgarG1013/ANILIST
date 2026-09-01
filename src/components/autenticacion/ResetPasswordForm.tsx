import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { PasswordField, BtnPrimary } from "../ui/FormFields";
import { restablecerContrasena } from "../../api/authService";

function calcularSeguridad(pass: string): { nivel: number; texto: string } {
  if (pass.length === 0) return { nivel: 0, texto: "" };
  if (pass.length < 8) return { nivel: 1, texto: "Contraseña débil" };
  const tieneMayuscula = /[A-Z]/.test(pass);
  const tieneNumero = /[0-9]/.test(pass);
  const tieneEspecial = /[^a-zA-Z0-9]/.test(pass);
  if (pass.length >= 12 && tieneMayuscula && tieneNumero && tieneEspecial)
    return { nivel: 4, texto: "Contraseña muy fuerte" };
  if (pass.length >= 10 && tieneMayuscula && tieneNumero)
    return { nivel: 3, texto: "Contraseña fuerte" };
  return { nivel: 2, texto: "Contraseña aceptable" };
}

const COLORES_SEGURIDAD: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-yellow-500",
  3: "bg-blue-400",
  4: "bg-emerald-400",
};

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const correo = searchParams.get("correo") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const seguridad = calcularSeguridad(password);
  const tokenValido = token.length > 0 && correo.length > 0;

  function validar(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 8) e.password = "Debe tener al menos 8 caracteres.";
    if (!confirmar) e.confirmar = "Confirma tu contraseña.";
    else if (confirmar !== password) e.confirmar = "Las contraseñas no coinciden.";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      await restablecerContrasena(correo, token, password);
      setExito(true);
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || "El enlace expiró o es inválido. Solicita uno nuevo.";
      setErrores({ general: msg });
    } finally {
      setCargando(false);
    }
  }

  if (!tokenValido) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#f0eefa] mb-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            Enlace inválido
          </h2>
          <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">
            El enlace de recuperación no es válido o está incompleto. Solicita uno nuevo.
          </p>
        </div>
        <Link
          to="/recuperar-password"
          className="text-sm text-[#946ed9] font-semibold hover:text-[#b08ee8] transition-colors"
        >
          Solicitar nuevo enlace
        </Link>
        <Link
          to="/iniciar-sesion"
          className="flex items-center gap-1.5 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="flex flex-col items-center gap-9 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#f0eefa] mb-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            ¡Contraseña actualizada!
          </h2>
          <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
        <button
          onClick={() => navigate("/iniciar-sesion")}
          className="h-11 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[#946ed9]/15 flex items-center justify-center">
          <Lock size={20} className="text-[#946ed9]" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#f0eefa]" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            Nueva contraseña
          </h2>
          <p className="text-sm text-[#8b82a8] mt-2 max-w-xs">
            Ingresa tu nueva contraseña para <span className="text-[#946ed9] font-medium">{correo}</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {errores.general && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
            {errores.general}
          </p>
        )}

        <PasswordField
          label="Nueva contraseña"
          id="reset-pass"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={val => { setPassword(val); setErrores(prev => ({ ...prev, password: "" })); }}
          error={errores.password}
        />

        {password.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={[
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= seguridad.nivel ? COLORES_SEGURIDAD[seguridad.nivel] : "bg-[#2a2140]",
                  ].join(" ")}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#8b82a8]">{seguridad.texto}</span>
          </div>
        )}

        <PasswordField
          label="Confirmar contraseña"
          id="reset-confirmar"
          placeholder="Repite tu contraseña"
          value={confirmar}
          onChange={val => { setConfirmar(val); setErrores(prev => ({ ...prev, confirmar: "" })); }}
          error={errores.confirmar}
        />

        <BtnPrimary type="submit" loading={cargando}>
          {cargando ? "Guardando…" : "Guardar contraseña"}
        </BtnPrimary>
      </form>

      <Link
        to="/iniciar-sesion"
        className="flex items-center gap-1.5 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio de sesión
      </Link>
    </div>
  );
}