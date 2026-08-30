import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, PasswordField, Checkbox, Divider, BtnPrimary } from "../ui/FormFields";
import { useAuth } from "../../store/auth";

// ─── Formulario de inicio de sesión (lógica) ─────────────────────────────────

function validar(identificador: string, contrasena: string) {
  const errores: Record<string, string> = {};
  if (!identificador.trim())
    errores.identificador = "Este campo es obligatorio.";
  if (!contrasena)
    errores.contrasena = "Este campo es obligatorio.";
  else if (contrasena.length < 6)
    errores.contrasena = "La contraseña debe tener al menos 6 caracteres.";
  return errores;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identificador, setIdentificador] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recuerdame, setRecuerdame] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar(identificador, contrasena);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      await login(identificador, contrasena);
      navigate("/panel");
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || "Credenciales incorrectas. Intenta de nuevo.";
      setErrores({ general: msg });
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="mb-1">
        <h2
          className="text-2xl font-extrabold text-[#f0eefa]"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          Iniciar sesión
        </h2>
        <p className="text-sm text-[#8b82a8] mt-1">No te pierdas tus anime favoritos</p>
      </div>

      {/* Error general */}
      {errores.general && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
          {errores.general}
        </p>
      )}

      {/* Campos del formulario */}
      <Field
        label="Usuario o Email"
        id="login-id"
        placeholder="tu_usuario o correo@ejemplo.com"
        value={identificador}
        onChange={setIdentificador}
        error={errores.identificador}
      />

      <PasswordField
        label="Contraseña"
        id="login-pass"
        placeholder="••••••••"
        value={contrasena}
        onChange={setContrasena}
        error={errores.contrasena}
      />

      {/* Opciones secundarias: recuérdame y recuperar contraseña */}
      <div className="flex items-center justify-between gap-2">
        <Checkbox checked={recuerdame} onChange={setRecuerdame}>
          Recuérdame
        </Checkbox>
        <Link
          to="/recuperar-password"
          className="text-[13px] text-[#946ed9] hover:text-[#b08ee8] transition-colors shrink-0"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Botones: Volver e Ingresar */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-bold"
        >
          ← Volver
        </button>
        <BtnPrimary
          type="submit"
          loading={cargando}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#946ed9] bg-[#946ed9] hover:bg-[#b08ee8] hover:border-[#b08ee8] transition-all text-sm text-[#c4bbd8] font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {cargando ? "Iniciando sesión…" : "Ingresar"}
        </BtnPrimary>
      </div>

      <Divider label="o continúa con" />

      {/* Botones de acceso social */}
      <div className="grid grid-cols-2 gap-3">
        {/* Botón de Google */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* Botón de Discord */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 127.14 96.36">
            <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.18,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,69.43,69.43,0,0,1-10.5-5A52,52,0,0,0,31.7,77.73a74.22,74.22,0,0,0,63.74,0,52,52,0,0,0,3.58,2.78,69.43,69.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.3,51.49,123.38,28.69,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.92,46,53.74,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.16,46,96,53,91,65.69,84.69,65.69Z"/>
          </svg>
          Discord
        </button>
      </div>

      {/* Enlace para ir a registro */}
      <p className="text-center text-sm text-[#8b82a8]">
        ¿No tienes cuenta?{" "}
        <Link
          to="/registro"
          className="text-[#946ed9] font-semibold hover:text-[#b08ee8] transition-colors"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}