import { useRef, useState } from "react";
import { Upload, Download, User, KeyRound, FileJson, FileText } from "lucide-react";
import { useBiblioteca, type Entrada, type Grupo } from "../../store/biblioteca";

// ─── Configuración de cuenta, importación y exportación ──────────────────────

export default function ConfiguracionPage() {
  const { perfil, setPerfil, entradas, grupos, reemplazarTodo } = useBiblioteca();
  const [nombre, setNombre] = useState(perfil.nombre);
  const [correo, setCorreo] = useState(perfil.correo);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const archivoRef = useRef<HTMLInputElement>(null);

  function descargar(contenido: string, nombreArchivo: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  const exportarJson = () =>
    descargar(JSON.stringify({ entradas, grupos }, null, 2), "anilist-biblioteca.json", "application/json");

  const exportarTxt = () => {
    const lineas = [
      "ANILIST — Biblioteca personal",
      "",
      ...entradas.map(e => `[${e.medio}] ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"} — agregado ${new Date(e.agregado).toLocaleDateString("es")}`),
      "",
      "Grupos:",
      ...grupos.map(g => `- ${g.titulo} (${g.etiquetas.join(", ")}): ${g.listas.map(l => `${l.nombre} [${l.items.length}]`).join(" | ")}`),
    ];
    descargar(lineas.join("\n"), "anilist-biblioteca.txt", "text/plain");
  };

  async function importar(file: File) {
    const texto = await file.text();
    try {
      if (file.name.endsWith(".json")) {
        const datos = JSON.parse(texto) as { entradas?: Entrada[]; grupos?: Grupo[] };
        reemplazarTodo({ entradas: datos.entradas, grupos: datos.grupos });
        setMensaje(`Se importaron ${datos.entradas?.length ?? 0} títulos desde JSON.`);
      } else {
        // TXT: una entrada por línea con formato "[medio] Título — estado"
        const nuevas: Entrada[] = texto.split("\n").flatMap((linea, i) => {
          const m = linea.match(/^\[(anime|manga)\]\s*(.+?)\s*—\s*([\w-]+)/i);
          if (!m) return [];
          return [{
            id: Date.now() + i,
            medio: m[1].toLowerCase() as Entrada["medio"],
            titulo: m[2].trim(),
            img: "",
            tipo: m[1].toLowerCase() === "anime" ? "TV" : "Manga",
            estado: m[3] as Entrada["estado"],
            progreso: 0,
            total: null,
            favorito: false,
            agregado: new Date().toISOString(),
            orden: i,
            etiquetas: [],
          }];
        });
        reemplazarTodo({ entradas: nuevas });
        setMensaje(`Se importaron ${nuevas.length} títulos desde TXT.`);
      }
    } catch {
      setMensaje("No pudimos leer el archivo. Verifica el formato.");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Configuración
      </h1>

      {/* Perfil */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <User className="w-4 h-4 text-[#946ed9]" /> Perfil
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="w-16 h-16 rounded-full overflow-hidden bg-[#1c1928] border border-[#2a2140] flex items-center justify-center">
            {perfil.avatar
              ? <img src={perfil.avatar} alt="Foto de perfil actual" className="w-full h-full object-cover" />
              : <User className="w-6 h-6 text-[#8b82a8]" />}
          </span>
          <div>
            <label htmlFor="avatar" className="block text-xs text-[#8b82a8] mb-1">Foto de perfil</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const lector = new FileReader();
                lector.onload = () => setPerfil({ avatar: String(lector.result) });
                lector.readAsDataURL(f);
              }}
              className="text-sm text-[#8b82a8] file:mr-3 file:h-9 file:px-3 file:rounded-xl file:border-0 file:bg-[#946ed9] file:text-white file:text-sm"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="nombre" className="block text-xs text-[#8b82a8] mb-1">Nombre de usuario</label>
            <input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <div>
            <label htmlFor="correo" className="block text-xs text-[#8b82a8] mb-1">Correo</label>
            <input id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
        </div>
        <button
          onClick={() => { setPerfil({ nombre, correo }); setMensaje("Perfil actualizado."); }}
          className="mt-4 h-10 px-4 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
        >
          Guardar cambios
        </button>
      </section>

      {/* Contraseña */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <KeyRound className="w-4 h-4 text-[#946ed9]" /> Cambiar contraseña
        </h2>
        <form
          onSubmit={e => { e.preventDefault(); setMensaje("Contraseña actualizada."); (e.target as HTMLFormElement).reset(); }}
          className="grid sm:grid-cols-3 gap-3"
        >
          <div>
            <label htmlFor="pass-actual" className="block text-xs text-[#8b82a8] mb-1">Actual</label>
            <input id="pass-actual" type="password" required
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <div>
            <label htmlFor="pass-nueva" className="block text-xs text-[#8b82a8] mb-1">Nueva</label>
            <input id="pass-nueva" type="password" required minLength={8}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <div>
            <label htmlFor="pass-conf" className="block text-xs text-[#8b82a8] mb-1">Confirmar</label>
            <input id="pass-conf" type="password" required minLength={8}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <button type="submit" className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60">
            Actualizar contraseña
          </button>
        </form>
      </section>

      {/* Importar / exportar */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <FileJson className="w-4 h-4 text-[#946ed9]" /> Importar y exportar listas
        </h2>
        <p className="text-sm text-[#8b82a8] mb-4">
          Descarga una copia de tu biblioteca y tus grupos, o restaura desde un archivo JSON o TXT.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportarJson} className="h-10 px-4 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}>
            <Download className="w-4 h-4" /> Exportar JSON
          </button>
          <button onClick={exportarTxt} className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Exportar TXT
          </button>
          <button onClick={() => archivoRef.current?.click()} className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importar archivo
          </button>
          <input
            ref={archivoRef}
            type="file"
            accept=".json,.txt"
            className="sr-only"
            aria-label="Importar biblioteca desde archivo"
            onChange={e => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }}
          />
        </div>
      </section>

      <p aria-live="polite" className="mt-4 text-sm text-[#b08ee8] min-h-5">{mensaje}</p>
    </div>
  );
}
