import React, { useState } from 'react';
import { X, Download, MessageCircle, Search, Filter, Trash2, UserCheck, ShoppingBag, TrendingUp, Gift, Phone, Mail } from 'lucide-react';
import { Lead, LeadInterest } from '../types';

interface LeadsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onDeleteLead: (id: string) => void;
  onClearAll: () => void;
}

export const LeadsManagerModal: React.FC<LeadsManagerModalProps> = ({
  isOpen,
  onClose,
  leads,
  onDeleteLead,
  onClearAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInterest, setFilterInterest] = useState<string>('todos');

  if (!isOpen) return null;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      `${lead.nombre} ${lead.apellido} ${lead.whatsapp} ${lead.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterInterest === 'todos' || lead.interes === filterInterest;

    return matchesSearch && matchesFilter;
  });

  const comprarCount = leads.filter((l) => l.interes === 'comprar').length;
  const venderCount = leads.filter((l) => l.interes === 'vender').length;
  const ambosCount = leads.filter((l) => l.interes === 'ambos').length;

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['ID', 'Fecha', 'Nombre', 'Apellido', 'WhatsApp', 'Email', 'Interes', 'Marca_Favorita', 'Mensaje'];
    const rows = leads.map((l) => [
      l.id,
      new Date(l.fecha).toLocaleString(),
      `"${l.nombre.replace(/"/g, '""')}"`,
      `"${l.apellido.replace(/"/g, '""')}"`,
      `"${l.whatsapp.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      l.interes,
      `"${(l.marcaFavorita || '').replace(/"/g, '""')}"`,
      `"${(l.mensaje || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contactos_feria_yoly_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openWhatsAppToLead = (lead: Lead) => {
    const cleanNumber = lead.whatsapp.replace(/\D/g, '');
    const greeting =
      lead.interes === 'comprar'
        ? `¡Hola ${lead.nombre}! Te saluda Yoly de la feria de emprendimiento. Te escribo con mucho gusto para compartirte el catálogo digital vigente de L'Bel, Ésika y Cyzone con promociones especiales.`
        : lead.interes === 'vender'
        ? `¡Hola ${lead.nombre}! Te saluda Yoly de la feria de emprendimiento. Vi que estás interesada en generar ingresos extra con nuestro equipo de ventas de L'Bel, Ésika y Cyzone. ¿Tienes 5 minutos para explicarte cómo empezar con el kit de inicio?`
        : `¡Hola ${lead.nombre}! Te saluda Yoly de la feria. Me alegra mucho que quieras tanto conocer los productos como evaluar la oportunidad de venta. Te comparto el catálogo y te explico cómo ganar comisiones.`;

    const url = cleanNumber
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(greeting)}`
      : `https://wa.me/?text=${encodeURIComponent(greeting)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BF0B57]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Contactos Registrados en la Feria
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra las personas que escanearon tu flayer o dejaron sus datos en el stand.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric counts strip */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-[#FAF8FB] text-center py-3 text-xs">
          <div>
            <div className="font-extrabold text-[#120F13] text-lg tabular-nums">{leads.length}</div>
            <div className="text-[11px] text-slate-500">Total Contactos</div>
          </div>
          <div>
            <div className="font-extrabold text-[#BF0B57] text-lg tabular-nums">{comprarCount}</div>
            <div className="text-[11px] text-slate-500">Para Comprar</div>
          </div>
          <div>
            <div className="font-extrabold text-[#69377D] text-lg tabular-nums">{venderCount}</div>
            <div className="text-[11px] text-slate-500">Para Vender</div>
          </div>
          <div>
            <div className="font-extrabold text-emerald-600 text-lg tabular-nums">{ambosCount}</div>
            <div className="text-[11px] text-slate-500">Ambos Intereses</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterInterest}
              onChange={(e) => setFilterInterest(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
            >
              <option value="todos">Todos los intereses</option>
              <option value="comprar">Solo Comprar</option>
              <option value="vender">Solo Vender</option>
              <option value="ambos">Solo Ambos</option>
            </select>

            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Descargar tabla en formato Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Leads List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No hay contactos con ese criterio</p>
              <p className="text-xs">
                {leads.length === 0
                  ? 'Los registros del formulario en la feria aparecerán aquí automáticamente.'
                  : 'Prueba cambiando los términos de búsqueda o filtros.'}
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {lead.nombre} {lead.apellido}
                    </span>

                    {/* Interest Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        lead.interes === 'comprar'
                          ? 'bg-pink-100 text-[#BF0B57]'
                          : lead.interes === 'vender'
                          ? 'bg-purple-100 text-[#69377D]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {lead.interes === 'comprar' ? 'Comprar' : lead.interes === 'vender' ? 'Vender' : 'Ambos'}
                    </span>

                    {lead.marcaFavorita && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {lead.marcaFavorita}
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 ml-auto sm:ml-0">
                      {new Date(lead.fecha).toLocaleDateString()} {new Date(lead.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {lead.whatsapp}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {lead.email}
                    </span>
                  </div>

                  {lead.mensaje && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                      "{lead.mensaje}"
                    </div>
                  )}
                </div>

                {/* Lead Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => openWhatsAppToLead(lead)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    title="Chatear por WhatsApp con este contacto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar este contacto"
                    aria-label="Eliminar contacto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Los datos se guardan en este dispositivo. Puedes exportarlos a Excel en cualquier momento.</span>
          {leads.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas borrar todos los contactos guardados? Asegúrate de haber exportado el archivo CSV primero.')) {
                  onClearAll();
                }
              }}
              className="text-red-500 hover:text-red-700 underline cursor-pointer"
            >
              Limpiar todos los registros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
