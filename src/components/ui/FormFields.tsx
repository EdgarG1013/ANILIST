import React, { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

// ─── Campo de texto genérico ──────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  /** Elemento opcional a la derecha (ej. botón de mostrar contraseña) */
  rightEl?: React.ReactNode;
  error?: string;
}

export function Field({ label, id, type = "text", placeholder, value, onChange, rightEl, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#c4bbd8]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={[
            "w-full h-11 bg-[#0d0b16] border rounded-xl px-4 text-sm text-[#f0eefa]",
            "placeholder:text-[#4a4360] focus:outline-none transition-colors",
            rightEl ? "pr-11" : "",
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[#2a2140] focus:border-[#946ed9]",
          ].join(" ")}
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── Campo de contraseña con toggle de visibilidad ────────────────────────────

interface PasswordFieldProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  error?: string;
}

export function PasswordField({ label, id, placeholder, value, onChange, error }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      label={label}
      id={id}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      rightEl={
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="text-[#8b82a8] hover:text-[#946ed9] transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

// ─── Checkbox personalizado ───────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onChange: (valor: boolean) => void;
  children: React.ReactNode;
}

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <div className="flex items-start gap-2.5">
      {/* Botón accesible que actúa como checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-all",
          checked
            ? "bg-[#946ed9] border-[#946ed9]"
            : "bg-transparent border-[#2a2140] hover:border-[#946ed9]/50",
        ].join(" ")}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </button>
      {/* Texto del checkbox — también activa/desactiva al hacer clic */}
      <span
        onClick={() => onChange(!checked)}
        className="cursor-pointer text-[13px] text-[#8b82a8] leading-snug select-none"
      >
        {children}
      </span>
    </div>
  );
}

// ─── Divisor con etiqueta central ─────────────────────────────────────────────

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#2a2140]" />
      <span className="text-[11px] text-[#4a4360] font-medium uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[#2a2140]" />
    </div>
  );
}

// ─── Spinner de carga ─────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ─── Botón principal (gradiente violeta) ──────────────────────────────────────

interface BtnPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function BtnPrimary({ loading, children, ...props }: BtnPrimaryProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={[
        "w-full h-11 rounded-xl text-white text-sm font-semibold",
        "flex items-center justify-center gap-2",
        "transition-opacity hover:opacity-90 disabled:opacity-60",
        props.className ?? "",
      ].join(" ")}
      style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", ...props.style }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
