import React from 'react';
import { Sparkles, MessageCircle, Heart, Users } from 'lucide-react';

interface FooterProps {
  onOpenLeadsModal: () => void;
  onGoToAdmin: () => void;
  leadsCount: number;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLeadsModal, onGoToAdmin, leadsCount }) => {
  return (
    <footer className="bg-white border-t border-[#EAE5EC] pt-10 pb-12 text-slate-600 text-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#BF0B57] to-[#E0407D] flex items-center justify-center text-white font-extrabold text-xs">
                Y
              </span>
              <span className="text-base font-extrabold tracking-tight text-[#120F13]">
                Yoly · Belleza & Negocio
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Consultora y líder de ventas independiente para L'Bel, Ésika y Cyzone. Brindando asesoría personalizada en alta cosmética, perfumería fina y creando oportunidades para mujeres emprendedoras.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8FB] border border-[#EAE5EC] text-[11px] font-semibold text-[#69377D]">
                <Sparkles className="w-3 h-3 text-[#BF0B57]" />
                Edición Feria de Emprendimiento
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Navegación
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="hover:text-[#BF0B57] transition-colors">
                  Inicio & Flayer
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#BF0B57] transition-colors">
                  Formulario de Contacto
                </a>
              </li>
              <li>
                <button
                  onClick={onGoToAdmin}
                  className="hover:text-[#BF0B57] transition-colors cursor-pointer text-left font-semibold text-[#69377D]"
                >
                  Panel CRM (Acceso Gmail)
                </button>
              </li>
            </ul>
          </div>

          {/* Fair tool for Yoly */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Administración CRM (Gmail)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accede al CRM completo para gestionar tus leads, enviar correos con Gmail y mensajes por WhatsApp con plantillas.
            </p>

            <button
              onClick={onGoToAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#69377D] hover:bg-[#522b62] transition-all cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4 text-white" />
              <span>Abrir CRM de Contactos ({leadsCount})</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
          <p>
            © {new Date().getFullYear()} Yoly · Emprendimiento Independiente. Todos los derechos reservados.
          </p>

          <p className="text-center sm:text-right">
            L'Bel, Ésika y Cyzone son marcas registradas de Belcorp. Sitio de divulgación comercial y captación de consultoras independientes.
          </p>
        </div>
      </div>
    </footer>
  );
};
