import AuthLayout from "../../components/autenticacion/AuthLayout";
import LoginForm from "../../components/autenticacion/LoginForm";

// ─── Página de inicio de sesión ──────────────────────────────────────────────

export default function IniciarSesionPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}