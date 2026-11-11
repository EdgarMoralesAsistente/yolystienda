import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Plus, Trash2, User, Phone, Mail } from 'lucide-react';
import { Lead, LeadInterest, LeadStatus } from '../types';

interface CRMLeadEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit: Lead | null;
  initialColumnId?: string;
  onSaveLead: (lead: Lead) => void;
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

export const CRMLeadEditModal: React.FC<CRMLeadEditModalProps> = ({
  isOpen,
  onClose,
  leadToEdit,
  initialColumnId,
  onSaveLead
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(leadToEdit);

  const [nombre, setNombre] = useState(leadToEdit?.nombre || '');
  const [apellido, setApellido] = useState(leadToEdit?.apellido || '');
  const [whatsapp, setWhatsapp] = useState(leadToEdit?.whatsapp || '');
  const [email, setEmail] = useState(leadToEdit?.email || '');
  const [interes, setInteres] = useState<LeadInterest>(leadToEdit?.interes || 'comprar');
  const [marcaFavorita, setMarcaFavorita] = useState(leadToEdit?.marcaFavorita || 'Todas las marcas');
  const [estado, setEstado] = useState<LeadStatus>(leadToEdit?.estado || 'nuevo');
  const [etiquetas, setEtiquetas] = useState<string[]>(leadToEdit?.etiquetas || ['Stand Feria']);
  const [notasPrivadas, setNotasPrivadas] = useState(leadToEdit?.notasPrivadas || '');
  const [mensaje, setMensaje] = useState(leadToEdit?.mensaje || '');
  const [newTagInput, setNewTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setNombre(leadToEdit.nombre);
      setApellido(leadToEdit.apellido);
      setWhatsapp(leadToEdit.whatsapp);
      setEmail(leadToEdit.email);
      setInteres(leadToEdit.interes);
      setMarcaFavorita(leadToEdit.marcaFavorita || 'Todas las marcas');
      setEstado(leadToEdit.estado || 'nuevo');
      setEtiquetas(leadToEdit.etiquetas || ['Stand Feria']);
      setNotasPrivadas(leadToEdit.notasPrivadas || '');
      setMensaje(leadToEdit.mensaje || '');
    } else {
      setNombre('');
      setApellido('');
      setWhatsapp('');
      setEmail('');
      setInteres('comprar');
      setMarcaFavorita('Todas las marcas');
      setEstado('nuevo');
      setEtiquetas(['Stand Feria']);
      setNotasPrivadas('');
      setMensaje('');
    }
  }, [leadToEdit]);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !etiquetas.includes(trimmed)) {
      setEtiquetas([...etiquetas, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEtiquetas(etiquetas.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !whatsapp.trim() || !email.trim()) {
      setError('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    const updatedLead: Lead = {
      id: leadToEdit ? leadToEdit.id : 'lead_' + Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      interes,
      marcaFavorita,
      estado,
      columnaId: leadToEdit ? leadToEdit.columnaId : (initialColumnId || 'col_nuevos'),
      probabilidadConversion: leadToEdit?.probabilidadConversion ?? (interes === 'ambos' ? 65 : 45),
      valorEstimado: leadToEdit?.valorEstimado ?? 35,
      etiquetas,
      notasPrivadas: notasPrivadas.trim(),
      mensaje: mensaje.trim(),
      fecha: leadToEdit ? leadToEdit.fecha : new Date().toISOString(),
      origen: leadToEdit ? leadToEdit.origen : 'Registro Manual CRM',
      historialAcciones: leadToEdit?.historialAcciones || [
        {
          id: 'log_' + Date.now(),
          fecha: new Date().toISOString(),
          tipo: 'registro',
          descripcion: 'Lead registrado en el CRM'
        }
      ]
    };

    onSaveLead(updatedLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? `Editar Contacto: ${leadToEdit?.nombre} ${leadToEdit?.apellido}` : 'Registrar Nuevo Contacto'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Actualiza los datos, estado o notas de seguimiento' : 'Agrega un lead recibido en papel o directamente'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">{error}</div>}

          {/* Name & Surname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                required
              />
            </div>
          </div>

          {/* WhatsApp & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                WhatsApp *
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                required
              />
            </div>
          </div>

          {/* Interés & Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Interés
              </label>
              <select
                value={interes}
                onChange={(e) => setInteres(e.target.value as LeadInterest)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="comprar">🛍️ Comprar productos</option>
                <option value="vender">💼 Vender (Ingresos)</option>
                <option value="ambos">✨ Ambos (Comprar y Vender)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estado en CRM
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#BF0B57]"
              >
                <option value="nuevo">🟡 Nuevo</option>
                <option value="contactado">🔵 Contactado</option>
                <option value="en_seguimiento">🟣 En seguimiento</option>
                <option value="cliente">🟢 Cliente activo</option>
                <option value="consultora">💎 Consultora activa</option>
                <option value="descartado">⚪ Descartado</option>
              </select>
            </div>
          </div>

          {/* Marca favorita */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Marca Favorita
            </label>
            <select
              value={marcaFavorita}
              onChange={(e) => setMarcaFavorita(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
            >
              <option value="Todas las marcas">Todas las marcas (L'Bel, Ésika y Cyzone)</option>
              <option value="L'Bel">L'Bel</option>
              <option value="Ésika">Ésika</option>
              <option value="Cyzone">Cyzone</option>
            </select>
          </div>

          {/* Etiquetas / Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Etiquetas del Lead
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {etiquetas.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EAE5EC] text-[#69377D]"
                >
                  <Tag className="w-3 h-3 text-[#BF0B57]" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add common tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-[11px] text-slate-400 self-center mr-1">Sugeridas:</span>
              {COMMON_TAGS.filter((t) => !etiquetas.includes(t)).slice(0, 4).map((t) => (
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

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribir nueva etiqueta..."
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

          {/* Notas Privadas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notas Privadas de Seguimiento (Solo visibles para ti)
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Interesada en vender para pagar estudios, llamarla el martes a las 4pm..."
              value={notasPrivadas}
              onChange={(e) => setNotasPrivadas(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Contacto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
