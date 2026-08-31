import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as authService from '../api/authService';
import type { UsuarioAuth } from '../api/authService';

interface AuthCtx {
  usuario: UsuarioAuth | null;
  autenticado: boolean;
  cargando: boolean;

  login: (correo: string, password: string) => Promise<void>;
  register: (nombre: string, correo: string, password: string) => Promise<authService.AuthResponse>;
  logout: () => Promise<void>;
  cargarPerfil: () => Promise<void>;
  actualizarUsuario: (p: Partial<UsuarioAuth>) => void;

  // Aliases para compatibilidad con componentes existentes
  iniciarSesion: (u: UsuarioAuth) => void;
  cerrarSesion: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() =>
    authService.obtenerUsuarioLocal(),
  );
  const [cargando, setCargando] = useState(true);

  // Cargar perfil al montar si hay token
  const cargarPerfil = useCallback(async () => {
    try {
      const res = await authService.obtenerPerfil();
      const u: UsuarioAuth = {
        id: res.data.id,
        nombre: res.data.nombre,
        correo: res.data.correo,
        avatar: res.data.avatar,
        preferencias: res.data.preferencias ?? null,
      };
      setUsuario(u);
      localStorage.setItem('usuario', JSON.stringify(u));
    } catch {
      // Token inválido o expirado
      setUsuario(null);
      authService.limpiarSesion();
    }
  }, []);

  useEffect(() => {
    const token = authService.obtenerToken();
    if (token) {
      cargarPerfil().finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [cargarPerfil]);

  const login = async (correo: string, password: string) => {
    const res = await authService.iniciarSesion(correo, password);
    setUsuario(res.data.usuario);
  };

  const register = async (nombre: string, correo: string, password: string) => {
    const res = await authService.registrar(nombre, correo, password);
    setUsuario(res.data.usuario);
    return res;
  };

  const logout = async () => {
    try {
      await authService.cerrarSesion();
    } finally {
      setUsuario(null);
      authService.limpiarSesion();
    }
  };

  const actualizarUsuario = (p: Partial<UsuarioAuth>) => {
    setUsuario(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...p };
      localStorage.setItem('usuario', JSON.stringify(updated));
      return updated;
    });
  };

  // Aliases para compatibilidad
  const iniciarSesionDirecto = (u: UsuarioAuth) => setUsuario(u);
  const cerrarSesionDirecto = () => {
    setUsuario(null);
    authService.limpiarSesion();
  };

  const valor: AuthCtx = {
    usuario,
    autenticado: usuario != null,
    cargando,
    login,
    register,
    logout,
    cargarPerfil,
    actualizarUsuario,
    iniciarSesion: iniciarSesionDirecto,
    cerrarSesion: cerrarSesionDirecto,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
