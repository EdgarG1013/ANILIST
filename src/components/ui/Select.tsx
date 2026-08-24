import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

// ─── Select personalizado con estilo oscuro ──────────────────────────────────

export interface SelectOption {
  valor: string;
  etiqueta: string;
}

interface SelectProps {
  valor: string;
  onChange: (v: string) => void;
  opciones: SelectOption[];
  placeholder?: string;
  /** Clases extra para el contenedor */
  className?: string;
}

export default function Select({ valor, onChange, opciones, placeholder = "Seleccionar", className = "" }: SelectProps) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const etiquetaActual = opciones.find(o => o.valor === valor)?.etiqueta ?? placeholder;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return;
    function alClickear(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClickear);
    return () => document.removeEventListener("mousedown", alClickear);
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto(a => !a)}
        className={`w-full h-10 bg-[#16141e] border rounded-xl px-3 text-sm text-left flex items-center justify-between gap-2 transition-colors ${
          abierto ? "border-[#946ed9]" : "border-[#2a2140] hover:border-[#946ed9]/50"
        } ${valor ? "text-[#f0eefa]" : "text-[#8b82a8]"}`}
      >
        <span className="truncate">{etiquetaActual}</span>
        <ChevronDown className={`w-4 h-4 text-[#8b82a8] shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div
          className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-[#2a2140] shadow-2xl"
          style={{ backgroundColor: "#16141e", boxShadow: "0 15px 40px rgba(0,0,0,0.5)" }}
        >
          {opciones.map(o => {
            const seleccionado = o.valor === valor;
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => { onChange(o.valor); setAbierto(false); }}
                className={`w-full px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 transition-colors ${
                  seleccionado
                    ? "bg-[#946ed9]/15 text-[#b08ee8]"
                    : "text-[#f0eefa] hover:bg-[#946ed9]/10"
                }`}
              >
                <span className="truncate">{o.etiqueta}</span>
                {seleccionado && <Check className="w-4 h-4 text-[#946ed9] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}