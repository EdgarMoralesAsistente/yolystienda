import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Gift,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Save,
  Check,
  Percent,
  DollarSign,
  History,
  CheckSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Lead, LeadInterest, LeadStatus, KanbanColumn, CRMTemplate, ScheduledAction, ActivityLogEntry } from '../types';
import { sendGmailMessage } from '../lib/gmailService';
import { getAccessToken } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface CRMLeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  columns: KanbanColumn[];
  templates: CRMTemplate[];
  currentUser: User | null;
  onSaveLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

const COMMON_TAGS = [
  'Stand Feria',
  'Prioridad Alta',
  'Comprar Sérum',
  'Interesada en Kit',
  'Piel Seca/Manchas',
  'Perfumería',
  'Llamar Mañana',
  'Catálogo Enviado'
];

export const CRMLeadDetailModal: React.FC<CRMLeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  columns,
  templates,
  currentUser,
  onSaveLead,
  onDeleteLead
}) => {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState<'ficha' | 'comunicacion' | 'tareas' | 'historial'>('ficha');

  // Form State
  const [nombre, setNombre] = useState(lead.nombre);
  const [apellido, setApellido] = useState(lead.apellido);
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp);
  const [email, setEmail] = useState(lead.email);
  const [interes, setInteres] = useState<LeadInterest>(lead.interes);
  const [marcaFavorita, setMarcaFavorita] = useState(lead.marcaFavorita || 'Todas las marcas');
  const [columnaId, setColumnaId] = useState(lead.columnaId || columns[0]?.id || 'col_nuevos');
  const [probabilidad, setProbabilidad] = useState<number>(lead.probabilidadConversion ?? 40);
  const [valorEstimado, setValorEstimado] = useState<number>(lead.valorEstimado ?? 30);
  const [etiquetas, setEtiquetas] = useState<string[]>(lead.etiquetas || ['Stand Feria']);
  const [notasPrivadas, setNotasPrivadas] = useState(lead.notasPrivadas || '');
  const [newTagInput, setNewTagInput] = useState('');

  // Templates & Communication Tab State
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const match = templates.find((t) => t.categoria === lead.interes);
    return match ? match.id : templates[0]?.id || '';
  });
  const [emailSubject, setEmailSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  // Tasks Tab State
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>(lead.accionesProgramadas || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskType, setNewTaskType] = useState<ScheduledAction['tipo']>('llamada');

  // History Tab State
  const [historyLog, setHistoryLog] = useState<ActivityLogEntry[]>(lead.historialAcciones || [
    {
      id: 'log_orig',
      fecha: lead.fecha,
      tipo: 'registro',
      descripcion: `Lead registrado desde ${lead.origen || 'Feria de Emprendimiento'}`
    }
  ]);
  const [newHistoryEntry, setNewHistoryEntry] = useState('');

  // Sync state on lead change
  useEffect(() => {
    if (lead) {
      setNombre(lead.nombre);
      setApellido(lead.apellido);
      setWhatsapp(lead.whatsapp);
      setEmail(lead.email);
      setInteres(lead.interes);
      setMarcaFavorita(lead.marcaFavorita || 'Todas las marcas');
      setColumnaId(lead.columnaId || columns[0]?.id || 'col_nuevos');
      setProbabilidad(lead.probabilidadConversion ?? 40);
      setValorEstimado(lead.valorEstimado ?? 30);
      setEtiquetas(lead.etiquetas || ['Stand Feria']);
      setNotasPrivadas(lead.notasPrivadas || '');
      setScheduledActions(lead.accionesProgramadas || []);
      setHistoryLog(lead.historialAcciones || [
        {
          id: 'log_orig',
          fecha: lead.fecha,
          tipo: 'registro',
          descripcion: `Lead registrado desde ${lead.origen || 'Feria de Emprendimiento'}`
        }
      ]);
    }
  }, [lead, columns]);

  // Update Template Body
  useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl && lead) {
      const parsedSubj = (tpl.asunto || 'Información de L\'Bel, Ésika y Cyzone')
        .replace(/\{nombre\}/g, nombre)
        .replace(/\{apellido\}/g, apellido)
        .replace(/\{interes\}/g, interes)
        .replace(/\{marca\}/g, marcaFavorita);

      const parsedBody = tpl.contenido
        .replace(/\{nombre\}/g, nombre)
        .replace(/\{apellido\}/g, apellido)
        .replace(/\{interes\}/g, interes)
        .replace(/\{marca\}/g, marcaFavorita);

      setEmailSubject(parsedSubj);
      setMessageBody(parsedBody);
    }
  }, [selectedTemplateId, nombre, apellido, interes, marcaFavorita, templates, lead]);

  // Helper to add activity log entry
  const logActivity = (tipo: ActivityLogEntry['tipo'], descripcion: string) => {
    const newEntry: ActivityLogEntry = {
      id: 'log_' + Date.now(),
      fecha: new Date().toISOString(),
      tipo,
      descripcion,
      usuario: currentUser?.displayName || currentUser?.email || 'Yoly'
    };
    const updated = [newEntry, ...historyLog];
    setHistoryLog(updated);
    return updated;
  };

  // Tag Handlers
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !etiquetas.includes(trimmed)) {
      const updated = [...etiquetas, trimmed];
      setEtiquetas(updated);
      setNewTagInput('');
      logActivity('nota', `Etiqueta añadida: "${trimmed}"`);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEtiquetas(etiquetas.filter((t) => t !== tagToRemove));
  };

  // Save full lead
  const handleSaveChanges = () => {
    // Check if column changed
    let updatedHistory = historyLog;
    if (lead.columnaId !== columnaId) {
      const targetCol = columns.find((c) => c.id === columnaId)?.title || columnaId;
      updatedHistory = logActivity('cambio_columna', `Movido a columna: "${targetCol}"`);
    }

    const updatedLead: Lead = {
      ...lead,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      interes,
      marcaFavorita,
      columnaId,
      probabilidadConversion: probabilidad,
      valorEstimado,
      etiquetas,
      notasPrivadas: notasPrivadas.trim(),
      accionesProgramadas: scheduledActions,
      historialAcciones: updatedHistory
    };

    onSaveLead(updatedLead);
    onClose();
  };

  // Quick WhatsApp Send
  const handleSendWhatsApp = () => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const encoded = encodeURIComponent(messageBody);
    const url = cleanNumber ? `https://wa.me/${cleanNumber}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
    const updatedHistory = logActivity('whatsapp', `Mensaje de WhatsApp enviado con plantilla "${templates.find(t => t.id === selectedTemplateId)?.titulo || 'Personalizada'}"`);
    
    // Auto update status to contactado if in first column
    let newCol = columnaId;
    if (columnaId === 'col_nuevos' && columns.some(c => c.id === 'col_contactados')) {
      newCol = 'col_contactados';
    }

    onSaveLead({
      ...lead,
      columnaId: newCol,
      ultimoContacto: new Date().toISOString(),
      canalUltimoContacto: 'whatsapp',
      historialAcciones: updatedHistory
    });
  };

  // Send Email with Gmail API
  const handleSendEmail = async () => {
    if (!currentUser?.email) {
      setEmailAlert({ type: 'error', message: 'Debes iniciar sesión con tu cuenta de Gmail.' });
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setEmailAlert({ type: 'error', message: 'Token de Gmail no disponible. Vuelve a iniciar sesión.' });
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas enviar este correo electrónico a ${nombre} (${email}) desde tu cuenta ${currentUser.email}?`
    );
    if (!confirmed) return;

    setIsSendingEmail(true);
    setEmailAlert({ type: 'idle' });

    try {
      const res = await sendGmailMessage({
        to: email,
        from: currentUser.email,
        subject: emailSubject,
        bodyText: messageBody,
        accessToken: token
      });

      if (res.success) {
        setEmailAlert({ type: 'success', message: '¡Correo enviado con éxito desde tu Gmail!' });
        const updatedHistory = logActivity('email', `Correo enviado por Gmail con asunto: "${emailSubject}"`);

        let newCol = columnaId;
        if (columnaId === 'col_nuevos' && columns.some(c => c.id === 'col_contactados')) {
          newCol = 'col_contactados';
        }

        onSaveLead({
          ...lead,
          columnaId: newCol,
          ultimoContacto: new Date().toISOString(),
          canalUltimoContacto: 'email',
          historialAcciones: updatedHistory
        });
      } else {
        setEmailAlert({ type: 'error', message: res.error || 'Error al enviar por Gmail.' });
      }
    } catch (err: any) {
      setEmailAlert({ type: 'error', message: err.message || 'Error al enviar email.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Add Scheduled Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate) return;

    const newTask: ScheduledAction = {
      id: 'task_' + Date.now(),
      titulo: newTaskTitle.trim(),
      fechaProgramada: newTaskDate,
      tipo: newTaskType,
      completada: false
    };

    const updatedTasks = [...scheduledActions, newTask];
    setScheduledActions(updatedTasks);
    logActivity('tarea', `Acción programada: "${newTask.titulo}" para ${new Date(newTaskDate).toLocaleDateString()}`);

    setNewTaskTitle('');
    setNewTaskDate('');
  };

  const handleToggleTask = (taskId: string) => {
    const updated = scheduledActions.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completada;
        logActivity('tarea', `Tarea marcada como ${nextState ? 'COMPLETADA' : 'PENDIENTE'}: "${t.titulo}"`);
        return { ...t, completada: nextState };
      }
      return t;
    });
    setScheduledActions(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    setScheduledActions(scheduledActions.filter((t) => t.id !== taskId));
  };

  // Add Manual History Note
  const handleAddManualHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistoryEntry.trim()) return;

    logActivity('nota', newHistoryEntry.trim());
    setNewHistoryEntry('');
  };

  // Probability Color
  const getProbabilityColor = (val: number) => {
    if (val >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 40) return 'text-[#69377D] bg-purple-50 border-purple-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#BF0B57] to-[#E0407D] text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
              {nombre[0] || 'L'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {nombre} {apellido}
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    interes === 'comprar'
                      ? 'bg-pink-50 text-[#BF0B57] border-pink-200'
                      : interes === 'vender'
                      ? 'bg-purple-50 text-[#69377D] border-purple-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {interes === 'comprar' ? '🛍️ Comprar' : interes === 'vender' ? '💼 Vender' : '✨ Ambos'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {marcaFavorita}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>WhatsApp: {whatsapp}</span>
                <span>·</span>
                <span className="truncate max-w-[200px]">{email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6 bg-white overflow-x-auto gap-2 sm:gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('ficha')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ficha'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Ficha & Pipeline
          </button>
          <button
            onClick={() => setActiveTab('comunicacion')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'comunicacion'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>2. Mensajes & Plantillas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>
          <button
            onClick={() => setActiveTab('tareas')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tareas'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>3. Tareas Programadas</span>
            {scheduledActions.filter((t) => !t.completada).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#BF0B57] text-white text-[10px] font-extrabold">
                {scheduledActions.filter((t) => !t.completada).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'historial'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>4. Historial ({historyLog.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: FICHA & PIPELINE */}
          {activeTab === 'ficha' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Pipeline Column & Conversion Probability Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column Selector */}
                <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EAE5EC] space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#69377D]">
                    Estado / Columna Kanban (Trello)
                  </label>
                  <select
                    value={columnaId}
                    onChange={(e) => setColumnaId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57] shadow-2xs"
                  >
                    {columns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Al cambiar la columna, la ficha se moverá inmediatamente en tu tablero Kanban.
                  </p>
                </div>

                {/* Conversion Probability & Value */}
                <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EAE5EC] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#BF0B57]">
                      % Probabilidad de Conversión
                    </label>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${getProbabilityColor(probabilidad)}`}>
                      {probabilidad}% {probabilidad >= 75 ? '🔥 Alta' : probabilidad >= 40 ? '⚡ Media' : '❄️ Frío'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={probabilidad}
                    onChange={(e) => setProbabilidad(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#BF0B57]"
                  />

                  {/* Valor estimado */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-600">Ticket Potencial Estimado:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        value={valorEstimado}
                        onChange={(e) => setValorEstimado(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-right"
                      />
                      <span className="text-[11px] font-semibold text-slate-400">USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Contact Fields */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Datos de Contacto
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Apellido</label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Management */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Etiquetas del Contacto
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {etiquetas.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EAE5EC] text-[#69377D]"
                    >
                      <Tag className="w-3 h-3 text-[#BF0B57]" />
                      <span>{t}</span>
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Rápidas:</span>
                  {COMMON_TAGS.filter((t) => !etiquetas.includes(t)).slice(0, 5).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-[#BF0B57]/10 hover:text-[#BF0B57] transition-colors cursor-pointer"
                    >
                      + {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Escribir etiqueta personalizada..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newTagInput);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notas Privadas de Seguimiento (Solo tú las ves)
                </label>
                <textarea
                  rows={3}
                  value={notasPrivadas}
                  onChange={(e) => setNotasPrivadas(e.target.value)}
                  placeholder="Ej. Prefiere contactar por la tarde, interesada en ganar dinero para su matrícula..."
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COMUNICACIÓN & PLANTILLAS */}
          {activeTab === 'comunicacion' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Channel Tabs */}
              <div className="flex gap-3 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    channel === 'email'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar por Gmail API</span>
                </button>
              </div>

              {/* Template Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Elegir Plantilla
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#BF0B57]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject (if Email) */}
              {channel === 'email' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Asunto del Correo
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Cuerpo del Mensaje (Variables reemplazadas automáticamente)
                </label>
                <textarea
                  rows={9}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                />
              </div>

              {/* Alert status */}
              {emailAlert.type === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailAlert.message}</span>
                </div>
              )}
              {emailAlert.type === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{emailAlert.message}</span>
                </div>
              )}

              {/* Send Button */}
              <div className="pt-2 flex justify-end">
                {channel === 'whatsapp' ? (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Chat de WhatsApp con este texto</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingEmail ? 'Enviando...' : 'Enviar correo desde mi Gmail'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAREAS PROGRAMADAS */}
          {activeTab === 'tareas' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Form to Schedule a new follow-up action */}
              <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EAE5EC] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#69377D]">
                  Programar Nueva Acción de Seguimiento
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-3">
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="llamada">📞 Llamada</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="email">✉️ Correo</option>
                      <option value="entrega">📦 Entrega de Catálogo/Producto</option>
                      <option value="reunion">🤝 Reunión Presencial</option>
                      <option value="otro">📌 Otro</option>
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Título (Ej. Confirmar kit de inicio)"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="datetime-local"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full h-full py-1.5 rounded-xl bg-[#BF0B57] hover:bg-[#a00949] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                      title="Agregar tarea"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Acciones Programadas ({scheduledActions.length})
                </div>

                {scheduledActions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p className="text-xs font-semibold">No hay tareas programadas para este lead</p>
                    <p className="text-[11px]">Programa una llamada o seguimiento para asegurar la conversión.</p>
                  </div>
                ) : (
                  scheduledActions.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        task.completada
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                            task.completada
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-[#BF0B57]'
                          }`}
                        >
                          {task.completada && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className={`text-xs font-bold ${task.completada ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.titulo}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="capitalize">{task.tipo}</span>
                            <span>·</span>
                            <span>{new Date(task.fechaProgramada).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORIAL DE ACCIONES (TIMELINE) */}
          {activeTab === 'historial' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Form to log custom manual activity */}
              <form onSubmit={handleAddManualHistory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Registrar nota o llamada en el historial (Ej. Hablé por teléfono y le gustó el perfume Liasson)..."
                  value={newHistoryEntry}
                  onChange={(e) => setNewHistoryEntry(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#69377D] hover:bg-[#532b63] shadow-xs cursor-pointer"
                >
                  Registrar
                </button>
              </form>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyLog.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#BF0B57] shadow-xs" />

                    <div className="p-3 rounded-2xl bg-[#FAF8FB] border border-[#EAE5EC]">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-[#69377D] capitalize">{item.tipo}</span>
                        <span>{new Date(item.fecha).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{item.descripcion}</p>
                      {item.usuario && (
                        <div className="text-[10px] text-slate-400 mt-1">Por: {item.usuario}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`¿Seguro que deseas eliminar definitivamente a ${nombre} ${apellido}?`)) {
                onDeleteLead(lead.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Eliminar Lead</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSaveChanges}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
