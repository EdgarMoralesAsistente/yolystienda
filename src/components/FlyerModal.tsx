import React from 'react';
import { X, Download, Share2, Sparkles, CheckCircle } from 'lucide-react';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToForm: () => void;
}

export const FlyerModal: React.FC<FlyerModalProps> = ({ isOpen, onClose, onGoToForm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700/20">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BF0B57]" />
            <h3 className="text-sm font-bold text-slate-900">
              Flayer Oficial · Feria de Emprendimiento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="overflow-y-auto p-4 flex justify-center bg-slate-900/5">
          <img
            src="/assets/aistudio/Yoly_tienda_en_linea__1__c21b017d.png"
            alt="Flayer oficial Yoly's Tienda en Línea - L'Bel, Ésika, Cyzone"
            className="rounded-2xl max-h-[65vh] w-auto object-contain shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3">
          <a
            href="/assets/aistudio/Yoly_tienda_en_linea__1__c21b017d.png"
            download="Flyer_Yolys_Tienda_en_Linea.png"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar imagen oficial</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onGoToForm();
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ir al formulario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
