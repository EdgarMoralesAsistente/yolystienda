import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, FileText, Check } from 'lucide-react';
import { CRMTemplate } from '../types';

interface CRMTemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CRMTemplate[];
  onSaveTemplate: (tpl: CRMTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const CRMTemplateManagerModal: React.FC<CRMTemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  if (!isOpen) return null;

  const [editingTemplate, setEditingTemplate] = useState<CRMTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CRMTemplate['categoria']>('general');
  const [tipo, setTipo] = useState<CRMTemplate['tipo']>('ambos');

  const startEdit = (tpl: CRMTemplate) => {
    setEditingTemplate(tpl);
    setIsCreating(false);
    setTitulo(tpl.titulo);
    setAsunto(tpl.asunto || '');
    setContenido(tpl.contenido);
    setCategoria(tpl.categoria);
    setTipo(tpl.tipo);
  };

  const startCreate = () => {
    setEditingTemplate(null);
    setIsCreating(true);
    setTitulo('Nueva Plantilla');
    setAsunto('Información para ti, {nombre}');
    setContenido('¡Hola {nombre}!\n\nTe escribo de parte de Yoly...');
    setCategoria('general');
    setTipo('ambos');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    const tpl: CRMTemplate = {
      id: editingTemplate ? editingTemplate.id : 'tpl_' + Date.now(),
      titulo: titulo.trim(),
      asunto: asunto.trim(),
      contenido: contenido.trim(),
      categoria,
      tipo
    };

    onSaveTemplate(tpl);
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const insertVariable = (varName: string) => {
    setContenido((prev) => prev + ` {${varName}} `);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Plantillas de Mensajes (WhatsApp & Gmail)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personaliza las respuestas automáticas para tus leads de la feria
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Templates List Sidebar */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-100 pr-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Plantillas Guardadas ({templates.length})
              </span>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF0B57] bg-[#BF0B57]/10 hover:bg-[#BF0B57]/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Nueva</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => startEdit(t)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    (editingTemplate?.id === t.id && !isCreating)
                      ? 'border-[#BF0B57] bg-[#BF0B57]/5 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {t.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="capitalize">{t.categoria}</span>
                    <span>·</span>
                    <span className="capitalize">{t.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="md:col-span-7">
            {editingTemplate || isCreating ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#69377D]">
                    {isCreating ? 'Crear Nueva Plantilla' : 'Editando Plantilla'}
                  </span>
                  {editingTemplate && templates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('¿Deseas eliminar esta plantilla?')) {
                          onDeleteTemplate(editingTemplate.id);
                          setEditingTemplate(null);
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Título de la plantilla *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
                    >
                      <option value="comprar">Comprar</option>
                      <option value="vender">Vender</option>
                      <option value="ambos">Ambos</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Canal
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
                    >
                      <option value="ambos">Ambos (WhatsApp & Email)</option>
                      <option value="whatsapp">Solo WhatsApp</option>
                      <option value="email">Solo Email</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Asunto (para correos)
                  </label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Contenido del Mensaje *
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Insertar:</span>
                      <button
                        type="button"
                        onClick={() => insertVariable('nombre')}
                        className="text-[#BF0B57] hover:underline cursor-pointer"
                      >
                        {'{nombre}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('marca')}
                        className="text-[#69377D] hover:underline cursor-pointer ml-1"
                      >
                        {'{marca}'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    className="w-full p-2.5 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setIsCreating(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cerrar editor
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Plantilla</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileText className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Selecciona una plantilla o crea una nueva para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
