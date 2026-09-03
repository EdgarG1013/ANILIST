import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BookOpen, ClipboardList, Trash2 } from "lucide-react";
import type { MangaDetalle } from "../../api/catalogoService";
import { useBiblioteca } from "../../store/biblioteca";
import { useAuth } from "../../store/auth";
import DeleteConfirmModal from "../compartido/DeleteConfirmModal";
import AuthModal from "../compartido/AuthModal";

interface Props {
  manga: MangaDetalle;
  onVolver: () => void;
}

export default function MangaHeroBanner({ manga, onVolver }: Props) {
  const navigate = useNavigate();
  const { enBiblioteca, agregar, quitar } = useBiblioteca();
  const { autenticado } = useAuth();
  const guardado = enBiblioteca("manga", manga.id);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [authModalAbierto, setAuthModalAbierto] = useState(false);

  return (
    <div className="relative" style={{ height: "480px" }}>
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={manga.img}
          alt={manga.titulo}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(10,9,16,0.94) 0%, rgba(10,9,16,0.6) 55%, rgba(10,9,16,0.2) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, #0a0910 0%, rgba(10,9,16,0) 40%)" }}
        />
      </div>

      {/* Botón volver */}
      <div className="absolute top-6 left-0 right-0 z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <button
            onClick={onVolver}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm text-white transition-colors hover:bg-white/10 cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </div>
      </div>

      {/* Contenido del hero */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-12 flex gap-8 items-end">
          {/* Portada */}
          <div className="hidden md:block shrink-0">
            <img
              src={manga.img}
              alt={manga.titulo}
              className="w-[180px] rounded-2xl shadow-2xl border border-[#2a2140]"
              style={{ aspectRatio: "2/3", objectFit: "cover" }}
            />
          </div>

          {/* Información */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {manga.rank > 0 && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
                >
                  #{manga.rank} Ranking
                </span>
              )}
              {manga.tipo && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
                >
                  {manga.tipo}
                </span>
              )}
              <span
                className="text-xs px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
              >
                {manga.estado}
              </span>
            </div>

            <h1
              className="text-white mb-1 font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              {manga.titulo}
            </h1>
            {manga.tituloIngles && <p className="text-white/60 mb-4">{manga.tituloIngles}</p>}

            {/* Fila de datos */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-white/80 text-sm">
              {manga.score != null && (
                <>
                  <div className="flex items-center gap-1.5 text-yellow-400">
                    <Star size={15} fill="currentColor" />
                    <span className="text-white">{manga.score}</span>
                    <span className="text-white/50 text-xs">/10</span>
                  </div>
                  <span className="text-white/30">|</span>
                </>
              )}
              {manga.autores[0] && <span>{manga.autores[0]}</span>}
              <span className="text-white/30">|</span>
              <span>{manga.year}</span>
              <span className="text-white/30">|</span>
              <span>{manga.capitulos} capítulos</span>
              {manga.volumenes > 0 && (
                <>
                  <span className="text-white/30">|</span>
                  <span>{manga.volumenes} volúmenes</span>
                </>
              )}
            </div>

            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-5">
              {manga.generos.map(g => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full text-white border"
                  style={{ borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Acciones de lista */}
            <div className="flex items-center gap-3 flex-wrap">
              {guardado ? (
                <>
                  <button
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-[#1c1928] text-[#8b82a8] border border-[#2a2140]"
                  >
                    <Trash2 size={16} />
                    En mi lista
                  </button>
                  <button
                    onClick={() => navigate(`/panel/estado/manga/${manga.id}`)}
                    className="flex items-center gap-2 px-4 h-10 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
                  >
                    <ClipboardList size={16} />
                    Estado
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (!autenticado) { setAuthModalAbierto(true); return; }
                    agregar(
                      {
                        id: manga.id,
                        title: manga.titulo,
                        img: manga.img,
                        type: manga.tipo,
                        total: manga.capitulos,
                        year: manga.year,
                        score: manga.score,
                        status: manga.estado,
                        genres: manga.generos,
                        synopsis: manga.sinopsis,
                      },
                      "manga",
                    );
                  }}
                  className="flex items-center gap-2 px-5 h-10 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
                >
                  <BookOpen size={16} />
                  Añadir a mi lista
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={() => { quitar("manga", manga.id); setModalAbierto(false); }}
        title={manga.titulo}
        itemLabel="manga de mi lista"
      />
      <AuthModal isOpen={authModalAbierto} onClose={() => setAuthModalAbierto(false)} />
    </div>
  );
}