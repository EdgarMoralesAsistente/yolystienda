import React from 'react';
import { BRANDS_DATA } from '../data/brandData';
import { Sparkles, ExternalLink, Check, BookOpen } from 'lucide-react';
import { BrandInfo } from '../types';

interface BrandsShowcaseProps {
  onSelectBrandForForm: (brandName: string) => void;
}

export const BrandsShowcase: React.FC<BrandsShowcaseProps> = ({ onSelectBrandForForm }) => {
  const [selectedBrandModal, setSelectedBrandModal] = React.useState<BrandInfo | null>(null);

  return (
    <section id="marcas" className="py-16 md:py-24 bg-[#FAF8FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#BF0B57] mb-2">
              Marcas Líderes en Belleza y Cuidado
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#120F13] tracking-tight">
              3 Marcas Prestigiosas, Un Solo Catálogo
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Al comprar o unirte a nuestro equipo de ventas, tienes acceso a todo el portafolio de Belcorp. No tienes que elegir una sola: ofreces las tres marcas a tus clientes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#69377D] bg-white px-3.5 py-2 rounded-xl border border-[#EAE5EC] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#BF0B57]" />
            <span>Catálogos digitales actualizados cada campaña</span>
          </div>
        </div>

        {/* 3 Brand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BRANDS_DATA.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EAE5EC] hover:border-slate-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                {/* Brand header */}
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-2xl font-black tracking-tight"
                    style={{ color: brand.accentColor }}
                  >
                    {brand.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Belcorp
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 mb-2">
                  {brand.tagline}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {brand.description}
                </p>

                {/* Categories */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Líneas Destacadas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.heroCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs text-slate-700 bg-[#FAF8FB] border border-[#EAE5EC] px-2.5 py-1 rounded-lg"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Products preview */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Favoritos de las Clientas
                  </div>
                  {brand.featuredProducts.slice(0, 3).map((prod, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 text-xs py-1">
                      <div>
                        <span className="font-semibold text-slate-800">{prod.name}</span>
                        <p className="text-[11px] text-slate-500">{prod.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedBrandModal(brand)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver detalles</span>
                </button>
                <button
                  onClick={() => onSelectBrandForForm(brand.name)}
                  className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                  style={{ backgroundColor: brand.accentColor }}
                >
                  <span>Pedir catálogo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Details Modal */}
      {selectedBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBrandModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="mb-4">
              <span
                className="text-2xl font-black"
                style={{ color: selectedBrandModal.accentColor }}
              >
                {selectedBrandModal.name}
              </span>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {selectedBrandModal.tagline}
              </p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-6">
              {selectedBrandModal.description}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Productos Estrella en esta Campaña:
            </h4>
            <div className="space-y-3 mb-6">
              {selectedBrandModal.featuredProducts.map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF8FB] border border-[#EAE5EC]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="text-[11px] font-semibold text-[#BF0B57] bg-white px-2 py-0.5 rounded border border-[#EAE5EC]">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{p.highlight}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#EAE5EC]/50 border border-[#69377D]/15 text-xs text-slate-700 mb-6">
              <strong>Nota de Feria:</strong> Al dejar tus datos en el formulario, te enviaremos el catálogo digital oficial de {selectedBrandModal.name} directamente por WhatsApp para que puedas hojearlo con precios especiales.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const bName = selectedBrandModal.name;
                  setSelectedBrandModal(null);
                  onSelectBrandForForm(bName);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#BF0B57] hover:bg-[#a00949] transition-all cursor-pointer shadow-sm text-center"
              >
                Solicitar catálogo de {selectedBrandModal.name}
              </button>
              <button
                onClick={() => setSelectedBrandModal(null)}
                className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
