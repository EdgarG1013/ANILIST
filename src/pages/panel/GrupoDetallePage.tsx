import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, GripVertical, X, Search, Loader2, Library, Globe, ImageIcon, Pencil, Check,
} from "lucide-react";
import { useBiblioteca, type ListaPersonalizada } from "../../store/biblioteca";
import { buscarCatalogo, type CatalogoItem, type Medio } from "../../api/catalogoService";
import DeleteConfirmModal from "../../components/compartido/DeleteConfirmModal";
import Select from "../../components/ui/Select";

// ─── Detalle de un grupo: sus listas personalizadas, ordenables ──────────────

type Orden = "manual" | "alfa-asc" | "alfa-desc" | "fecha-asc" | "fecha-desc";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "manual", etiqueta: "Orden manual" },
  { valor: "alfa-asc", etiqueta: "Alfabético (A-Z)" },
  { valor: "alfa-desc", etiqueta: "Alfabético (Z-A)" },
  { valor: "fecha-desc", etiqueta: "Fecha de guardado (reciente)" },
  { valor: "fecha-asc", etiqueta: "Fecha de guardado (antiguo)" },
];

export default function GrupoDetallePage() {
  const { id } = useParams();
  const { grupos, entradas, clave, actualizarGrupo, subirPortadaGrupo, crearListaGrupo, eliminarListaGrupo, actualizarListaGrupo, agregarItemGrupo, eliminarItemGrupo, reordenarItemsGrupo } = useBiblioteca();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const grupo = grupos.find(g => g.id === id);

  const [listaActiva, setListaActiva] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("manual");
  const [editando, setEditando] = useState(false);
  const [fuente, setFuente] = useState<"biblioteca" | "externo">("biblioteca");
  const [busqueda, setBusqueda] = useState("");
  const [medioBusqueda, setMedioBusqueda] = useState<Medio>("anime");
  const [resultados, setResultados] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [aEliminarLista, setAEliminarLista] = useState<ListaPersonalizada | null>(null);

  const listas = grupo?.listas ?? [];
  const activa = listas.find(l => l.id === listaActiva) ?? listas[0] ?? null;

  useEffect(() => {
    if (!listaActiva && listas.length) setListaActiva(listas[0].id);
  }, [listaActiva, listas]);

  // Búsqueda en el catálogo externo (Jikan) con debounce
  useEffect(() => {
    if (fuente !== "externo" || busqueda.trim().length < 3) { setResultados([]); return; }
    const t = setTimeout(async () => {
      setCargando(true);
      try {
        const r = await buscarCatalogo({ medio: medioBusqueda, q: busqueda.trim(), pagina: 1 });
        setResultados(r.items.slice(0, 12));
      } catch { setResultados([]); }
      setCargando(false);
    }, 500);
    return () => clearTimeout(t);
  }, [busqueda, medioBusqueda, fuente]);

  const mapaEntradas = useMemo(
    () => new Map(entradas.map(e => [clave(e.medio, e.id), e])),
    [entradas, clave],
  );

  const items = useMemo(() => {
    if (!activa) return [];
    const base = activa.items.map(it => {
      const entrada = mapaEntradas.get(it.clave);
      return {
        ...it,
        id: Number(it.tenraiId),
        agregado: entrada?.agregado ?? "",
        esExterno: it.esExterno,
      };
    });
    switch (orden) {
      case "alfa-asc": return [...base].sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
      case "alfa-desc": return [...base].sort((a, b) => b.titulo.localeCompare(a.titulo, "es"));
      case "fecha-asc": return [...base].sort((a, b) => a.agregado.localeCompare(b.agregado));
      case "fecha-desc": return [...base].sort((a, b) => b.agregado.localeCompare(a.agregado));
      default: return base;
    }
  }, [activa, mapaEntradas, orden]);

  if (!grupo) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#8b82a8] mb-4">Este grupo ya no existe.</p>
        <Link to="/panel/grupos" className="text-[#b08ee8] text-sm font-semibold">Volver a Grupos</Link>
      </div>
    );
  }

  const mover = (k: string, posicion: number) => {
    if (!activa) return;
    const claves = items.map(i => i.clave);
    const desde = claves.indexOf(k);
    const hasta = Math.min(Math.max(posicion - 1, 0), claves.length - 1);
    if (desde === -1 || desde === hasta) return;
    claves.splice(hasta, 0, claves.splice(desde, 1)[0]);
    const nuevosItems = claves.map(c => {
      const partes = c.split(':');
      return { medio: partes[0] as Medio, tenraiId: partes[1] };
    });
    reordenarItemsGrupo(activa.id, nuevosItems);
  };

  const agregarItem = (medio: Medio, tenraiId: string, datosCatalogo?: Record<string, unknown>) => {
    if (!activa) return;
    const k = `${medio}:${tenraiId}`;
    if (activa.items.some(i => i.clave === k)) return;
    agregarItemGrupo(activa.id, medio, tenraiId, datosCatalogo);
  };

  const nuevaLista = async () => {
    const nuevaId = await crearListaGrupo(grupo.id, `Lista ${grupo.listas.length + 1}`);
    if (nuevaId) setListaActiva(nuevaId);
  };

  const clavesActivas = useMemo(() => new Set(activa?.items.map(i => i.clave) ?? []), [activa]);

  const disponibles = entradas
    .filter(e => !clavesActivas.has(clave(e.medio, e.id)))
    .filter(e => !busqueda.trim() || e.titulo.toLowerCase().includes(busqueda.trim().toLowerCase()));

  const campo = "w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]";

  return (
    <div>
      <Link to="/panel/grupos" className="inline-flex items-center gap-2 text-sm text-[#8b82a8] hover:text-[#f0eefa] mb-4">
        <ArrowLeft className="w-4 h-4" /> Grupos
      </Link>

      {/* Cabecera del grupo */}
      <header className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden mb-5">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 shrink-0 aspect-[16/9] sm:aspect-auto sm:min-h-[150px] bg-[#16141e] flex items-center justify-center">
            {grupo.portadaUrl
              ? <img src={grupo.portadaUrl} alt="" className="w-full h-full object-cover" />
              : <ImageIcon className="w-8 h-8 text-[#2a2140]" aria-hidden="true" />}
          </div>
          <div className="flex-1 min-w-0 p-4">
            {editando ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={grupo.titulo} onChange={e => actualizarGrupo(grupo.id, { titulo: e.target.value })} aria-label="Título del grupo" className={campo} />
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={async e => {
                  const archivo = e.target.files?.[0];
                  if (archivo && grupo) {
                    await subirPortadaGrupo(grupo.id, archivo);
                  }
                }} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={campo + " text-left cursor-pointer"}
                >
                  {grupo.portadaUrl ? "Cambiar portada…" : "Subir portada…"}
                </button>
                <input value={grupo.descripcion} onChange={e => actualizarGrupo(grupo.id, { descripcion: e.target.value })} placeholder="Descripción" aria-label="Descripción del grupo" className={campo} />
                <input
                  value={grupo.etiquetas.join(", ")}
                  onChange={e => actualizarGrupo(grupo.id, { etiquetas: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  placeholder="Etiquetas (coma)" aria-label="Etiquetas del grupo" className={campo}
                />
              </div>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-wider pr-10" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                  {grupo.titulo}
                </h1>
                {grupo.descripcion && <p className="text-sm text-[#8b82a8] mt-1">{grupo.descripcion}</p>}
                <ul className="flex flex-wrap gap-1.5 mt-3">
                  {grupo.etiquetas.map(t => (
                    <li key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">#{t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="p-4 sm:pl-0">
            <button
              onClick={() => setEditando(v => !v)}
              className="h-9 px-3 rounded-xl text-xs font-semibold border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {editando ? <><Check className="w-3.5 h-3.5" /> Listo</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
            </button>
          </div>
        </div>
      </header>

      {/* Pestañas de listas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {listas.map(l => (
          <button
            key={l.id}
            onClick={() => setListaActiva(l.id)}
            aria-current={activa?.id === l.id}
            className={`h-10 px-4 rounded-xl text-sm font-semibold border transition-colors ${
              activa?.id === l.id ? "bg-[#946ed9] border-[#946ed9] text-white" : "bg-[#16141e] border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
            }`}
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            {l.nombre} <span className="opacity-70">({l.items.length})</span>
          </button>
        ))}
        <button
          onClick={nuevaLista}
          className="h-10 px-4 rounded-xl text-sm font-semibold border border-dashed border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nueva lista
        </button>
      </div>

      {!activa ? (
        <p className="py-16 text-center text-[#8b82a8]">Este grupo aún no tiene listas. Crea la primera arriba.</p>
      ) : (
        <>
          {/* Controles de la lista activa */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <input
              value={activa.nombre}
              onChange={e => actualizarListaGrupo(activa.id, { nombre: e.target.value })}
              aria-label="Nombre de la lista"
              className="flex-1 h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-[#946ed9]"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            />
            <Select valor={orden} onChange={v => setOrden(v as Orden)} opciones={ORDENES} className="sm:w-56" />
            <button
              onClick={() => setAEliminarLista(activa)}
              aria-label={`Eliminar lista ${activa.nombre}`}
              className="h-10 px-3 rounded-xl border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Eliminar lista</span>
            </button>
          </div>

          {/* Filas */}
          {items.length === 0 ? (
            <p className="py-12 text-center text-[#8b82a8]">Lista vacía. Agrega títulos abajo.</p>
          ) : (
            <ul className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden divide-y divide-[#2a2140] mb-5">
              {items.map((it, i) => (
                <li
                  key={it.clave}
                  draggable={orden === "manual"}
                  onDragStart={ev => ev.dataTransfer.setData("text/plain", it.clave)}
                  onDragOver={ev => orden === "manual" && ev.preventDefault()}
                  onDrop={ev => {
                    if (orden !== "manual") return;
                    ev.preventDefault();
                    mover(ev.dataTransfer.getData("text/plain"), i + 1);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#16141e] transition-colors"
                >
                  {orden === "manual" && (
                    <>
                      <GripVertical className="hidden sm:block w-4 h-4 text-[#8b82a8] shrink-0 cursor-grab" aria-hidden="true" />
                      <input
                        type="number" min={1} max={items.length} value={i + 1}
                        onChange={ev => mover(it.clave, Number(ev.target.value))}
                        aria-label={`Posición de ${it.titulo}`}
                        className="w-12 h-9 bg-[#16141e] border border-[#2a2140] rounded-lg text-center text-sm text-[#f0eefa] shrink-0 focus:outline-none focus:border-[#946ed9]"
                      />
                    </>
                  )}
                  <img src={it.img} alt="" className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg bg-[#1c1928] shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/panel/${it.medio}/${it.id}`}
                      className="text-sm font-semibold block truncate hover:text-[#b08ee8]"
                      style={{ fontFamily: "'Oxanium', sans-serif" }}
                    >
                      {it.titulo}
                    </Link>
                    <p className="text-xs text-[#8b82a8] truncate">
                      <span className="uppercase">{it.medio}</span>
                      {it.tipo ? ` · ${it.tipo}` : ""}
                      {it.esExterno ? " · fuera de mis listas" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarItemGrupo(activa.id, it.medio, it.tenraiId)}
                    aria-label={`Quitar ${it.titulo} de ${activa.nombre}`}
                    className="w-9 h-9 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Agregar títulos */}
          <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4">
            <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Oxanium', sans-serif" }}>
              Agregar títulos a "{activa.nombre}"
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {([["biblioteca", "Mi biblioteca", Library], ["externo", "Buscar en el catálogo", Globe]] as const).map(([v, label, Icono]) => (
                <button
                  key={v}
                  onClick={() => { setFuente(v); setBusqueda(""); }}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                    fuente === v ? "bg-[#946ed9] border-[#946ed9] text-white" : "bg-[#16141e] border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
                  }`}
                >
                  <Icono className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8b82a8] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <label htmlFor="buscar-item" className="sr-only">Buscar títulos</label>
                <input
                  id="buscar-item" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  placeholder={fuente === "biblioteca" ? "Filtrar mi biblioteca…" : "Buscar anime o manga (mín. 3 letras)…"}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl pl-9 pr-3 text-sm focus:outline-none focus:border-[#946ed9]"
                />
              </div>
              {fuente === "externo" && (
                <Select
                  valor={medioBusqueda}
                  onChange={v => setMedioBusqueda((v || "anime") as Medio)}
                  opciones={[{ valor: "anime", etiqueta: "Anime" }, { valor: "manga", etiqueta: "Manga" }]}
                  className="sm:w-36"
                />
              )}
            </div>

            {fuente === "biblioteca" ? (
              disponibles.length === 0 ? (
                <p className="text-sm text-[#8b82a8]">No hay títulos disponibles en tu biblioteca.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 max-h-80 overflow-y-auto">
                  {disponibles.map(e => {
                    const k = clave(e.medio, e.id);
                    return (
                      <li key={k}>
                        <button
                          onClick={() => agregarItem(e.medio, String(e.id))}
                          className="w-full flex items-center gap-2 bg-[#16141e] border border-[#2a2140] rounded-xl p-2 text-left hover:border-[#946ed9]/60"
                        >
                          <img src={e.img} alt="" className="w-8 h-11 object-cover rounded bg-[#1c1928]" loading="lazy" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm truncate">{e.titulo}</span>
                            <span className="block text-[11px] uppercase text-[#8b82a8]">{e.medio}</span>
                          </span>
                          <Plus className="w-4 h-4 text-[#946ed9] shrink-0" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : cargando ? (
              <p className="flex items-center gap-2 text-sm text-[#8b82a8]"><Loader2 className="w-4 h-4 animate-spin" /> Buscando…</p>
            ) : resultados.length === 0 ? (
              <p className="text-sm text-[#8b82a8]">Escribe al menos 3 letras para buscar títulos que no están en tus listas.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 max-h-80 overflow-y-auto">
                {resultados.map(r => {
                  const k = `${medioBusqueda}:${r.id}`;
                  const ya = clavesActivas.has(k);
                  return (
                    <li key={k}>
                      <button
                        disabled={ya}
                        onClick={() => agregarItem(medioBusqueda, String(r.id), r as unknown as Record<string, unknown>)}
                        className="w-full flex items-center gap-2 bg-[#16141e] border border-[#2a2140] rounded-xl p-2 text-left hover:border-[#946ed9]/60 disabled:opacity-40"
                      >
                        <img src={r.img} alt="" className="w-8 h-11 object-cover rounded bg-[#1c1928]" loading="lazy" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm truncate">{r.title}</span>
                          <span className="block text-[11px] uppercase text-[#8b82a8]">{medioBusqueda} · {r.type}</span>
                        </span>
                        {ya ? <Check className="w-4 h-4 text-[#8b82a8] shrink-0" /> : <Plus className="w-4 h-4 text-[#946ed9] shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <DeleteConfirmModal
        isOpen={aEliminarLista !== null}
        onClose={() => setAEliminarLista(null)}
        onConfirm={() => {
          if (aEliminarLista) {
            eliminarListaGrupo(aEliminarLista.id);
            setListaActiva(null);
            setAEliminarLista(null);
          }
        }}
        title={aEliminarLista?.nombre ?? ""}
        itemLabel="lista"
      />
    </div>
  );
}
