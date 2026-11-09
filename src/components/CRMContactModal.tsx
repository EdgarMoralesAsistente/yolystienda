import React, { useState } from 'react';
import { X, MessageCircle, Mail, Send, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { Lead, CRMTemplate } from '../types';
import { sendGmailMessage } from '../lib/gmailService';
import { getAccessToken } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface CRMContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  templates: CRMTemplate[];
  currentUser: User | null;
  onLeadContacted: (leadId: string, channel: 'whatsapp' | 'email') => void;
}

export const CRMContactModal: React.FC<CRMContactModalProps> = ({
  isOpen,
  onClose,
  lead,
  templates,
  currentUser,
  onLeadContacted
}) => {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    // Pick the most relevant template based on lead interest
    const match = templates.find((t) => t.categoria === lead.interes);
    return match ? match.id : templates[0]?.id || '';
  });

  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle'
  });
  const [copied, setCopied] = useState(false);

  // Fill content when template or lead changes
  React.useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl && lead) {
      const parsedSubject = (tpl.asunto || 'Información de L\'Bel, Ésika y Cyzone')
        .replace(/\{nombre\}/g, lead.nombre)
        .replace(/\{apellido\}/g, lead.apellido)
        .replace(/\{interes\}/g, lead.interes)
        .replace(/\{marca\}/g, lead.marcaFavorita || 'L\'Bel, Ésika y Cyzone');

      const parsedBody = tpl.contenido
        .replace(/\{nombre\}/g, lead.nombre)
        .replace(/\{apellido\}/g, lead.apellido)
        .replace(/\{interes\}/g, lead.interes)
        .replace(/\{marca\}/g, lead.marcaFavorita || 'L\'Bel, Ésika y Cyzone');

      setSubject(parsedSubject);
      setMessageBody(parsedBody);
      setEmailStatus({ type: 'idle' });
    }
  }, [selectedTemplateId, lead, templates]);

  // WhatsApp Action
  const handleSendWhatsApp = () => {
    const cleanNumber = lead.whatsapp.replace(/\D/g, '');
    const encoded = encodeURIComponent(messageBody);
    const url = cleanNumber ? `https://wa.me/${cleanNumber}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    
    window.open(url, '_blank');
    onLeadContacted(lead.id, 'whatsapp');
    onClose();
  };

  // Gmail Send Action
  const handleSendEmail = async () => {
    if (!currentUser?.email) {
      setEmailStatus({
        type: 'error',
        message: 'Debes haber iniciado sesión con tu cuenta de Gmail para enviar correos.'
      });
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setEmailStatus({
        type: 'error',
        message: 'No se encontró el token de Gmail. Por favor vuelve a iniciar sesión con Google.'
      });
      return;
    }

    // MANDATORY confirmation dialog before mutating/sending email
    const confirmed = window.confirm(
      `¿Deseas enviar este correo electrónico desde tu cuenta ${currentUser.email} a ${lead.nombre} (${lead.email})?`
    );
    if (!confirmed) return;

    setIsSendingEmail(true);
    setEmailStatus({ type: 'idle' });

    try {
      const result = await sendGmailMessage({
        to: lead.email,
        from: currentUser.email,
        subject,
        bodyText: messageBody,
        accessToken: token
      });

      if (result.success) {
        setEmailStatus({
          type: 'success',
          message: `¡Correo enviado exitosamente a ${lead.email} vía Gmail!`
        });
        onLeadContacted(lead.id, 'email');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setEmailStatus({
          type: 'error',
          message: result.error || 'Error al enviar por Gmail. Verifica tus permisos.'
        });
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Error inesperado al enviar el mensaje'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Contactar a {lead.nombre} {lead.apellido}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#BF0B57]/10 text-[#BF0B57] capitalize">
                {lead.interes}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span>WA: {lead.whatsapp}</span>
              <span>·</span>
              <span>Email: {lead.email}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-3 gap-3 bg-white">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Enviar por WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-red-600" />
            <span>Enviar con Gmail API</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Template Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Seleccionar Plantilla Predefinida
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

          {/* Email Subject if Email tab */}
          {activeTab === 'email' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Asunto del Correo
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
              />
            </div>
          )}

          {/* Message Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Mensaje Personalizado
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57] font-sans"
            />
          </div>

          {/* Status Alert if sending email */}
          {emailStatus.type === 'error' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{emailStatus.message}</span>
            </div>
          )}

          {emailStatus.type === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{emailStatus.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>

          {activeTab === 'whatsapp' ? (
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir chat de WhatsApp</span>
            </button>
          ) : (
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingEmail ? 'Enviando vía Gmail...' : 'Enviar correo desde mi Gmail'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
