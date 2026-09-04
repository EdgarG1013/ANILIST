import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import ilustracion404 from "../../assets/ani-error-404.png";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0a0910] text-[#f0eefa] flex items-center justify-center px-5 py-14 sm:py-20 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 20%, rgba(148,110,217,0.18), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-14 text-center md:text-left">
        {/* Personaje + bocadillo */}
        <div className="order-1 md:order-2 flex flex-col items-center justify-center">
          <div className="relative mb-2 max-w-xs sm:max-w-sm">
            <div
              className="relative z-10 rounded-2xl border-2 border-[#2a2140] bg-[#171327] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              style={{ background: "linear-gradient(180deg, #1e1a30, #171327)" }}
            >
              <p className="text-[#f0eefa] text-sm sm:text-base leading-relaxed font-medium">
                ¡¡HAAA!! ¡¡Mis registros!! ¡¡Todo está desorganizado y no encuentro esa página por{" "}
                <span className="text-[#946ed9] font-bold">NINGUNA</span> parte!! ¿Se borró? ¿O la
                escribiste mal? ¡ahh que voy hacer...!
              </p>
              <span
                className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                style={{
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "14px solid #171327",
                }}
              />
              <span
                className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                style={{
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderTop: "16px solid #2a2140",
                }}
              />
            </div>
          </div>

          <img
            src={ilustracion404}
            alt="Bibliotecaria anime desesperada porque la página no existe"
            className="w-40 xs:w-48 sm:w-56 md:w-64 lg:w-72 h-auto object-contain drop-shadow-[0_16px_32px_rgba(148,110,217,0.22)]"
            loading="eager"
          />
        </div>

        {/* Texto */}
        <div className="order-2 md:order-1">
          <p className="text-[#946ed9] text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            Error 404
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
            ¡ERROR 404! NUESTRA{" "}
            <span className="text-[#946ed9]">BIBLIOTECARIA</span> SE HA ROTO.
          </h1>
          <p className="text-[#a89fc4] text-sm sm:text-base mb-8">
            Parece que la página que buscas no existe o está tan bien escondida que la encargada de
            la base de datos se ha confundido fatalmente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
            >
              <Home size={16} /> Volver al inicio
            </Link>
          </div>

          <p className="text-[#6f6890] text-xs italic">
            Nota mental: No dejar que los usuarios escriban URLs sin supervisión.
          </p>
        </div>
      </div>
    </main>
  );
}