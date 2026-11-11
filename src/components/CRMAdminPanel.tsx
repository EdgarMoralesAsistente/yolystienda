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
  Phone,
  LayoutGrid,
  List,
  Columns3,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, LeadInterest, LeadStatus, CRMTemplate, KanbanColumn } from '../types';
import { User } from 'firebase/auth';
import { CRMKanbanBoard } from './CRMKanbanBoard';
import { ActivityDateFilter, leadMatchesActivityFilter, getTaskDateStatus } from '../lib/dateUtils';
import { GoogleSheetsConfig } from '../lib/googleSheetsService';

interface CRMAdminPanelProps {
  currentUser: User | null;
  onLogout: () => void;
  onBackToLanding: () => void;
  leads: Lead[];
  columns: KanbanColumn[];
  templates: CRMTemplate[];
  sheetsConfig: GoogleSheetsConfig | null;
  onOpenGoogleSheetsModal: () => void;
  onOpenAccessManager: () => void;
  onOpenLeadDetail: (lead: Lead) => void;
  onOpenEditModal: (lead: Lead | null, initialColumnId?: string) => void;
  onOpenTemplateManager: () => void;
  onDeleteLead: (id: string) => void;
  onUpdateLeadStatus: (id: string, newStatus: LeadStatus) => void;
  onMoveLeadToColumn: (leadId: string, targetColumnId: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onEditColumn: (columnId: string, title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onQuickAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

export const CRMAdminPanel: React.FC<CRMAdminPanelProps> = ({
  currentUser,
  onLogout,
  onBackToLanding,
  leads,
  columns,
  templates,
  sheetsConfig,
  onOpenGoogleSheetsModal,
  onOpenAccessManager,
  onOpenLeadDetail,
  onOpenEditModal,
  onOpenTemplateManager,
  onDeleteLead,
  onUpdateLeadStatus,
  onMoveLeadToColumn,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onQuickAddTag,
  onRemoveTag
}) => {
  // View toggle: 'kanban' or 'table'
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // KPI collapse toggle: in Kanban mode, default to compact single-row so board is immediately visible
  const [showFullKpiCards, setShowFullKpiCards] = useState<boolean>(false);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInterest, setFilterInterest] = useState<string>('todos');
  const [filterColumn, setFilterColumn] = useState<string>('todas');
  const [filterTag, setFilterTag] = useState<string>('todas');
  const [filterActivityDate, setFilterActivityDate] = useState<ActivityDateFilter>('todas');

  // Unique tags
  const allUniqueTags = Array.from(
    new Set(leads.flatMap((l) => l.etiquetas || []))
  );

  // Filtering logic
  const filteredLeads = leads.filter((lead) => {
    const textQuery = `${lead.nombre} ${lead.apellido} ${lead.whatsapp} ${lead.email} ${lead.marcaFavorita || ''} ${lead.notasPrivadas || ''} ${(lead.etiquetas || []).join(' ')}`.toLowerCase();
    const matchesSearch = textQuery.includes(searchTerm.toLowerCase());
    const matchesInterest = filterInterest === 'todos' || lead.interes === filterInterest;
    
    // Column filter
    const leadCol = lead.columnaId || columns[0]?.id || 'col_nuevos';
    const matchesColumn = filterColumn === 'todas' || leadCol === filterColumn;
    
    // Tag filter
    const matchesTag = filterTag === 'todas' || (lead.etiquetas || []).includes(filterTag);

    // Activity Date Filter (Vencidas, Para hoy, Para mañana, Para esta semana)
    const matchesActivity = leadMatchesActivityFilter(lead.accionesProgramadas, filterActivityDate);

    return matchesSearch && matchesInterest && matchesColumn && matchesTag && matchesActivity;
  });

  // Metrics
  const totalCount = leads.length;
  const comprarCount = leads.filter((l) => l.interes === 'comprar').length;
  const venderCount = leads.filter((l) => l.interes === 'vender').length;
  const ambosCount = leads.filter((l) => l.interes === 'ambos').length;
  const nuevosCount = leads.filter((l) => (l.columnaId || columns[0]?.id) === columns[0]?.id).length;
  const finalizadosCount = leads.filter((l) => {
    const lastColId = columns[columns.length - 1]?.id;
    return l.columnaId === lastColId;
  }).length;

  // Counts for scheduled activities
  const vencidasCount = leads.filter((l) => leadMatchesActivityFilter(l.accionesProgramadas, 'vencidas')).length;
  const hoyCount = leads.filter((l) => leadMatchesActivityFilter(l.accionesProgramadas, 'hoy')).length;
  const mananaCount = leads.filter((l) => leadMatchesActivityFilter(l.accionesProgramadas, 'manana')).length;
  const estaSemanaCount = leads.filter((l) => leadMatchesActivityFilter(l.accionesProgramadas, 'esta_semana')).length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterInterest('todos');
    setFilterColumn('todas');
    setFilterTag('todas');
    setFilterActivityDate('todas');
  };

  const isAnyFilterActive =
    searchTerm !== '' ||
    filterInterest !== 'todos' ||
    filterColumn !== 'todas' ||
    filterTag !== 'todas' ||
    filterActivityDate !== 'todas';

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
      'Columna_Kanban',
      'Probabilidad_%',
      'Valor_Estimado_USD',
      'Etiquetas',
      'Notas_Privadas',
      'Ultimo_Contacto',
      'Proxima_Actividad'
    ];

    const rows = leads.map((l) => {
      const colTitle = columns.find((c) => c.id === (l.columnaId || columns[0]?.id))?.title || 'Inicial';
      const pendingTask = (l.accionesProgramadas || []).find((t) => !t.completada);
      const taskStr = pendingTask ? `${pendingTask.titulo} (${pendingTask.fechaProgramada})` : 'Ninguna';

      return [
        l.id,
        new Date(l.fecha).toLocaleString(),
        `"${l.nombre.replace(/"/g, '""')}"`,
        `"${l.apellido.replace(/"/g, '""')}"`,
        `"${l.whatsapp.replace(/"/g, '""')}"`,
        `"${l.email.replace(/"/g, '""')}"`,
        l.interes,
        `"${(l.marcaFavorita || '').replace(/"/g, '""')}"`,
        `"${colTitle.replace(/"/g, '""')}"`,
        l.probabilidadConversion ?? 40,
        l.valorEstimado ?? 30,
        `"${(l.etiquetas || []).join('; ').replace(/"/g, '""')}"`,
        `"${(l.notasPrivadas || '').replace(/"/g, '""')}"`,
        `"${(l.ultimoContacto || '').replace(/"/g, '""')}"`,
        `"${taskStr.replace(/"/g, '""')}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_kanban_leads_yoly_${new Date().toISOString().slice(0, 10)}.csv`);
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

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#120F13] flex flex-col font-['Montserrat',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* Top CRM App Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAE5EC] shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-15 gap-2 sm:gap-4">
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
                  <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 leading-none whitespace-nowrap">
                    CRM · Yoly
                  </h1>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold block whitespace-nowrap mt-0.5">
                    L'Bel · Ésika · Cyzone
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: View Mode Switcher (Kanban vs Table) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#BF0B57] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Tablero Kanban</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#BF0B57] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista / Tabla</span>
              </button>
            </div>

            {/* Right: Actions & User Chip */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenEditModal(null)}
                className="inline-flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-xs transition-all cursor-pointer"
                title="Nuevo Contacto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo Lead</span>
              </button>

              <button
                onClick={onOpenGoogleSheetsModal}
                className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  sheetsConfig
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title={sheetsConfig ? `Google Sheets Conectado: ${sheetsConfig.spreadsheetTitle}` : 'Conectar backend en Google Sheets'}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {sheetsConfig ? 'Google Sheets' : 'Conectar Sheets'}
                </span>
                {sheetsConfig && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden md:inline" />
                )}
              </button>

              <button
                onClick={onOpenAccessManager}
                className="inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Dar acceso a otros usuarios o colaboradoras con Google"
              >
                <Users className="w-3.5 h-3.5 text-[#BF0B57]" />
                <span className="hidden lg:inline">Dar Acceso</span>
              </button>

              <button
                onClick={onOpenTemplateManager}
                className="inline-flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Ver y editar plantillas de WhatsApp y Gmail"
              >
                <FileText className="w-3.5 h-3.5 text-[#69377D]" />
                <span className="hidden md:inline">Plantillas</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={leads.length === 0}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                title="Exportar base de datos a archivo CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              {/* User Avatar / Profile Chip */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
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
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {currentUser?.displayName || 'Administradora'}
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 flex-1 w-full space-y-3">
        {/* Mobile View Switcher */}
        <div className="flex sm:hidden items-center justify-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'kanban'
                ? 'bg-[#BF0B57] text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kanban (Trello)</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-[#BF0B57] text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista / Tabla</span>
          </button>
        </div>

        {/* Smart KPI Strip (Collapsible so the Kanban board stays at the top of the viewport) */}
        {!showFullKpiCards ? (
          /* Compact Single-Row Strip: saves ~200px of vertical space! */
          <div className="bg-white rounded-2xl px-3 sm:px-4 py-2 border border-[#EAE5EC] shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto text-xs py-0.5 scrollbar-none flex-1 min-w-[240px]">
              <span className="inline-flex items-center gap-1 font-extrabold text-slate-800 shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-[#BF0B57]" />
                <span>Resumen:</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold shrink-0 text-[11px]">
                Total: <strong>{totalCount}</strong>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-50 text-[#BF0B57] border border-pink-100 font-bold shrink-0 text-[11px]">
                Comprar: <strong>{comprarCount}</strong>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-[#69377D] border border-purple-100 font-bold shrink-0 text-[11px]">
                Vender: <strong>{venderCount}</strong>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold shrink-0 text-[11px]">
                Ambos: <strong>{ambosCount}</strong>
              </span>

              {/* Quick shortcut pills for activities */}
              <button
                type="button"
                onClick={() => setFilterActivityDate(filterActivityDate === 'hoy' ? 'todas' : 'hoy')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold shrink-0 text-[11px] transition-colors cursor-pointer ${
                  filterActivityDate === 'hoy'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>📅 Hoy: <strong>{hoyCount}</strong></span>
              </button>

              <button
                type="button"
                onClick={() => setFilterActivityDate(filterActivityDate === 'vencidas' ? 'todas' : 'vencidas')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold shrink-0 text-[11px] transition-colors cursor-pointer ${
                  filterActivityDate === 'vencidas'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                }`}
              >
                <span>⚠️ Vencidas: <strong>{vencidasCount}</strong></span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFullKpiCards(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF0B57] hover:underline cursor-pointer shrink-0"
              title="Expandir tarjetas de métricas completas"
            >
              <span>+ Ver Tarjetas</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Expanded KPI Cards Grid with Collapse Button */
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Indicadores Clave del CRM
              </span>
              <button
                type="button"
                onClick={() => setShowFullKpiCards(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#BF0B57] cursor-pointer"
              >
                <span>▴ Ocultar tarjetas (Vista Compacta)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Leads
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5 tabular-nums">
                  {totalCount}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#BF0B57]">
                  Comprar
                </div>
                <div className="text-xl font-black text-[#BF0B57] mt-0.5 tabular-nums">
                  {comprarCount}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#69377D]">
                  Vender
                </div>
                <div className="text-xl font-black text-[#69377D] mt-0.5 tabular-nums">
                  {venderCount}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Ambos
                </div>
                <div className="text-xl font-black text-emerald-700 mt-0.5 tabular-nums">
                  {ambosCount}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  {columns[0]?.title || 'Nuevos'}
                </div>
                <div className="text-xl font-black text-amber-700 mt-0.5 tabular-nums">
                  {nuevosCount}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EAE5EC] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  {columns[columns.length - 1]?.title || 'Cierres'}
                </div>
                <div className="text-xl font-black text-purple-700 mt-0.5 tabular-nums">
                  {finalizadosCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar with Activity Date Filter */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EAE5EC] shadow-2xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-center">
            {/* Search Input */}
            <div className="sm:col-span-1 lg:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, nota o etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
              />
            </div>

            {/* ACTIVIDADES DATE FILTER: Vencidas, Para hoy, Para mañana, Para esta semana */}
            <div className="sm:col-span-1 lg:col-span-3">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#BF0B57] absolute left-2.5 top-2.5 pointer-events-none" />
                <select
                  value={filterActivityDate}
                  onChange={(e) => setFilterActivityDate(e.target.value as ActivityDateFilter)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    filterActivityDate !== 'todas'
                      ? 'bg-pink-50/70 border-[#BF0B57] text-[#BF0B57] ring-1 ring-[#BF0B57]/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-[#BF0B57]'
                  }`}
                  title="Filtrar por fecha de actividades y tareas"
                >
                  <option value="todas">📅 Actividades: Todas</option>
                  <option value="vencidas">⚠️ Actividades: Vencidas ({vencidasCount})</option>
                  <option value="hoy">📅 Actividades: Para hoy ({hoyCount})</option>
                  <option value="manana">⏰ Actividades: Para mañana ({mananaCount})</option>
                  <option value="esta_semana">🗓️ Actividades: Para esta semana ({estaSemanaCount})</option>
                </select>
              </div>
            </div>

            {/* Column / Stage Filter */}
            <div className="sm:col-span-1 lg:col-span-2">
              <select
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todas">Todas las Columnas</option>
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    ● {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Interest Filter */}
            <div className="sm:col-span-1 lg:col-span-1">
              <select
                value={filterInterest}
                onChange={(e) => setFilterInterest(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todos">Interés</option>
                <option value="comprar">Comprar</option>
                <option value="vender">Vender</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="sm:col-span-1 lg:col-span-2">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="todas">Etiquetas: Todas</option>
                {allUniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    🏷️ {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Quick Badges & Reset */}
          {isAnyFilterActive && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-semibold">Filtros activos:</span>

                {filterActivityDate !== 'todas' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#BF0B57]/10 text-[#BF0B57] border border-[#BF0B57]/20">
                    <span>
                      {filterActivityDate === 'vencidas' && '⚠️ Actividades Vencidas'}
                      {filterActivityDate === 'hoy' && '📅 Actividades Para Hoy'}
                      {filterActivityDate === 'manana' && '⏰ Actividades Para Mañana'}
                      {filterActivityDate === 'esta_semana' && '🗓️ Actividades Esta Semana'}
                    </span>
                    <button
                      onClick={() => setFilterActivityDate('todas')}
                      className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                      title="Quitar filtro de actividad"
                    >
                      ×
                    </button>
                  </span>
                )}

                {filterInterest !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#69377D] border border-purple-200">
                    <span>Interés: {filterInterest}</span>
                    <button
                      onClick={() => setFilterInterest('todos')}
                      className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}

                {filterColumn !== 'todas' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span>Columna: {columns.find((c) => c.id === filterColumn)?.title || filterColumn}</span>
                    <button
                      onClick={() => setFilterColumn('todas')}
                      className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}

                {filterTag !== 'todas' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <span>#{filterTag}</span>
                    <button
                      onClick={() => setFilterTag('todas')}
                      className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <span>"{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}

                <span className="text-[11px] text-slate-400 font-semibold ml-1">
                  ({filteredLeads.length} leads coincidentes)
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#BF0B57] cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer filtros</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic View: Kanban Board vs Table */}
        {viewMode === 'kanban' ? (
          <div className="w-full">
            <CRMKanbanBoard
              leads={filteredLeads}
              columns={columns}
              onSelectLead={onOpenLeadDetail}
              onMoveLead={onMoveLeadToColumn}
              onAddColumn={onAddColumn}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              onQuickAddLeadInColumn={(colId) => onOpenEditModal(null, colId)}
            />
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white rounded-3xl border border-[#EAE5EC] shadow-sm overflow-hidden animate-in fade-in duration-150">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-slate-300" />
                <div className="text-sm font-bold text-slate-700">
                  No se encontraron contactos con los filtros actuales
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Prueba seleccionando otro rango de fechas de actividades o borrando los términos de búsqueda.
                </p>
                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Interés & Marca</th>
                      <th className="py-3 px-4">Columna / Etapa</th>
                      <th className="py-3 px-4">Próxima Actividad</th>
                      <th className="py-3 px-4">Probabilidad</th>
                      <th className="py-3 px-4">Etiquetas</th>
                      <th className="py-3 px-4">Notas</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredLeads.map((lead) => {
                      const currentColumn = columns.find((c) => c.id === (lead.columnaId || columns[0]?.id));
                      const prob = lead.probabilidadConversion ?? 40;
                      
                      // Pending scheduled task info
                      const pendingTask = (lead.accionesProgramadas || []).find((t) => !t.completada);
                      const taskStatus = pendingTask ? getTaskDateStatus(pendingTask.fechaProgramada) : null;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => onOpenLeadDetail(lead)}
                          className="hover:bg-pink-50/40 transition-colors cursor-pointer group"
                        >
                          {/* Name & Contact Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm group-hover:text-[#BF0B57] transition-colors">
                              {lead.nombre} {lead.apellido}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                              <div>{lead.whatsapp}</div>
                              <div className="truncate max-w-[180px]">{lead.email}</div>
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
                          </td>

                          {/* Column Selector */}
                          <td
                            className="py-3.5 px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={lead.columnaId || columns[0]?.id}
                              onChange={(e) => onMoveLeadToColumn(lead.id, e.target.value)}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57] cursor-pointer shadow-2xs"
                            >
                              {columns.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Scheduled Activity / Tarea Column */}
                          <td className="py-3.5 px-4">
                            {pendingTask && taskStatus ? (
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${taskStatus.badgeClass}`}
                                >
                                  {taskStatus.label}
                                </span>
                                <div className="text-[11px] font-semibold text-slate-800 max-w-[170px] truncate" title={pendingTask.titulo}>
                                  {pendingTask.titulo}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(pendingTask.fechaProgramada).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Sin tareas
                              </span>
                            )}
                          </td>

                          {/* Conversion Probability */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                                prob >= 75
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  : prob >= 40
                                  ? 'text-[#69377D] bg-purple-50 border-purple-200'
                                  : 'text-amber-700 bg-amber-50 border-amber-200'
                              }`}
                            >
                              {prob}%
                            </span>
                          </td>

                          {/* Tags */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
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
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-600 max-w-[180px] truncate">
                              {lead.notasPrivadas || <span className="text-slate-300 italic">Sin notas</span>}
                            </div>
                          </td>

                          {/* Row Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => onOpenLeadDetail(lead)}
                                className="px-2.5 py-1.5 rounded-xl text-white bg-[#BF0B57] hover:bg-[#a00949] text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                Ficha Integral
                              </button>
                              <button
                                onClick={() => handleDeleteWithConfirm(lead)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
