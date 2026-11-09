import React, { useState } from 'react';
import { TESTIMONIALS_DATA, FAQ_DATA, FAIR_BENEFITS } from '../data/brandData';
import { ChevronDown, MessageSquareQuote, HelpCircle, Sparkles, Smartphone, GraduationCap, ShieldCheck } from 'lucide-react';

export const TestimonialsAndFaq: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const getBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#BF0B57]" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-[#BF0B57]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#69377D]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#BF0B57]" />;
    }
  };

  return (
    <section id="testimonios" className="py-16 md:py-24 bg-white border-t border-[#EAE5EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fair Benefits Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#120F13]">
              ¿Por qué registrarte hoy con Yoly en la Feria?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Beneficios especiales para quienes se conectan directamente durante este evento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FAIR_BENEFITS.map((b, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#FAF8FB] border border-[#EAE5EC] space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-100">
                  {getBenefitIcon(b.icon)}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC] text-[#69377D] text-xs font-semibold mb-3">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#BF0B57]" />
              Historias de Éxito
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#120F13] tracking-tight">
              Ellas Ya Comenzaron Su Transformación
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Experiencias reales de clientas y consultoras que forman parte de nuestra comunidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8FB] p-6 rounded-2xl border border-[#EAE5EC] flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-[#BF0B57] bg-white px-2.5 py-1 rounded-md border border-[#EAE5EC] inline-block">
                    {t.gain}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/60 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#EAE5EC]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div id="preguntas" className="max-w-3xl mx-auto pt-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC] text-[#69377D] text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[#BF0B57]" />
              Resolvemos tus Dudas
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#120F13] tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Todo lo que necesitas saber antes de comprar o iniciar tus ventas.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#EAE5EC] bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-[#BF0B57] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#BF0B57]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
