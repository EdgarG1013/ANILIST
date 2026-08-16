import { Star } from "lucide-react";
import { TIPO_COLORES } from "../../api/anime";

// ─── Badge de tipo de anime (TV, ONA, OVA, Movie) ────────────────────────────

export function TipoBadge({ tipo, className = "" }: { tipo: string; className?: string }) {
  const color = TIPO_COLORES[tipo] ?? "bg-[#6b3fa0]";
  return (
    <span className={`text-white text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${color} ${className}`}>
      {tipo}
    </span>
  );
}

// ─── Badge de puntuación con estrella ─────────────────────────────────────────

export function PuntuacionBadge({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1 bg-black/55 backdrop-blur-sm text-[11px] px-2 py-0.5 rounded-md">
      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
      <span className="text-white font-medium">{score}</span>
    </span>
  );
}