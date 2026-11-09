import React from 'react';
import { ShoppingBag, TrendingUp, Check, ArrowRight, HeartHandshake, Gift, Sparkles } from 'lucide-react';
import { LeadInterest } from '../types';

interface DualPathSectionProps {
  onSelectPath: (interest: LeadInterest) => void;
}

export const DualPathSection: React.FC<DualPathSectionProps> = ({ onSelectPath }) => {
  return (
    <section id="comprar-o-vender" className="py-16 md:py-24 bg-white border-y border-[#EAE5EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC] text-[#69377D] text-xs font-semibold mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-[#BF0B57]" />
            Pensado especialmente para ti
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#120F13] tracking-tight">
            ¿Cuál es tu objetivo hoy en la feria?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Diseñamos esta experiencia para atenderte con la calidez y exclusividad que mereces, sea que quieras renovar tu rutina de belleza o emprender tu propio negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Card 1: Quiero Comprar */}
          <div className="relative rounded-2xl bg-[#FAF8FB] p-7 sm:p-9 border border-[#EAE5EC] hover:border-[#BF0B57]/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#BF0B57]/10 text-[#BF0B57] flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#BF0B57]">
                  Para Consumidoras Exigentes
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#120F13] mt-1">
                  Quiero Comprar Productos
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Consigue los mejores productos de skincare, fragancias originales y maquillaje de alta fijación con la recomendación experta de Yoly.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Descuentos de feria:</strong> Promociones exclusivas y precios de catálogo vigentes.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Asesoría personalizada:</strong> Rutinas de cuidado de piel según tu biotipo y edad.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Catálogo interactivo:</strong> Recibe el enlace digital en tu WhatsApp al instante.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Muestras de fragancias:</strong> Prueba antes de comprar las notas olfativas más finas.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/50">
              <button
                onClick={() => onSelectPath('comprar')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#BF0B57] bg-white hover:bg-[#BF0B57] hover:text-white border border-[#BF0B57] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Me interesa comprar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Quiero Vender y Emprender */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#FAF8FB] to-[#F5EEF7] p-7 sm:p-9 border-2 border-[#BF0B57]/30 hover:border-[#BF0B57] transition-all shadow-md hover:shadow-lg flex flex-col justify-between group">
            {/* Ribbon badge */}
            <div className="absolute -top-3 right-6 bg-[#BF0B57] text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Oportunidad Destacada
            </div>

            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-[#69377D]/10 text-[#69377D] flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#69377D]">
                  Para Mujeres Emprendedoras
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#120F13] mt-1">
                  Quiero Vender y Ganar Dinero Extra
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Únete a nuestro equipo de consultoras. Genera ingresos independientes, gana premios increíbles y crece profesionalmente a tu propio ritmo.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/70">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Hasta 40% de ganancia:</strong> Excelentes márgenes sobre cada producto vendido.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Horarios 100% libres:</strong> Trabaja desde tu casa, con amigas o en tus tiempos libres.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Kit de inicio subsidiado:</strong> Productos top listos para vender y recuperar de inmediato.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#BF0B57] shrink-0 mt-0.5" />
                  <span><strong>Mentora personal (Yoly):</strong> Te enseño tips de venta rápida por WhatsApp y redes.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/50">
              <button
                onClick={() => onSelectPath('vender')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-[#BF0B57] hover:bg-[#a00949] transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <span>¡Quiero ser vendedora y generar ingresos!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Option 3 banner: Ambos */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[#EAE5EC]/60 border border-[#69377D]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#69377D] shrink-0 shadow-xs">
              <Gift className="w-5 h-5 text-[#BF0B57]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#120F13]">¿Te apasiona el maquillaje pero también quieres ganar dinero?</div>
              <div className="text-xs text-slate-600">Puedes comprar para tu uso personal con descuento mayorista y además vender a tus conocidas.</div>
            </div>
          </div>
          <button
            onClick={() => onSelectPath('ambos')}
            className="w-full sm:w-auto px-4.5 py-2 text-xs font-bold text-[#69377D] hover:text-[#BF0B57] bg-white border border-[#69377D]/30 rounded-lg shadow-xs hover:border-[#BF0B57] transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            Quiero Ambas Opciones (Comprar y Vender)
          </button>
        </div>
      </div>
    </section>
  );
};
