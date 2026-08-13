import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/home/HomePage";

// ─── Definición centralizada de rutas ─────────────────────────────────────────
// Agrega aquí las rutas futuras del proyecto (login, registro, detalle, etc.)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
]);
