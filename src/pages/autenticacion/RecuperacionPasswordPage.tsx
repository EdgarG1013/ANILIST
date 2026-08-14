import AuthLayout from "../../components/autenticacion/AuthLayout";
import ForgotPasswordForm from "../../components/autenticacion/ForgotPasswordForm";

// ─── Página de recuperación de contraseña ────────────────────────────────────

export default function RecuperacionPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}