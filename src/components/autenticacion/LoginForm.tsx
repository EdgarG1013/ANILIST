import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, PasswordField, Checkbox, Divider, BtnPrimary } from "../ui/FormFields";

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
  const [identificador, setIdentificador] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recuerdame, setRecuerdame] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar(identificador, contrasena);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    // Simula la llamada a la API de autenticación
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      navigate("/");
    }, 900);
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

      {/* Botones de acceso social (placeholder) */}
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Google", inicial: "G" }, { label: "Discord", inicial: "D" }].map(s => (
          <button
            key={s.label}
            type="button"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-medium"
          >
            <span className="w-5 h-5 rounded-full bg-[#2a2140] flex items-center justify-center text-[10px] font-bold text-[#946ed9]">
              {s.inicial}
            </span>
            {s.label}
          </button>
        ))}
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