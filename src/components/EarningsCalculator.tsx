import React from 'react';
import { Calculator, ArrowRight, Gift, Trophy, DollarSign, Sparkles } from 'lucide-react';

interface EarningsCalculatorProps {
  onStartSelling: (clientsCount: number) => void;
}

export const EarningsCalculator: React.FC<EarningsCalculatorProps> = ({ onStartSelling }) => {
  const [clients, setClients] = React.useState<number>(12);
  const averageTicket = 28; // Promedio de compra en dólares o moneda equivalente por clienta

  // Cálculo de ganancia
  // Con pocas clientas ~25%, con más de 10 clientas ~30%, con más de 20 clientas ~35-40%
  const commissionRate = clients < 8 ? 0.25 : clients < 18 ? 0.30 : 0.38;
  const totalSales = clients * averageTicket;
  const estimatedProfit = Math.round(totalSales * commissionRate);

  // Regalos adicionales estimados
  const estimatedGiftValue = clients < 8 ? 25 : clients < 18 ? 55 : 95;

  return (
    <section id="simulador" className="py-16 md:py-24 bg-white border-b border-[#EAE5EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC] text-[#69377D] text-xs font-semibold mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#BF0B57]" />
            Herramienta Interactiva
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#120F13] tracking-tight">
            ¿Cuánto puedes ganar vendiendo?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Calcula tus ganancias estimadas por campaña compartiendo el catálogo digital interactivo con tus amigas, familiares y compañeras de trabajo.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#FAF8FB] rounded-3xl p-6 sm:p-10 border border-[#EAE5EC] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Control */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="clients-slider" className="text-sm font-bold text-slate-900">
                    Número estimado de clientas por campaña:
                  </label>
                  <span className="text-2xl font-black text-[#BF0B57] tabular-nums">
                    {clients} <span className="text-xs font-semibold text-slate-500">personas</span>
                  </span>
                </div>
                <input
                  id="clients-slider"
                  type="range"
                  min="3"
                  max="35"
                  value={clients}
                  onChange={(e) => setClients(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#BF0B57]"
                />
                <div className="flex justify-between text-[11px] text-slate-600 mt-1.5 font-medium">
                  <span>3 clientas (Círculo cercano)</span>
                  <span>15 clientas (Medio tiempo)</span>
                  <span>35+ clientas (Líder)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pb-2 border-b border-slate-200/60">
                  <span>Ventas estimadas de catálogo:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ${totalSales} USD aprox.
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pb-2 border-b border-slate-200/60">
                  <span>Porcentaje de ganancia alcanzado:</span>
                  <span className="font-bold text-[#69377D] tabular-nums">
                    {Math.round(commissionRate * 100)}% de margen
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pb-2 border-b border-slate-200/60">
                  <span>Valor estimado en premios y productos gratis:</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    +${estimatedGiftValue} USD en regalos
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed italic">
                * Estimación de referencia basada en compras promedio de 1 a 2 productos (fragancia, maquillaje o sérum) por clienta en cada campaña de 21 días.
              </div>
            </div>

            {/* Results Box */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#EAE5EC] shadow-md text-center space-y-4">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#69377D] bg-[#EAE5EC] px-3 py-1 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-[#BF0B57]" />
                Ganancia Estimada por Campaña
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black text-[#BF0B57] tracking-tight tabular-nums">
                  ${estimatedProfit}
                  <span className="text-lg font-semibold text-slate-500 ml-1">USD</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  En efectivo en tu bolsillo + premios
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 text-left flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Ganancia total estimada:</strong> ${(estimatedProfit + estimatedGiftValue)} USD combinando efectivo y productos gratis que puedes revender.
                </span>
              </div>

              <button
                onClick={() => onStartSelling(clients)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>¡Quiero generar este ingreso!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
