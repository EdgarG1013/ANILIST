import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/landing/HomePage";
import IniciarSesionPage from "./pages/autenticacion/IniciarSesionPage";
import RegistroPage from "./pages/autenticacion/RegistroPage";
import RecuperacionPasswordPage from "./pages/autenticacion/RecuperacionPasswordPage";

// ─── Definición centralizada de rutas ─────────────────────────────────────────
// Agrega aquí las rutas futuras del proyecto (detalle de anime/manga, etc.)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  // Páginas de autenticación — a pantalla completa, sin Navbar/Footer
  { path: "/iniciar-sesion", element: <IniciarSesionPage /> },
  { path: "/registro", element: <RegistroPage /> },
  { path: "/recuperar-password", element: <RecuperacionPasswordPage /> },
]);