import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Save, Loader2 } from "lucide-react";
import { useBiblioteca, ESTADOS_ANIME, ESTADOS_MANGA, type Estado } from "../../store/biblioteca";
import { pedirJikan } from "../../api/jikanClient";
import type { Medio } from "../../api/jikanClient";

// ─── Página reutilizable para gestionar el estado de un anime/manga ─────────

interface DetalleBasico {
  titulo: string;
  img: string;
  total: number | null;
}

const PLACEHOLDER: DetalleBasico = { titulo: "", img: "", total: null };

export default function EstadoPage() {
  const { medio, id } = useParams<{ medio: string; id: string }>();
  const navigate = useNavigate();
  const { enBiblioteca, agregar, actualizar } = useBiblioteca();

  const medioSeguro = (medio === "manga" ? "manga" : "anime") as Medio;
  const idNum = Number(id);
  const estados = medioSeguro === "anime" ? ESTADOS_ANIME : ESTADOS_MANGA;
  const entrada = enBiblioteca(medioSeguro, idNum);

  const [detalle, setDetalle] = useState<DetalleBasico>(PLACEHOLDER);
  const [cargandoApi, setCargandoApi] = useState(true);

  const [estado, setEstado] = useState<Estado>(entrada?.estado ?? estados[0].valor);
  const [progreso, setProgreso] = useState(entrada?.progreso ?? 0);
  const [puntuacion, setPuntuacion] = useState(entrada?.puntuacion ?? 0);
  const [fechaInicio, setFechaInicio] = useState(entrada?.fechaInicio ?? "");
  const [fechaFin, setFechaFin] = useState(entrada?.fechaFin ?? "");
  const [notas, setNotas] = useState(entrada?.notas ?? "");
  const [guardando, setGuardando] = useState(false);

  // Obtener datos del API para título, portada y total de episodios/capítulos
  useEffect(() => {
    if (!idNum) return;
    let vivo = true;
    setCargandoApi(true);
    const endpoint = medioSeguro === "anime"
      ? `/anime/${idNum}`
      : `/manga/${idNum}`;

    pedirJikan<{ data: Record<string, unknown> }>(endpoint)
      .then(json => {
        if (!vivo) return;
        const d = json.data;
        const img = ((d.images as Record<string, Record<string, string>>)?.jpg?.large_image_url)
          || ((d.images as Record<string, Record<string, string>>)?.jpg?.image_url)
          || "";
        setDetalle({
          titulo: (d.title as string) || "",
          img,
          total: (d.episodes as number | null) ?? (d.chapters as number | null) ?? null,
        });
      })
      .catch(() => {})
      .finally(() => vivo && setCargandoApi(false));
    return () => { vivo = false; };
  }, [idNum, medioSeguro]);

  // Sincronizar progreso total cuando cambia el detalle
  useEffect(() => {
    if (detalle.total != null && progreso === 0 && entrada?.progreso === 0) {
      // No sobreescribir si el usuario ya tiene progreso
    }
  }, [detalle.total]);

  const titulo = detalle.titulo || entrada?.titulo || `#${idNum}`;
  const total = detalle.total ?? entrada?.total ?? null;

  const handleGuardar = () => {
    setGuardando(true);
    // Simular un pequeño delay para feedback visual
    setTimeout(() => {
      if (entrada) {
        actualizar(medioSeguro, idNum, {
          estado,
          progreso,
          total,
          puntuacion,
          notas,
          fechaInicio,
          fechaFin,
        });
      } else {
        // Crear entrada nueva con los datos del API
        agregar(
          { id: idNum, title: titulo, img: detalle.img, type: medioSeguro === "anime" ? "TV" : "Manga", total, year: null, score: null, status: "", genres: [], synopsis: null },
          medioSeguro,
          estado,
        );
        // Actualizar campos adicionales
        setTimeout(() => {
          actualizar(medioSeguro, idNum, { progreso, puntuacion, notas, fechaInicio, fechaFin });
        }, 50);
      }
      setGuardando(false);
      navigate(-1);
    }, 300);
  };

  const handleVolver = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(medioSeguro === "anime" ? "/panel/listas-anime" : "/panel/listas-manga");
  };

  return (
    <div className="min-h-screen bg-[#0a0910]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleVolver}
            className="w-10 h-10 rounded-xl border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#f0eefa] hover:border-[#946ed9]/60 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {cargandoApi ? (
            <div className="space-y-2">
              <div className="h-7 w-64 rounded-lg bg-[#16141e] animate-pulse" />
            </div>
          ) : (
            <h1
              className="text-2xl font-bold text-[#f0eefa] truncate"
              style={{ fontFamily: "'Oxanium', sans-serif" }}
            >
              {titulo}
            </h1>
          )}
        </div>

        {/* Portada + formulario */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Portada */}
          <div className="shrink-0 self-center sm:self-start">
            {cargandoApi ? (
              <div className="w-[160px] rounded-2xl bg-[#16141e] animate-pulse" style={{ aspectRatio: "2/3" }} />
            ) : (
              <img
                src={detalle.img || entrada?.img}
                alt={titulo}
                className="w-[160px] rounded-2xl shadow-2xl border border-[#2a2140]"
                style={{ aspectRatio: "2/3", objectFit: "cover" }}
              />
            )}
          </div>

          {/* Formulario */}
          <div className="flex-1 space-y-6">
            {/* Estado + Progreso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="estado-select" className="block text-sm text-[#8b82a8] mb-1.5">Estado</label>
                <select
                  id="estado-select"
                  value={estado}
                  onChange={e => setEstado(e.target.value as Estado)}
                  className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
                >
                  {estados.map(s => (
                    <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="progreso-input" className="block text-sm text-[#8b82a8] mb-1.5">
                  Progreso de {medioSeguro === "anime" ? "episodios" : "capítulos"}
                </label>
                <div className="flex items-center h-11 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 focus-within:border-[#946ed9]">
                  <input
                    id="progreso-input"
                    type="number"
                    min={0}
                    max={total ?? 9999}
                    value={progreso}
                    onChange={e => setProgreso(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-transparent text-sm text-[#f0eefa] focus:outline-none tabular-nums w-16"
                  />
                  <span className="text-sm text-[#8b82a8]">/ {total ?? "?"}</span>
                </div>
              </div>
            </div>

            {/* Puntuación */}
            <div>
              <label className="block text-sm text-[#8b82a8] mb-2">Puntuación</label>
              <div className="flex gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPuntuacion(puntuacion === n ? 0 : n)}
                    aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                    className="group transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= puntuacion
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-[#2a2140] group-hover:text-[#8b82a8]"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {puntuacion > 0 && (
                <p className="text-xs text-[#8b82a8] mt-1">{puntuacion} / 10</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha-inicio" className="block text-sm text-[#8b82a8] mb-1.5">Fecha de inicio</label>
                <input
                  id="fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
                />
              </div>
              <div>
                <label htmlFor="fecha-fin" className="block text-sm text-[#8b82a8] mb-1.5">Fecha de finalización</label>
                <input
                  id="fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notas-input" className="block text-sm text-[#8b82a8] mb-1.5">Notas</label>
              <textarea
                id="notas-input"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={4}
                placeholder="Añade notas personales…"
                className="w-full bg-[#16141e] border border-[#2a2140] rounded-xl px-3 py-2.5 text-sm text-[#f0eefa] placeholder:text-[#8b82a8]/50 focus:outline-none focus:border-[#946ed9] resize-none"
              />
            </div>

            {/* Guardar */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleGuardar}
                disabled={guardando || cargandoApi}
                className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2dd4a8, #1aab85)" }}
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}