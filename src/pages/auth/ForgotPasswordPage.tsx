import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Logo from "../../components/shared/Logo";
import { Field, BtnPrimary } from "../../components/ui/FormFields";

// ─── Props de la página de recuperación de contraseña ────────────────────────

interface ForgotPasswordPageProps {
  /** Vuelve al formulario de inicio de sesión */
  onIrALogin: () => void;
}

// ─── Tiempo de espera para reenvío (en segundos) ──────────────────────────────
const TIEMPO_REENVIO = 60;

// ─── Página / vista de recuperación de contraseña ────────────────────────────

export default function ForgotPasswordPage({ onIrALogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  /** Contador de segundos restantes para poder reenviar */
  const [countdown, setCountdown] = useState(0);

  // Cuenta regresiva para el botón de reenvío
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function validarEmail() {
    if (!email.trim()) return "El email es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Ingresa un email válido.";
    return "";
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const err = validarEmail();
    setErrorEmail(err);
    if (err) return;

    // Simula el envío del email de recuperación
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      setEnviado(true);
      setCountdown(TIEMPO_REENVIO);
    }, 1000);
  }

  function handleReenviar() {
    if (countdown > 0) return;
    // Simula reenvío
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      setCountdown(TIEMPO_REENVIO);
    }, 800);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado con logo */}
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-8 w-auto" />
      </div>

      {!enviado ? (
        /* ── Estado inicial: formulario de solicitud ── */
        <>
          {/* Ícono y títulos */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#946ed9]/15 border border-[#946ed9]/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#946ed9]" />
            </div>
            <div>
              <h2
                className="text-2xl font-extrabold text-[#f0eefa]"
                style={{ fontFamily: "'Oxanium', sans-serif" }}
              >
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-sm text-[#8b82a8] mt-1 max-w-xs mx-auto">
                Ingresa tu email y te enviaremos las instrucciones para recuperar el acceso.
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Field
              label="Email registrado"
              id="recuperar-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={val => { setEmail(val); setErrorEmail(""); }}
              error={errorEmail}
            />

            <BtnPrimary type="submit" loading={cargando}>
              {cargando ? "Enviando instrucciones…" : "Enviar instrucciones"}
            </BtnPrimary>
          </form>

          {/* Enlace para volver al login */}
          <button
            type="button"
            onClick={onIrALogin}
            className="flex items-center justify-center gap-1.5 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
        </>
      ) : (
        /* ── Estado de éxito: confirmación de envío ── */
        <div className="flex flex-col items-center gap-5 text-center py-4">
          {/* Ícono de éxito */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>

          <div>
            <h2
              className="text-2xl font-extrabold text-[#f0eefa] mb-2"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              ¡Revisa tu correo!
            </h2>
            <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">
              Enviamos las instrucciones de recuperación a{" "}
              <span className="text-[#946ed9] font-medium">{email}</span>.
              Revisa también tu carpeta de spam.
            </p>
          </div>

          {/* Botón de reenvío con cuenta regresiva */}
          <button
            type="button"
            onClick={handleReenviar}
            disabled={countdown > 0 || cargando}
            className="text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#946ed9] hover:text-[#b08ee8] disabled:text-[#8b82a8]"
          >
            {cargando
              ? "Reenviando…"
              : countdown > 0
              ? `Reenviar instrucciones (${countdown}s)`
              : "Reenviar instrucciones"}
          </button>

          {/* Separador */}
          <div className="h-px w-full bg-[#2a2140]" />

          {/* Volver al login */}
          <button
            type="button"
            onClick={onIrALogin}
            className="flex items-center gap-1.5 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
}
