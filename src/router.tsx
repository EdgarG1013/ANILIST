import { createBrowserRouter } from "react-router-dom";
import App from "./App";
// ─── Paginas del home ───────────────────────────────────────────────
import HomePage from "./pages/landing/HomePage";
import AnimeDetalladoHomePage from "./pages/landing/AnimeDetalladoHomePage";
import MangaDetalladoHomePage from "./pages/landing/MangaDetalladoHomePage";
// ─── Paginas de autenticación ───────────────────────────────────────
import IniciarSesionPage from "./pages/autenticacion/IniciarSesionPage";
import RegistroPage from "./pages/autenticacion/RegistroPage";
import RecuperacionPasswordPage from "./pages/autenticacion/RecuperacionPasswordPage";
// ─── Paginas del panel de usuario ─────────────────────────────────
import AnimeDetalladoPage from "./pages/anime/AnimeDetalladoPage";
import MangaDetalladoPage from "./pages/manga/MangaDetalladoPage";
import PanelLayout from "./components/panel/PanelLayout";
import InicioPage from "./pages/panel/InicioPage";
import CatalogoAnimePage from "./pages/panel/CatalogoAnimePage";
import CatalogoMangaPage from "./pages/panel/CatalogoMangaPage";
import ListasAnimePage from "./pages/panel/ListasAnimePage";
import ListasMangaPage from "./pages/panel/ListasMangaPage";
import GruposPage from "./pages/panel/GruposPage";
import ConfiguracionPage from "./pages/panel/ConfiguracionPage";

// ─── Definición centralizada de rutas ─────────────────────────────────────────
// Agrega aquí las rutas futuras del proyecto (detalle de anime/manga, etc.)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "anime/:id", element: <AnimeDetalladoHomePage /> },
      { path: "manga/:id", element: <MangaDetalladoHomePage /> },
    ],
  },
  // Páginas de autenticación — a pantalla completa, sin Navbar/Footer
  { path: "/iniciar-sesion", element: <IniciarSesionPage /> },
  { path: "/registro", element: <RegistroPage /> },
  { path: "/recuperar-password", element: <RecuperacionPasswordPage /> },

  // paginas del panel de usuario
  {
    path: "/panel",
    element: <PanelLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: "catalogo-anime", element: <CatalogoAnimePage /> },
      { path: "catalogo-manga", element: <CatalogoMangaPage /> },
      { path: "listas-anime", element: <ListasAnimePage /> },
      { path: "listas-manga", element: <ListasMangaPage /> },
      { path: "grupos", element: <GruposPage /> },
      { path: "configuracion", element: <ConfiguracionPage /> },
      { path: "anime/:id", element: <AnimeDetalladoPage /> },
      { path: "manga/:id", element: <MangaDetalladoPage /> },
    ],
  },

]);