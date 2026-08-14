import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, PasswordField, Checkbox, BtnPrimary } from "../ui/FormFields";

// ─── Formulario de registro (lógica) ─────────────────────────────────────────

function validar(
  usuario: string,
  email: string,
  contrasena: string,
  confirmar: string,
  terminos: boolean,
) {
  const errores: Record<string, string> = {};

  if (!usuario.trim())
    errores.usuario = "El nombre de usuario es obligatorio.";
  else if (usuario.length < 3)
    errores.usuario = "Debe tener al menos 3 caracteres.";

  if (!email.trim())
    errores.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errores.email = "Ingresa un email válido.";

  if (!contrasena)
    errores.contrasena = "La contraseña es obligatoria.";
  else if (contrasena.length < 8)
    errores.contrasena = "Debe tener al menos 8 caracteres.";

  if (!confirmar)
    errores.confirmar = "Confirma tu contraseña.";
  else if (confirmar !== contrasena)
    errores.confirmar = "Las contraseñas no coinciden.";

  if (!terminos)
    errores.terminos = "Debes aceptar los términos para continuar.";

  return errores;
}

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

export default function RegisterForm() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  const seguridad = calcularSeguridad(contrasena);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar(usuario, email, contrasena, confirmar, terminos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    // Simula la llamada a la API de registro
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      navigate("/");
    }, 900);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="mb-1">
        <h2
          className="text-2xl font-extrabold text-[#f0eefa]"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          Crear cuenta
        </h2>
        <p className="text-sm text-[#8b82a8] mt-1">Únete a la comunidad ANILIST</p>
      </div>

      {/* Usuario y email en cuadrícula — se apila en móvil */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Nombre de usuario"
          id="reg-usuario"
          placeholder="tu_usuario"
          value={usuario}
          onChange={setUsuario}
          error={errores.usuario}
        />
        <Field
          label="Email"
          id="reg-email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={setEmail}
          error={errores.email}
        />
      </div>

      <PasswordField
        label="Contraseña"
        id="reg-pass"
        placeholder="Mínimo 8 caracteres"
        value={contrasena}
        onChange={setContrasena}
        error={errores.contrasena}
      />

      {/* Indicador de seguridad de la contraseña */}
      {contrasena.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={[
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= seguridad.nivel
                    ? COLORES_SEGURIDAD[seguridad.nivel]
                    : "bg-[#2a2140]",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#8b82a8]">{seguridad.texto}</span>
        </div>
      )}

      <PasswordField
        label="Confirmar contraseña"
        id="reg-confirmar"
        placeholder="Repite tu contraseña"
        value={confirmar}
        onChange={setConfirmar}
        error={errores.confirmar}
      />

      {/* Aceptación de términos */}
      <div>
        <Checkbox checked={terminos} onChange={setTerminos}>
          Acepto los{" "}
          <Link to="/terminos" className="text-[#946ed9] hover:underline">
            Términos de Servicio
          </Link>{" "}
          y la{" "}
          <Link to="/privacidad" className="text-[#946ed9] hover:underline">
            Política de Privacidad
          </Link>
        </Checkbox>
        {errores.terminos && (
          <p className="text-red-400 text-xs mt-1.5">{errores.terminos}</p>
        )}
      </div>

      {/* Botón principal */}
      <BtnPrimary type="submit" loading={cargando}>
        {cargando ? "Creando cuenta…" : "Crear cuenta"}
      </BtnPrimary>

      {/* Enlace para ir a inicio de sesión */}
      <p className="text-center text-sm text-[#8b82a8]">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/iniciar-sesion"
          className="text-[#946ed9] font-semibold hover:text-[#b08ee8] transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}