import AuthLayout from "../../components/autenticacion/AuthLayout";
import RegisterForm from "../../components/autenticacion/RegisterForm";

// ─── Página de registro ──────────────────────────────────────────────────────

export default function RegistroPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}