import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Nombre del elemento que se va a eliminar */
  title: string;
  /** Tipo de elemento (para el texto de la confirmación) */
  itemLabel?: string;
  isDeleting?: boolean;
}

// ─── Modal de confirmación para eliminar elementos ────────────────────────────

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemLabel = "elemento",
  isDeleting = false,
}: DeleteConfirmModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onClose();
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(6,5,14,0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={e => e.target === e.currentTarget && !isDeleting && onClose()}
    >
      <div className="bg-[#110f1a] rounded-2xl max-w-md w-full p-8 shadow-2xl border border-[#2a2140]" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        <div className="w-12 h-12 rounded-full bg-[#ff9aa8]/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-[#ff9aa8]" />
        </div>
        <h2 className="text-xl text-[#f0eefa] text-center mb-2 font-semibold" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          ¿Eliminar {itemLabel}?
        </h2>
        <p className="text-[#8b82a8] text-center mb-6 text-sm leading-relaxed">
          Se eliminará <span className="text-[#f0eefa] font-medium">"{title}"</span>.
          Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-11 border border-[#2a2140] text-[#f0eefa] rounded-xl hover:bg-[#16141e] transition-colors disabled:opacity-50 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-11 bg-[#d4183d] text-white rounded-xl hover:bg-[#b31033] transition-colors disabled:opacity-50 flex items-center justify-center text-sm font-semibold"
          >
            {isDeleting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}