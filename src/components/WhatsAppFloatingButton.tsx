import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const defaultMessage = encodeURIComponent(
    "¡Hola Yoly! Estoy en la Feria de Emprendimiento y me gustaría recibir información sobre los productos y cómo vender L'Bel, Ésika y Cyzone."
  );

  return (
    <aside aria-label="Contacto rápido" className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
      <a
        href={`https://wa.me/?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
        title="Chatear con Yoly por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">
          ¿Dudas? Chatea con Yoly
        </span>
      </a>
    </aside>
  );
};
