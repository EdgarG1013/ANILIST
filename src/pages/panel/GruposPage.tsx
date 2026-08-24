import { useMemo, useState } from "react";
import { FolderPlus, Trash2, Plus, GripVertical, X } from "lucide-react";
import { useBiblioteca, type Grupo, type ListaPersonalizada } from "../../store/biblioteca";
import DeleteConfirmModal from "../../components/compartido/DeleteConfirmModal";
import Select from "../../components/ui/Select";

// ─── Grupos: colecciones de listas personalizadas (anime + manga mezclados) ──

type Orden = "alfa-asc" | "alfa-desc" | "fecha-asc" | "fecha-desc" | "manual";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "manual", etiqueta: "Orden manual" },
  { valor: "alfa-asc", etiqueta: "Alfabético (A-Z)" },
  { valor: "alfa-desc", etiqueta: "Alfabético (Z-A)" },
  { valor: "fecha-desc", etiqueta: "Fecha de guardado (reciente)" },
  { valor: "fecha-asc", etiqueta: "Fecha de guardado (antiguo)" },
];

function ListaDeGrupo({
  lista, onCambio, onEliminar,
}: { lista: ListaPersonalizada; onCambio: (l: ListaPersonalizada) => void; onEliminar: () => void }) {
  const { entradas, clave } = useBiblioteca();
  const [orden, setOrden] = useState<Orden>("manual");
  const [seleccion, setSeleccion] = useState("");

  const items = useMemo(() => {
    const mapa = new Map(entradas.map(e => [clave(e.medio, e.id), e]));
    const base = lista.items.map(k => mapa.get(k)).filter(Boolean) as typeof entradas;
    const copia = [...base];
    switch (orden) {
      case "alfa-asc": return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
      case "alfa-desc": return copia.sort((a, b) => b.titulo.localeCompare(a.titulo, "es"));
      case "fecha-asc": return copia.sort((a, b) => a.agregado.localeCompare(b.agregado));
      case "fecha-desc": return copia.sort((a, b) => b.agregado.localeCompare(a.agregado));
      default: return copia;
    }
  }, [entradas, lista.items, orden, clave]);

  const guardarItems = (claves: string[]) => onCambio({ ...lista, items: claves });

  const mover = (k: string, posicion: number) => {
    const claves = items.map(e => clave(e.medio, e.id));
    const desde = claves.indexOf(k);
    const hasta = Math.min(Math.max(posicion - 1, 0), claves.length - 1);
    if (desde === -1 || desde === hasta) return;
    claves.splice(hasta, 0, claves.splice(desde, 1)[0]);
    guardarItems(claves);
  };

  const disponibles = entradas.filter(e => !lista.items.includes(clave(e.medio, e.id)));

  return (
    <div className="bg-[#16141e] border border-[#2a2140] rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={lista.nombre}
          onChange={e => onCambio({ ...lista, nombre: e.target.value })}
          aria-label="Nombre de la lista"
          className="flex-1 min-w-[160px] h-9 bg-[#0f0d16] border border-[#2a2140] rounded-xl px-3 text-sm font-semibold text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        />
        <Select
          valor={orden}
          onChange={v => setOrden(v as Orden)}
          opciones={ORDENES}
          className="w-44"
        />
        <button
          onClick={onEliminar}
          aria-label={`Eliminar lista ${lista.nombre}`}
          className="w-9 h-9 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#8b82a8] py-3">Lista vacía. Agrega títulos de tu biblioteca.</p>
      ) : (
        <ul className="space-y-1.5 mb-3">
          {items.map((e, i) => {
            const k = clave(e.medio, e.id);
            return (
              <li
                key={k}
                draggable={orden === "manual"}
                onDragStart={ev => ev.dataTransfer.setData("text/plain", k)}
                onDragOver={ev => orden === "manual" && ev.preventDefault()}
                onDrop={ev => {
                  if (orden !== "manual") return;
                  ev.preventDefault();
                  mover(ev.dataTransfer.getData("text/plain"), i + 1);
                }}
                className="flex items-center gap-2 bg-[#110f1a] border border-[#2a2140] rounded-xl px-2 py-2"
              >
                {orden === "manual" && (
                  <>
                    <GripVertical className="w-4 h-4 text-[#8b82a8] cursor-grab" aria-hidden="true" />
                    <input
                      type="number"
                      min={1}
                      max={items.length}
                      value={i + 1}
                      onChange={ev => mover(k, Number(ev.target.value))}
                      aria-label={`Posición de ${e.titulo}`}
                      className="w-12 h-8 bg-[#16141e] border border-[#2a2140] rounded-lg text-center text-xs text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
                    />
                  </>
                )}
                <img src={e.img} alt="" className="w-8 h-11 object-cover rounded bg-[#1c1928]" />
                <span className="flex-1 min-w-0 text-sm truncate">{e.titulo}</span>
                <span className="text-[11px] uppercase text-[#8b82a8]">{e.medio}</span>
                <button
                  onClick={() => guardarItems(lista.items.filter(x => x !== k))}
                  aria-label={`Quitar ${e.titulo} de ${lista.nombre}`}
                  className="w-7 h-7 rounded-md text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <Select
          valor={seleccion}
          onChange={v => setSeleccion(v)}
          opciones={[
            { valor: "", etiqueta: "Elegir de mi biblioteca…" },
            ...disponibles.map(e => ({
              valor: clave(e.medio, e.id),
              etiqueta: `[${e.medio}] ${e.titulo}`,
            })),
          ]}
          className="flex-1"
        />
        <button
          onClick={() => { if (seleccion) { guardarItems([...lista.items, seleccion]); setSeleccion(""); } }}
          className="h-9 px-3 rounded-xl text-xs font-semibold text-white flex items-center gap-1"
          style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>
    </div>
  );
}

export default function GruposPage() {
  const { grupos, crearGrupo, actualizarGrupo, eliminarGrupo } = useBiblioteca();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [filtro, setFiltro] = useState("");
  const [aEliminarGrupo, setAEliminarGrupo] = useState<Grupo | null>(null);
  const [aEliminarLista, setAEliminarLista] = useState<{ grupo: Grupo; lista: ListaPersonalizada } | null>(null);

  const visibles = grupos.filter(g => {
    const t = filtro.trim().toLowerCase();
    if (!t) return true;
    return (
      g.titulo.toLowerCase().includes(t) ||
      g.descripcion.toLowerCase().includes(t) ||
      g.etiquetas.some(e => e.toLowerCase().includes(t))
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Grupos
      </h1>

      {/* Crear grupo */}
      <form
        onSubmit={ev => {
          ev.preventDefault();
          if (!titulo.trim()) return;
          crearGrupo({
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            etiquetas: etiquetas.split(",").map(e => e.trim()).filter(Boolean),
          });
          setTitulo(""); setDescripcion(""); setEtiquetas("");
        }}
        className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4 mb-5 grid gap-3 sm:grid-cols-3"
      >
        <div className="sm:col-span-1">
          <label htmlFor="g-titulo" className="block text-xs text-[#8b82a8] mb-1">Título del grupo</label>
          <input id="g-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Clásicos de los 90"
            className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="g-desc" className="block text-xs text-[#8b82a8] mb-1">Descripción</label>
          <input id="g-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Lo que quiero revisitar"
            className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
        </div>
        <div className="sm:col-span-1 flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="g-tags" className="block text-xs text-[#8b82a8] mb-1">Etiquetas (separadas por coma)</label>
            <input id="g-tags" value={etiquetas} onChange={e => setEtiquetas(e.target.value)} placeholder="retro, shounen"
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <button type="submit" className="h-10 px-4 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}>
            <FolderPlus className="w-4 h-4" /> Crear
          </button>
        </div>
      </form>

      <div className="mb-5">
        <label htmlFor="g-filtro" className="sr-only">Buscar grupos</label>
        <input id="g-filtro" value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por título, descripción o etiqueta…"
          className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl px-4 text-sm focus:outline-none focus:border-[#946ed9]" />
      </div>

      {visibles.length === 0 ? (
        <p className="py-16 text-center text-[#8b82a8]">Todavía no tienes grupos. Crea el primero arriba.</p>
      ) : (
        <div className="space-y-5">
          {visibles.map(g => (
            <section key={g.id} className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-wide" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                    {g.titulo}
                  </h2>
                  {g.descripcion && <p className="text-sm text-[#8b82a8] mt-0.5">{g.descripcion}</p>}
                  <ul className="flex flex-wrap gap-1.5 mt-2">
                    {g.etiquetas.map(t => (
                      <li key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">
                        #{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => actualizarGrupo(g.id, {
                      listas: [...g.listas, { id: crypto.randomUUID(), nombre: "Nueva lista", items: [], orden: g.listas.length }],
                    })}
                    className="h-9 px-3 rounded-xl text-xs font-semibold border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nueva lista
                  </button>
                  <button
                    onClick={() => setAEliminarGrupo(g)}
                    aria-label={`Eliminar grupo ${g.titulo}`}
                    className="w-9 h-9 rounded-xl border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {g.listas.length === 0 ? (
                <p className="text-sm text-[#8b82a8]">Este grupo aún no tiene listas.</p>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {g.listas.map(l => (
                                        <ListaDeGrupo
                      key={l.id}
                      lista={l}
                      onEliminar={() => setAEliminarLista({ grupo: g, lista: l })}
                      onCambio={nueva => actualizarGrupo(g.id, {
                        listas: g.listas.map(x => (x.id === nueva.id ? nueva : x)),
                      })}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={aEliminarGrupo !== null}
        onClose={() => setAEliminarGrupo(null)}
        onConfirm={() => {
          if (aEliminarGrupo) {
            eliminarGrupo(aEliminarGrupo.id);
            setAEliminarGrupo(null);
          }
        }}
        title={aEliminarGrupo?.titulo ?? ""}
        itemLabel="grupo"
      />

      <DeleteConfirmModal
        isOpen={aEliminarLista !== null}
        onClose={() => setAEliminarLista(null)}
        onConfirm={() => {
          if (aEliminarLista) {
            const { grupo, lista } = aEliminarLista;
            actualizarGrupo(grupo.id, {
              listas: grupo.listas.filter(l => l.id !== lista.id),
            });
            setAEliminarLista(null);
          }
        }}
        title={aEliminarLista?.lista.nombre ?? ""}
        itemLabel="lista"
      />
    </div>
  );
}
