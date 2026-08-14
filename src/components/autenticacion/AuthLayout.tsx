import React from "react";
import logo from "../../assets/logo.svg";

// ─── Layout compartido para las páginas de autenticación ─────────────────────
// Divide la pantalla en dos paneles:
//  - Izquierda: marca ANILIST + texto descriptivo (oculto en móvil)
//  - Derecha: contenedor del formulario
// Es responsivo: en móvil la parte de marca no se muestra.

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#0a0910] text-[#f0eefa]">
      {/* ── Panel de marca — oculto en móvil ── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-12 xl:px-20 border-r border-[#2a2140] bg-[#0d0b16]">
        <img src={logo} alt="ANILIST" className="h-10 w-auto mb-8" />
        <h1
          className="text-4xl font-extrabold mb-4"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          ANILIST
        </h1>
        <p className="text-[#8b82a8] max-w-md leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis faucibus,
          velit nec consequat tincidunt, nunc tortor vulputate enim, eget porta
          justo lacus a nisi. Vivamus id ultrices mauris. Integer egestas arcu
          quis orci pretium, at tincidunt ligula efficitur.
        </p>
      </div>

      {/* ── Panel del formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}