import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  LogOut,
  ArrowLeft,
  MessageCircle,
  Mail,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Gift,
  Phone
} from 'lucide-react';
import { Lead, LeadInterest, LeadStatus, CRMTemplate } from '../types';
import { User } from 'firebase/auth';

interface CRMAdminPanelProps {
  currentUser: User | null;
  onLogout: () => void;
  onBackToLanding: () => void;
  leads: Lead[];
  templates: CRMTemplate[];
  onOpenEditModal: (lead: Lead | null) => void;
  onOpenContactModal: (lead: Lead) => void;
  onOpenTemplateManager: () => void;
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, newStatus: LeadStatus) => void;
  onQuickAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

export const CRMAdminPanel: React.FC<CRMAdminPanelProps> = ({
  currentUser,
  onLogout,
  onBackToLanding,
  leads,
  templates,
  onOpenEditModal,
  onOpenContactModal,
  onOpenTemplateManager,
  onDeleteLead,
  onUpdateLeadStatus,
  onQuickAddTag,
  onRemoveTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInterest, setFilterInterest] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTag, setFilterTag] = useState<string>('todas');
  const [selectedTagToAdd, setSelectedTagToAdd] = useState<{ leadId: string; tag: string } | null>(null);

  // Collect all unique tags across leads
  const allUniqueTags = Array.from(
    new Set(leads.flatMap((l) => l.etiquetas || []))
  );

  // Filtering logic
  const filteredLeads = leads.filter((lead) => {
    const textQuery = `${lead.nombre} ${lead.apellido} ${lead.whatsapp} ${lead.email} ${lead.marcaFavorita || ''} ${lead.notasPrivadas || ''} ${(lead.etiquetas || []).join(' ')}`.toLowerCase();
    const matchesSearch = textQuery.includes(searchTerm.toLowerCase());
    const matchesInterest = filterInterest === 'todos' || lead.interes === filterInterest;
    const matchesStatus = filterStatus === 'todos' || (lead.estado || 'nuevo') === filterStatus;
    const matchesTag = filterTag === 'todas' || (lead.etiquetas || []).includes(filterTag);

    return matchesSearch && matchesInterest && matchesStatus && matchesTag;
  });

  // Metrics
  const totalCount = leads.length;
  const comprarCount = leads.filter((l) => l.interes === 'comprar').length;
  const venderCount = leads.filter((l) => l.interes === 'vender').length;
  const ambosCount = leads.filter((l) => l.interes === 'ambos').length;
  const nuevosCount = leads.filter((l) => (l.estado || 'nuevo') === 'nuevo').length;
  const contactadosCount = leads.filter((l) => l.estado === 'contactado' || l.estado === 'en_seguimiento').length;

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      'ID',
      'Fecha',
      'Nombre',
      'Apellido',
      'WhatsApp',
      'Email',
      'Interes',
      'Marca_Favorita',
      'Estado',
      'Etiquetas',
      'Notas_Privadas',
      'Ultimo_Contacto'
    ];

    const rows = leads.map((l) => [
      l.id,
      new Date(l.fecha).toLocaleString(),
      `"${l.nombre.replace(/"/g, '""')}"`,
      `"${l.apellido.replace(/"/g, '""')}"`,
      `"${l.whatsapp.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      l.interes,
      `"${(l.marcaFavorita || '').replace(/"/g, '""')}"`,
      l.estado || 'nuevo',
      `"${(l.etiquetas || []).join('; ').replace(/"/g, '""')}"`,
      `"${(l.notasPrivadas || '').replace(/"/g, '""')}"`,
      `"${(l.ultimoContacto || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_leads_yoly_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteWithConfirm = (lead: Lead) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el lead de ${lead.nombre} ${lead.apellido}? Esta acción no se puede deshacer.`
    );
    if (confirmed) {
      onDeleteLead(lead.id);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'nuevo':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">Nuevo</span>;
      case 'contactado':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">Contactado</span>;
      case 'en_seguimiento':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-[#69377D]">En seguimiento</span>;
      case 'cliente':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">Cliente activo</span>;
      case 'consultora':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-100 text-[#BF0B57]">Consultora</span>;
      case 'descartado':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500">Descartado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">Nuevo</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#120F13] flex flex-col font-['Montserrat',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* Top CRM App Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAE5EC] shadow-xs w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Brand & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={onBackToLanding}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Volver a la landing pública"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#BF0B57] to-[#E0407D] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
                  Y
                </span>
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-base font-extrabold text-slate-900 leading-none truncate max-w-[130px] sm:max-w-none">
                    CRM · Yoly
                  </h1>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold truncate block max-w-[130px] sm:max-w-none">
                    L'Bel · Ésika · Cyzone
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions & User Chip */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={() => onOpenEditModal(null)}
                className="inline-flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-xs transition-all cursor-pointer"
                title="Nuevo Contacto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>

              <button
                onClick={onOpenTemplateManager}
                className="inline-flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Ver y editar plantillas de WhatsApp y Gmail"
              >
                <FileText className="w-3.5 h-3.5 text-[#69377D]" />
                <span className="hidden md:inline">Plantillas</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={leads.length === 0}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                title="Exportar base de datos a archivo CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              {/* User Avatar / Profile Chip */}
              <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Yoly'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {(currentUser?.displayName || currentUser?.email || 'Y')[0].toUpperCase()}
                  </div>
                )}

                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {currentUser?.displayName || 'Administradora'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {currentUser?.email}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main CRM Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Leads
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {totalCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#BF0B57]">
              Para Comprar
            </div>
            <div className="text-2xl font-black text-[#BF0B57] mt-1 tabular-nums">
              {comprarCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#69377D]">
              Para Vender
            </div>
            <div className="text-2xl font-black text-[#69377D] mt-1 tabular-nums">
              {venderCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Ambos
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
              {ambosCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Nuevos
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
              {nuevosCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE5EC] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Contactados
            </div>
            <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
              {contactadosCount}
            </div>
          </div>
        </div>

        {/* Filter and Search Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE5EC] shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, WhatsApp, email, nota o etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
              />
            </div>

            {/* Interest Filter */}
            <div className="sm:col-span-2">
              <select
                value={filterInterest}
                onChange={(e) => setFilterInterest(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todos">Todos los Intereses</option>
                <option value="comprar">🛍️ Comprar</option>
                <option value="vender">💼 Vender</option>
                <option value="ambos">✨ Ambos</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="nuevo">🟡 Nuevo</option>
                <option value="contactado">🔵 Contactado</option>
                <option value="en_seguimiento">🟣 En seguimiento</option>
                <option value="cliente">🟢 Cliente activo</option>
                <option value="consultora">💎 Consultora activa</option>
                <option value="descartado">⚪ Descartado</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="sm:col-span-2">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todas">Todas las Etiquetas</option>
                {allUniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    🏷️ {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table & Cards Container */}
        <div className="bg-white rounded-3xl border border-[#EAE5EC] shadow-sm overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">
                No se encontraron contactos con los filtros actuales
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba borrando los términos de búsqueda o agrega un nuevo contacto manualmente con el botón superior.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Interés & Marca</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Etiquetas</th>
                    <th className="py-3 px-4">Notas & Seguimiento</th>
                    <th className="py-3 px-4 text-right">Acciones Directas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {lead.nombre} {lead.apellido}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">{lead.whatsapp}</span>
                          </div>
                          <div className="truncate max-w-[180px]">{lead.email}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Reg: {new Date(lead.fecha).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Interest & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {lead.interes === 'comprar' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF0B57] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                              <ShoppingBag className="w-3 h-3" />
                              Comprar
                            </span>
                          ) : lead.interes === 'vender' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#69377D] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              <TrendingUp className="w-3 h-3" />
                              Vender
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <Gift className="w-3 h-3" />
                              Ambos
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-1">
                          {lead.marcaFavorita || 'Todas las marcas'}
                        </div>
                        {lead.mensaje && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[150px] truncate" title={lead.mensaje}>
                            "{lead.mensaje}"
                          </div>
                        )}
                      </td>

                      {/* State Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.estado || 'nuevo'}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57] cursor-pointer shadow-2xs"
                        >
                          <option value="nuevo">🟡 Nuevo</option>
                          <option value="contactado">🔵 Contactado</option>
                          <option value="en_seguimiento">🟣 En seguimiento</option>
                          <option value="cliente">🟢 Cliente</option>
                          <option value="consultora">💎 Consultora</option>
                          <option value="descartado">⚪ Descartado</option>
                        </select>
                        {lead.ultimoContacto && (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {lead.canalUltimoContacto === 'whatsapp' ? 'WA' : 'Email'}{' '}
                              {new Date(lead.ultimoContacto).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Etiquetas / Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(lead.etiquetas || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#EAE5EC] text-[#69377D] px-2 py-0.5 rounded-md"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => onRemoveTag(lead.id, tag)}
                                className="text-slate-400 hover:text-red-500 font-bold cursor-pointer"
                                title="Eliminar etiqueta"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Quick Tag Adder */}
                        <div className="mt-1.5">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onQuickAddTag(lead.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:outline-none cursor-pointer"
                          >
                            <option value="">+ Añadir etiqueta</option>
                            <option value="Stand Feria">Stand Feria</option>
                            <option value="Prioridad Alta">Prioridad Alta</option>
                            <option value="Comprar Sérum">Comprar Sérum</option>
                            <option value="Interesada en Kit">Interesada en Kit</option>
                            <option value="Llamar Mañana">Llamar Mañana</option>
                            <option value="Catálogo Enviado">Catálogo Enviado</option>
                          </select>
                        </div>
                      </td>

                      {/* Notas Privadas */}
                      <td className="py-3.5 px-4">
                        {lead.notasPrivadas ? (
                          <div className="text-[11px] text-slate-700 bg-amber-50/60 p-2 rounded-lg border border-amber-100 max-w-[200px] leading-tight">
                            {lead.notasPrivadas}
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            className="text-[11px] text-slate-400 hover:text-[#BF0B57] underline cursor-pointer"
                          >
                            + Añadir nota
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Template Button */}
                          <button
                            onClick={() => onOpenContactModal(lead)}
                            className="p-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                            title="Contactar con plantilla de WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Gmail Template Button */}
                          <button
                            onClick={() => onOpenContactModal(lead)}
                            className="p-2 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                            title="Enviar correo con Gmail API"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Edit Modal Button */}
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar datos y notas del lead"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Lead Button */}
                          <button
                            onClick={() => handleDeleteWithConfirm(lead)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar este contacto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
