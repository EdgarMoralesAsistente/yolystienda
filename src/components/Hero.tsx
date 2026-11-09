import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, MessageCircle, QrCode, Maximize2 } from 'lucide-react';

interface HeroProps {
  onScrollToForm: (interest?: 'comprar' | 'vender' | 'ambos') => void;
  onOpenFlyerModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToForm, onOpenFlyerModal }) => {
  return (
    <section id="hero" className="relative pt-5 pb-4 md:pt-8 md:pb-6 overflow-hidden w-full max-w-full">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#E0407D]/10 rounded-full blur-3xl pointer-events-none -z-10 max-w-full" />
      <div className="absolute top-1/3 left-4 sm:left-10 w-60 sm:w-80 h-60 sm:h-80 bg-[#69377D]/8 rounded-full blur-3xl pointer-events-none -z-10 max-w-full" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
        {/* Editorial fair banner tag */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-[#69377D] mb-3 sm:mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC]/80 border border-[#69377D]/20 text-[#69377D] text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#BF0B57] shrink-0" />
            <span>Edición Especial · Feria de Emprendimiento</span>
          </span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline text-slate-500 font-medium text-xs">Asesoría personalizada con Yoly</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Persuasive Value Proposition */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#120F13] leading-[1.18]" style={{ textWrap: 'balance' }}>
              Belleza que te hace brillar...{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BF0B57] via-[#E0407D] to-[#69377D]">
                ¡y una gran oportunidad para ti!
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Bienvenida. Ya sea que busques tus productos de belleza favoritos de{' '}
              <strong className="text-slate-900 font-bold">L'Bel, Ésika y Cyzone</strong> con descuentos especiales de feria, o quieras{' '}
              <strong className="text-[#BF0B57] font-bold">emprender tu propio negocio</strong> para ganar dinero extra con total libertad de tiempo.
            </p>

            {/* Core benefit checkmarks from the flyer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 py-1 sm:py-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#BF0B57] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Compra tus productos favoritos
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#BF0B57] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Genera ingresos extra a tu ritmo
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#BF0B57] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Trabaja desde tu celular o casa
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#BF0B57] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Respaldo de 3 marcas líderes
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={() => onScrollToForm()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
              >
                <span>¡Dejar mis datos en la Feria!</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <a
                href="https://wa.me/?text=Hola%20Yoly,%20estoy%20en%20la%20feria%20de%20emprendimiento%20y%20quiero%20conocer%20m%C3%A1s%20sobre%20los%20productos%20y%20la%20oportunidad%20de%20venta%20de%20L'Bel,%20%C3%89sika%20y%20Cyzone."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-[#EAE5EC] rounded-xl shadow-sm transition-all hover:border-[#BF0B57]/40 cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>

            {/* Micro guarantee notice */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500 pt-1">
              <span>Sin compromisos</span>
              <span aria-hidden="true">·</span>
              <span>Atención directa de Yoly</span>
              <span aria-hidden="true">·</span>
              <span>Ofertas de feria</span>
            </div>
          </div>

          {/* Right Column: Visual Anchor with authentic flyer */}
          <div className="lg:col-span-5 flex justify-center w-full max-w-full overflow-hidden p-1">
            <div className="relative group max-w-xs sm:max-w-sm md:max-w-md w-full">
              {/* Outer decorative gradient border (safely contained) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#BF0B57] via-[#E0407D] to-[#69377D] rounded-3xl opacity-25 group-hover:opacity-50 blur-sm transition duration-500" />

              <div className="relative bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/80">
                <div className="relative overflow-hidden rounded-xl bg-slate-100 aspect-[3/4.6]">
                  <img
                    src="/assets/aistudio/flyer_yoly_con_nuevo_qr.jpeg"
                    alt="Flyer Oficial de Yoly con nuevo código QR - L'Bel, Ésika, Cyzone"
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Quick Action Overlay button to see flyer modal */}
                  <button
                    onClick={onOpenFlyerModal}
                    className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] sm:text-xs font-semibold backdrop-blur-sm transition-all shadow-md cursor-pointer"
                    title="Ver flyer completo en grande"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Ver flyer</span>
                  </button>
                </div>

                <div className="mt-2.5 px-1 sm:px-2 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-semibold text-[#69377D] text-[11px] sm:text-xs truncate">
                    <QrCode className="w-3.5 h-3.5 text-[#BF0B57] shrink-0" />
                    <span className="truncate">Flayer con QR</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-600 shrink-0">Tu belleza = tu negocio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

