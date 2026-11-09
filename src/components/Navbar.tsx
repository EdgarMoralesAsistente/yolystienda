import React from 'react';
import { MessageCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  onScrollToForm: (interest?: 'comprar' | 'vender' | 'ambos') => void;
  onOpenLeadsModal: () => void;
  onGoToAdmin: () => void;
  leadsCount: number;
  isLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onScrollToForm,
  onOpenLeadsModal,
  onGoToAdmin,
  leadsCount,
  isLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE5EC] transition-all w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8 h-16 sm:h-18">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
            className="flex items-center gap-2 text-slate-900 shrink-0 group min-w-0"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#BF0B57] to-[#E0407D] flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-sm shrink-0">
              Y
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#120F13] group-hover:text-[#BF0B57] transition-colors leading-none truncate">
                Yoly
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-[#69377D] mt-0.5 truncate max-w-[125px] sm:max-w-none">
                L'Bel · Ésika · Cyzone
              </span>
            </div>
          </a>

          {/* Zone 2: clean single-line nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('hero')}
              className="hover:text-[#BF0B57] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Flayer Oficial
            </button>
            <button
              onClick={() => handleNavClick('contacto')}
              className="hover:text-[#BF0B57] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Formulario de Contacto
            </button>
          </nav>

          {/* Zone 3: 1 primary action + CRM entrance */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* CRM button: hidden on small mobile, visible in drawer and on sm+ */}
            <button
              onClick={onGoToAdmin}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#69377D] hover:text-[#BF0B57] bg-[#FAF8FB] hover:bg-[#EAE5EC]/60 border border-[#EAE5EC] rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="Acceder al CRM de administración con Gmail"
            >
              <span>{isLoggedIn ? 'Panel CRM' : 'Acceso CRM'}</span>
            </button>

            {/* Primary Action Button: compact on mobile */}
            <button
              onClick={() => onScrollToForm()}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] active:scale-[0.98] rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Dejar datos</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-slate-700 hover:text-[#BF0B57] rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE5EC] bg-white px-4 pt-3 pb-5 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick('hero')}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-[#BF0B57]"
          >
            Flayer Oficial de la Feria
          </button>
          <button
            onClick={() => handleNavClick('contacto')}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-[#BF0B57]"
          >
            Formulario de Contacto
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onGoToAdmin();
            }}
            className="block w-full text-left py-2 text-sm font-bold text-[#69377D] hover:text-[#BF0B57]"
          >
            {isLoggedIn ? 'Panel CRM (Conectada con Gmail)' : 'Iniciar Sesión en CRM con Gmail'}
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToForm();
              }}
              className="w-full py-3 text-center text-sm font-bold text-white bg-[#BF0B57] rounded-xl shadow-sm"
            >
              Dejar mis datos en la Feria
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
