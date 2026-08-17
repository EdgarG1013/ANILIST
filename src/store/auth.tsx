import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ─── Estado global de autenticación (simulado) ──────────────────────────────
// Mientras no exista backend, guarda la sesión en localStorage. El resto de la
// app (navbar, panel) lee `usuario` para saber si hay alguien conectado.

export interface Usuario {
  nombre: string;
  correo: string;
  avatar: string;
}

interface AuthCtx {
  usuario: Usuario | null;
  autenticado: boolean;
  iniciarSesion: (u: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuario: (p: Partial<Usuario>) => void;
}

const LLAVE = "anilist:auth:v1";

const Ctx = createContext<AuthCtx | null>(null);

function leer(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LLAVE);
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leer);

  useEffect(() => {
    if (usuario) localStorage.setItem(LLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(LLAVE);
  }, [usuario]);

  const valor: AuthCtx = {
    usuario,
    autenticado: usuario != null,
    iniciarSesion: u => setUsuario(u),
    cerrarSesion: () => setUsuario(null),
    actualizarUsuario: p => setUsuario(prev => (prev ? { ...prev, ...p } : prev)),
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}