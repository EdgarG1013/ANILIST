import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, CalendarClock, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { buscarCatalogo, type CatalogoItem } from "../../api/jikanClient";
import { useBiblioteca } from "../../store/biblioteca";
import { TipoBadge, PuntuacionBadge } from "../../components/landing/badges";

// ─── Inicio del panel: noticias, próximos estrenos y recomendados ────────────

const NOTICIAS = [
  { titulo: "La temporada de verano suma 12 estrenos confirmados", fecha: "hace 2 h", fuente: "ANILIST Noticias" },
  { titulo: "Nuevo arco del manga más leído del mes llega a su clímax", fecha: "hace 6 h", fuente: "Editorial" },
  { titulo: "Anuncian adaptación animada de una novela ligera premiada", fecha: "ayer", fuente: "Industria" },
];

function Fila({
  titulo, Icono, items, cargando,
}: { titulo: string; Icono: typeof Sparkles; items: CatalogoItem[]; cargando: boolean }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide mb-4" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        <Icono className="w-5 h-5 text-[#946ed9]" /> {titulo}
      </h2>
      {cargando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-[#16141e] animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.slice(0, 5).map(item => (
            <li key={item.id} className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden hover:border-[#946ed9]/40 transition-colors">
              <div className="relative aspect-[2/3] bg-[#1c1928]">
                {item.img && <img src={item.img} alt={`Portada de ${item.title}`} loading="lazy" className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2"><TipoBadge tipo={item.type} /></div>
                {item.score != null && <div className="absolute top-2 left-2"><PuntuacionBadge score={item.score} /></div>}
              </div>
              <div className="p-3">
                <h3 className="text-[13px] font-semibold line-clamp-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>{item.title}</h3>
                <p className="text-xs text-[#8b82a8] mt-1">{item.year ?? "—"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function InicioPage() {
  const { perfil, entradas } = useBiblioteca();
  const [proximos, setProximos] = useState<CatalogoItem[]>([]);
  const [animes, setAnimes] = useState<CatalogoItem[]>([]);
  const [mangas, setMangas] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([
      buscarCatalogo({ medio: "anime", estado: "upcoming", orden: "popularity:asc" }),
      buscarCatalogo({ medio: "anime", orden: "score:desc" }),
      buscarCatalogo({ medio: "manga", orden: "score:desc" }),
    ]).then(([p, a, m]) => {
      if (!vivo) return;
      if (p.status === "fulfilled") setProximos(p.value.items);
      if (a.status === "fulfilled") setAnimes(a.value.items);
      if (m.status === "fulfilled") setMangas(m.value.items);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, []);

  const stats = [
    { etiqueta: "Animes guardados", valor: entradas.filter(e => e.medio === "anime").length, a: "/panel/listas-anime" },
    { etiqueta: "Mangas guardados", valor: entradas.filter(e => e.medio === "manga").length, a: "/panel/listas-manga" },
    { etiqueta: "Favoritos", valor: entradas.filter(e => e.favorito).length, a: "/panel/listas-anime" },
    { etiqueta: "En progreso", valor: entradas.filter(e => e.estado === "viendo" || e.estado === "leyendo").length, a: "/panel/listas-anime" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-1" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Hola, {perfil.nombre}
      </h1>
      <p className="text-sm text-[#8b82a8] mb-6">Este es el resumen de tu biblioteca y lo que viene en la industria.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map(s => (
          <Link key={s.etiqueta} to={s.a} className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4 hover:border-[#946ed9]/40 transition-colors">
            <p className="text-2xl font-semibold" style={{ fontFamily: "'Oxanium', sans-serif" }}>{s.valor}</p>
            <p className="text-xs text-[#8b82a8] mt-1">{s.etiqueta}</p>
          </Link>
        ))}
      </div>

      {/* Noticias */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide mb-4" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <Newspaper className="w-5 h-5 text-[#946ed9]" /> Noticias
        </h2>
        <ul className="bg-[#110f1a] border border-[#2a2140] rounded-2xl divide-y divide-[#2a2140]">
          {NOTICIAS.map(n => (
            <li key={n.titulo} className="p-4 flex items-center justify-between gap-3 hover:bg-[#16141e] transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{n.titulo}</p>
                <p className="text-xs text-[#8b82a8] mt-0.5">{n.fuente} · {n.fecha}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8b82a8] shrink-0" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      <Fila titulo="Próximos estrenos" Icono={CalendarClock} items={proximos} cargando={cargando} />
      <Fila titulo="Anime recomendado" Icono={Sparkles} items={animes} cargando={cargando} />
      <Fila titulo="Manga recomendado" Icono={BookOpen} items={mangas} cargando={cargando} />
    </div>
  );
}
