import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  Clock,
  ShoppingBag,
  TrendingUp,
  Gift,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Mail,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  Percent,
  Check,
  X,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Lead, KanbanColumn, ScheduledAction } from '../types';
import { COLUMN_COLOR_OPTIONS } from '../data/kanbanData';
import { getTaskDateStatus } from '../lib/dateUtils';

interface CRMKanbanBoardProps {
  leads: Lead[];
  columns: KanbanColumn[];
  onSelectLead: (lead: Lead) => void;
  onMoveLead: (leadId: string, targetColumnId: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onEditColumn: (columnId: string, title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onQuickAddLeadInColumn?: (columnId: string) => void;
}

export const CRMKanbanBoard: React.FC<CRMKanbanBoardProps> = ({
  leads,
  columns,
  onSelectLead,
  onMoveLead,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onQuickAddLeadInColumn
}) => {
  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Column creation modal / inline state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState(COLUMN_COLOR_OPTIONS[0].hex);

  // Column editing modal state
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColColor, setEditColColor] = useState('');

  // Active dropdown menu for a column
  const [activeMenuColumnId, setActiveMenuColumnId] = useState<string | null>(null);

  // Synchronized horizontal scroll references
  const mainBoardRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Calculate approximate board content width for the top scrollbar
  // each column is ~320px + 16px gap + 320px for add column button
  const totalContentWidth = Math.max((columns.length + 1) * 336, 1200);

  // Sync scroll from main board to top scrollbar
  const handleMainBoardScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (topScrollRef.current && mainBoardRef.current) {
      topScrollRef.current.scrollLeft = mainBoardRef.current.scrollLeft;
    }
    isSyncingScroll.current = false;
  };

  // Sync scroll from top scrollbar to main board
  const handleTopScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (mainBoardRef.current && topScrollRef.current) {
      mainBoardRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    isSyncingScroll.current = false;
  };

  // Smooth scroll helper
  const scrollBoardBy = (amount: number) => {
    if (mainBoardRef.current) {
      mainBoardRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Scroll directly to a specific column
  const scrollToColumn = (columnId: string) => {
    const colElement = document.getElementById(`kanban-column-${columnId}`);
    if (colElement && mainBoardRef.current) {
      colElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (columnId: string) => {
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onMoveLead(leadId, targetColumnId);
    }
    setDraggedLeadId(null);
  };

  // Add Column Handler
  const handleSaveNewColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    onAddColumn(newColTitle.trim(), newColColor);
    setNewColTitle('');
    setIsAddingColumn(false);
  };

  // Edit Column Handler
  const handleOpenEditColumn = (col: KanbanColumn) => {
    setEditingColumn(col);
    setEditColTitle(col.title);
    setEditColColor(col.color);
    setActiveMenuColumnId(null);
  };

  const handleSaveEditColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumn || !editColTitle.trim()) return;
    onEditColumn(editingColumn.id, editColTitle.trim(), editColColor);
    setEditingColumn(null);
  };

  const handleDeleteColumnConfirm = (col: KanbanColumn) => {
    setActiveMenuColumnId(null);
    if (columns.length <= 1) {
      alert('Debes tener al menos una columna en el tablero.');
      return;
    }

    const leadCountInCol = leads.filter((l) => (l.columnaId || columns[0].id) === col.id).length;
    const msg = leadCountInCol > 0
      ? `¿Seguro que deseas eliminar la columna "${col.title}"? Los ${leadCountInCol} leads que contiene se moverán automáticamente a la primera columna.`
      : `¿Seguro que deseas eliminar la columna "${col.title}"?`;

    if (window.confirm(msg)) {
      onDeleteColumn(col.id);
    }
  };

  // Helper for probability styling
  const getProbabilityBadge = (prob?: number) => {
    const val = prob ?? 40;
    if (val >= 75) {
      return {
        text: `${val}% Alta`,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }
    if (val >= 40) {
      return {
        text: `${val}% Media`,
        color: 'text-[#69377D] bg-purple-50 border-purple-200'
      };
    }
    return {
      text: `${val}% Frío`,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    };
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* Top Horizontal Navigation & Scrollbar Bar (ALWAYS VISIBLE AT TOP) */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EAE5EC] shadow-2xs space-y-2">
        {/* Row with Quick Jump Pills and Left/Right Navigation Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 min-w-[200px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <span>Etapas:</span>
            </span>
            {columns.map((col, idx) => {
              const count = leads.filter((l) => (l.columnaId || columns[0]?.id) === col.id).length;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => scrollToColumn(col.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                  title={`Ir directamente a la columna "${col.title}"`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="truncate max-w-[120px]">{col.title}</span>
                  <span className="text-[10px] font-bold px-1 rounded-full bg-white border border-slate-200 text-slate-600">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Scroll Left / Right Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scrollBoardBy(-340)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#BF0B57] hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => scrollBoardBy(340)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#BF0B57] hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Desplazar a la derecha"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Synchronized Top Horizontal Scrollbar Track */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
            <span>Desplazamiento horizontal del tablero (Arrastra la barra o usa las flechas):</span>
            <span className="hidden md:inline">Shift + Rueda de ratón para desplazarse</span>
          </div>
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="w-full overflow-x-auto h-3.5 bg-slate-100 hover:bg-slate-200/80 rounded-full cursor-pointer transition-colors"
            style={{
              scrollbarWidth: 'auto'
            }}
          >
            {/* Dummy inner element to give the scrollbar its proportional width */}
            <div style={{ width: `${totalContentWidth}px`, height: '1px' }} />
          </div>
        </div>
      </div>

      {/* Main Kanban Board Container (Viewport-bounded so bottom scrollbar is also on screen) */}
      <div
        ref={mainBoardRef}
        onScroll={handleMainBoardScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 items-start h-[calc(100vh-270px)] min-h-[440px] max-h-[720px] scrollbar-thin"
      >
        {columns.map((column, index) => {
          // Find leads that belong to this column (default to columns[0] if unassigned)
          const columnLeads = leads.filter((lead) => {
            if (!lead.columnaId && index === 0) return true;
            return lead.columnaId === column.id;
          });

          const isDropTarget = dragOverColumnId === column.id;

          return (
            <div
              key={column.id}
              id={`kanban-column-${column.id}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => handleDragLeave(column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`w-72 sm:w-80 shrink-0 flex flex-col h-full bg-slate-100/90 rounded-3xl border transition-all duration-200 ${
                isDropTarget
                  ? 'border-[#BF0B57] bg-pink-50/50 ring-2 ring-[#BF0B57]/20 shadow-md scale-[1.01]'
                  : 'border-[#EAE5EC] shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 sm:p-3.5 border-b border-slate-200/70 flex items-center justify-between relative shrink-0 bg-white/70 rounded-t-3xl backdrop-blur-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate" title={column.title}>
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-white border border-slate-200 text-slate-600 tabular-nums shadow-2xs">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Action Menu Button */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuColumnId(activeMenuColumnId === column.id ? null : column.id)
                    }
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Opciones de columna"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuColumnId === column.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuColumnId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                        <button
                          onClick={() => handleOpenEditColumn(column)}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar Columna</span>
                        </button>

                        <button
                          onClick={() => handleDeleteColumnConfirm(column)}
                          className="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Eliminar Columna</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Column Cards List (Scrolls vertically inside this column) */}
              <div className="p-2 sm:p-2.5 flex-1 space-y-2.5 overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300/80 rounded-2xl mx-1 my-2">
                    <p className="text-xs font-semibold">Sin leads en esta etapa</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Arrastra una ficha aquí</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const probBadge = getProbabilityBadge(lead.probabilidadConversion);
                    const pendingTasks = (lead.accionesProgramadas || []).filter((t) => !t.completada);
                    const isDragging = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onSelectLead(lead)}
                        className={`group bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#BF0B57]/50 transition-all duration-150 cursor-grab active:cursor-grabbing text-left space-y-2.5 relative ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-[#BF0B57]' : ''
                        }`}
                      >
                        {/* Header: Name & Probability */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-[#BF0B57] transition-colors truncate">
                              {lead.nombre} {lead.apellido}
                            </h4>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {lead.whatsapp}
                            </div>
                          </div>

                          {/* Probability Badge */}
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${probBadge.color}`}
                            title="% de probabilidad de conversión estimado"
                          >
                            {probBadge.text}
                          </span>
                        </div>

                        {/* Badges Strip: Interest + Brand */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              lead.interes === 'comprar'
                                ? 'bg-pink-50 text-[#BF0B57] border-pink-200'
                                : lead.interes === 'vender'
                                ? 'bg-purple-50 text-[#69377D] border-purple-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {lead.interes === 'comprar' ? '🛍️ Comprar' : lead.interes === 'vender' ? '💼 Vender' : '✨ Ambos'}
                          </span>

                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[120px]">
                            {lead.marcaFavorita || 'Todas'}
                          </span>

                          {lead.valorEstimado && (
                            <span className="text-[10px] font-bold text-slate-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              ${lead.valorEstimado}
                            </span>
                          )}
                        </div>

                        {/* Scheduled Task Alert (if any) */}
                        {pendingTasks.length > 0 && (() => {
                          const taskStatus = getTaskDateStatus(pendingTasks[0].fechaProgramada);
                          return (
                            <div
                              className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-xl border ${taskStatus.badgeClass}`}
                              title={`${taskStatus.label}: ${pendingTasks[0].titulo}`}
                            >
                              <span className="shrink-0">{taskStatus.label}</span>
                              <span className="truncate">{pendingTasks[0].titulo}</span>
                            </div>
                          );
                        })()}

                        {/* Tags Strip */}
                        {lead.etiquetas && lead.etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lead.etiquetas.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-medium text-[#69377D] bg-[#FAF8FB] border border-[#EAE5EC] px-1.5 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {lead.etiquetas.length > 3 && (
                              <span className="text-[9px] font-bold text-slate-400 self-center">
                                +{lead.etiquetas.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Footer: Quick mobile/touch column switcher + Contact icon */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                          {/* Left: Quick move back/forward */}
                          <div className="flex items-center gap-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveLead(lead.id, columns[index - 1].id);
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                title={`Mover a "${columns[index - 1].title}"`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">
                              Ficha #{lead.id.slice(-4)}
                            </span>
                            {index < columns.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveLead(lead.id, columns[index + 1].id);
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                title={`Mover a "${columns[index + 1].title}"`}
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Right: Quick action */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#BF0B57] group-hover:underline">
                              Ficha Integral →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Column Action: Quick Add Lead button */}
              {onQuickAddLeadInColumn && (
                <div className="p-2 border-t border-slate-200/50 shrink-0 bg-white/40 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => onQuickAddLeadInColumn(column.id)}
                    className="w-full py-1.5 px-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#BF0B57]" />
                    <span>Añadir Lead a esta columna</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Column Block */}
        <div className="w-72 sm:w-80 shrink-0">
          {!isAddingColumn ? (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full py-4 px-4 rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#BF0B57] bg-white/60 hover:bg-white text-slate-600 hover:text-[#BF0B57] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nueva Columna</span>
            </button>
          ) : (
            <form
              onSubmit={handleSaveNewColumn}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nueva Columna
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Nombre de la Columna
                </label>
                <input
                  type="text"
                  placeholder="Ej. Esperando Pago o Pedido Listo"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Color distintivo
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLUMN_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewColColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        newColColor === c.hex
                          ? 'border-slate-800 scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-[#BF0B57] hover:bg-[#a00949] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Crear Columna
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Edit Column Modal */}
      {editingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEditColumn}
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Editar Columna Kanban
              </h3>
              <button
                type="button"
                onClick={() => setEditingColumn(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Nombre de la Columna
              </label>
              <input
                type="text"
                value={editColTitle}
                onChange={(e) => setEditColTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLUMN_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setEditColColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      editColColor === c.hex
                        ? 'border-slate-800 scale-110 shadow-xs ring-2 ring-[#BF0B57]/30'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingColumn(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#BF0B57] hover:bg-[#a00949] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
