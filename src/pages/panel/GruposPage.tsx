import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Trash2, Layers, Search, ImageIcon } from "lucide-react";
import { useBiblioteca, type Grupo } from "../../store/biblioteca";
import DeleteConfirmModal from "../../components/compartido/DeleteConfirmModal";

// ─── Grupos: índice de colecciones. El detalle vive en /panel/grupos/:id ─────

export default function GruposPage() {
  const { grupos, crearGrupo, eliminarGrupo } = useBiblioteca();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [portada, setPortada] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [filtro, setFiltro] = useState("");
  const [aEliminar, setAEliminar] = useState<Grupo | null>(null);

  const visibles = grupos.filter(g => {
    const t = filtro.trim().toLowerCase();
    if (!t) return true;
    return (
      g.titulo.toLowerCase().includes(t) ||
      g.descripcion.toLowerCase().includes(t) ||
      g.etiquetas.some(e => e.toLowerCase().includes(t))
    );
  });

  const campo =
    "w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-1" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Grupos
      </h1>
      <p className="text-sm text-[#8b82a8] mb-5">
        Crea una colección con portada y etiquetas; entra en ella para organizar sus listas.
      </p>

      {/* Crear grupo */}
      <form
        onSubmit={ev => {
          ev.preventDefault();
          if (!titulo.trim()) return;
          crearGrupo({
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            portada: portada.trim(),
            etiquetas: etiquetas.split(",").map(e => e.trim()).filter(Boolean),
          });
          setTitulo(""); setDescripcion(""); setPortada(""); setEtiquetas("");
        }}
        className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4 mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div>
          <label htmlFor="g-titulo" className="block text-xs text-[#8b82a8] mb-1">Título del grupo</label>
          <input id="g-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Clásicos de los 90" className={campo} />
        </div>
        <div>
          <label htmlFor="g-desc" className="block text-xs text-[#8b82a8] mb-1">Descripción</label>
          <input id="g-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Lo que quiero revisitar" className={campo} />
        </div>
        <div>
          <label htmlFor="g-portada" className="block text-xs text-[#8b82a8] mb-1">Portada (URL)</label>
          <input id="g-portada" value={portada} onChange={e => setPortada(e.target.value)} placeholder="https://…" className={campo} />
        </div>
        <div>
          <label htmlFor="g-tags" className="block text-xs text-[#8b82a8] mb-1">Etiquetas (coma)</label>
          <input id="g-tags" value={etiquetas} onChange={e => setEtiquetas(e.target.value)} placeholder="retro, shounen" className={campo} />
        </div>
        <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
          <button
            type="submit"
            className="h-10 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 w-full sm:w-auto justify-center"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
          >
            <FolderPlus className="w-4 h-4" /> Crear grupo
          </button>
        </div>
      </form>

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-[#8b82a8] absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <label htmlFor="g-filtro" className="sr-only">Buscar grupos</label>
        <input
          id="g-filtro" value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por título, descripción o etiqueta…"
          className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:border-[#946ed9]"
        />
      </div>

      {visibles.length === 0 ? (
        <p className="py-16 text-center text-[#8b82a8]">
          {grupos.length === 0 ? "Todavía no tienes grupos. Crea el primero arriba." : "Ningún grupo coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map(g => {
            const total = g.listas.reduce((n, l) => n + l.items.length, 0);
            return (
              <li key={g.id} className="relative group">
                <Link
                  to={`/panel/grupos/${g.id}`}
                  className="block h-full bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden hover:border-[#946ed9]/60 transition-colors"
                >
                  <div className="aspect-[16/7] bg-[#16141e] flex items-center justify-center">
                    {g.portada ? (
                      <img src={g.portada} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#2a2140]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-semibold tracking-wide pr-10 truncate" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                      {g.titulo}
                    </h2>
                    {g.descripcion && <p className="text-sm text-[#8b82a8] mt-1 line-clamp-2">{g.descripcion}</p>}
                    <ul className="flex flex-wrap gap-1.5 mt-3">
                      {g.etiquetas.map(t => (
                        <li key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">
                          #{t}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[#8b82a8] mt-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                      {g.listas.length} listas · {total} títulos
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setAEliminar(g)}
                  aria-label={`Eliminar grupo ${g.titulo}`}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-[#0f0d16]/80 border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteConfirmModal
        isOpen={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        onConfirm={() => {
          if (aEliminar) { eliminarGrupo(aEliminar.id); setAEliminar(null); }
        }}
        title={aEliminar?.titulo ?? ""}
        itemLabel="grupo"
      />
    </div>
  );
}
