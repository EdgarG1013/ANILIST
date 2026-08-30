import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function ProtectedRoute() {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0910] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#946ed9] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8b82a8]">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <Outlet />;
}
