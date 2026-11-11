import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  Share2,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Globe,
  KeyRound,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetsConfig } from '../lib/googleSheetsService';

interface CRMAccessManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  sheetsConfig: GoogleSheetsConfig | null;
}

const AUTHORIZED_EMAILS_STORAGE_KEY = 'yoly_authorized_emails';

export function getAuthorizedEmails(currentAdminEmail?: string | null): string[] {
  try {
    const raw = localStorage.getItem(AUTHORIZED_EMAILS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return currentAdminEmail ? [currentAdminEmail.toLowerCase()] : ['mibibliotecologo@gmail.com'];
}

export function saveAuthorizedEmails(emails: string[]): void {
  localStorage.setItem(AUTHORIZED_EMAILS_STORAGE_KEY, JSON.stringify(emails.map((e) => e.toLowerCase())));
}

export const CRMAccessManagerModal: React.FC<CRMAccessManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sheetsConfig
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'pasos' | 'whitelist' | 'dominios'>('pasos');
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() =>
    getAuthorizedEmails(currentUser?.email)
  );
  const [newEmail, setNewEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [currentPin, setCurrentPin] = useState(() => localStorage.getItem('yoly_crm_pin') || '2026');
  const [newPinInput, setNewPinInput] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'idle'; message?: string }>({
    type: 'idle'
  });

  const appUrl = window.location.origin;
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl =
    'https://console.firebase.google.com/project/gen-lang-client-0701003609/authentication/settings';

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPinInput.trim();
    if (clean.length < 4) {
      setAlertMsg({ type: 'error', message: 'El PIN debe tener al menos 4 dígitos o caracteres.' });
      return;
    }
    localStorage.setItem('yoly_crm_pin', clean);
    setCurrentPin(clean);
    setNewPinInput('');
    setAlertMsg({ type: 'success', message: `¡PIN de Administradora actualizado exitosamente!` });
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean) return;

    if (!clean.includes('@') || !clean.includes('.')) {
      setAlertMsg({ type: 'error', message: 'Ingresa un correo electrónico válido.' });
      return;
    }

    if (authorizedEmails.includes(clean)) {
      setAlertMsg({ type: 'error', message: 'Este correo ya está en la lista de acceso.' });
      return;
    }

    const updated = [...authorizedEmails, clean];
    setAuthorizedEmails(updated);
    saveAuthorizedEmails(updated);
    setNewEmail('');
    setAlertMsg({ type: 'success', message: `¡Acceso concedido a ${clean}!` });
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (currentUser?.email && emailToRemove.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('No puedes eliminar tu propio correo de administradora.');
      return;
    }

    if (window.confirm(`¿Seguro que deseas revocar el acceso al CRM para ${emailToRemove}?`)) {
      const updated = authorizedEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
      setAuthorizedEmails(updated);
      saveAuthorizedEmails(updated);
      setAlertMsg({ type: 'success', message: `Se revocó el acceso para ${emailToRemove}` });
    }
  };

  const handleCopyAppLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-['Montserrat',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#69377D] to-[#BF0B57] text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Dar Acceso a Otros Usuarios
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cómo autorizar a socias, colaboradoras o asistentes con su cuenta de Google
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-4 sm:px-6 bg-white gap-4 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pasos')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'pasos'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Guía Paso a Paso (Fácil)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whitelist')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'whitelist'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            2. Correos Autorizados ({authorizedEmails.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dominios')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'dominios'
                ? 'border-[#BF0B57] text-[#BF0B57]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. Dominios Vercel & PIN</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {alertMsg.type === 'error' && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{alertMsg.message}</span>
            </div>
          )}

          {alertMsg.type === 'success' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{alertMsg.message}</span>
            </div>
          )}

          {activeTab === 'pasos' ? (
            <div className="space-y-4 text-xs">
              {/* Introduction Box */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-[#69377D] space-y-1">
                <div className="font-extrabold text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#BF0B57]" />
                  <span>Para que otra persona use tu CRM, solo requieres 2 pasos:</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  El sistema funciona con la seguridad oficial de Google. Tú mantienes siempre el control de quién puede ver o editar tus datos.
                </p>
              </div>

              {/* Paso 1 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#BF0B57] text-white flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <span>Compartir tu hoja de Google Sheets con su correo</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs pl-8">
                  Como la base de datos está guardada en tu Google Drive, debes darle permiso para que la aplicación le permita leer y guardar los leads:
                </p>

                <div className="ml-8 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Abre tu hoja de cálculo haciendo clic en el botón de abajo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>En la esquina superior derecha de Google Sheets, pulsa el botón azul <strong>"Compartir" (Share)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Escribe el correo Gmail de tu colaboradora y asegúrate de asignarle rol de <strong>"Editor"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pulsa <strong>Enviar</strong>.</span>
                  </div>
                </div>

                {sheetsConfig ? (
                  <div className="ml-8 pt-1">
                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Abrir mi Google Sheet para Compartir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="ml-8 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Aún no has creado la hoja en Google Sheets. Primero pulsa el botón verde "Conectar Sheets" en el panel.
                  </p>
                )}
              </div>

              {/* Paso 2 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#69377D] text-white flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <span>Enviarle el enlace de la aplicación para que inicie sesión</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs pl-8">
                  Pásale el enlace del CRM a tu colaboradora. Ella solo debe hacer clic en <strong>"Iniciar sesión con Google"</strong> con el correo que tú autorizaste:
                </p>

                <div className="ml-8 flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyAppLink}
                    className="px-3.5 py-2 rounded-xl bg-[#BF0B57] hover:bg-[#a00949] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar Enlace'}</span>
                  </button>
                </div>
              </div>

              {/* Security Tip */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Consejo de seguridad:</strong> Si en algún momento ya no quieres que esa persona tenga acceso, simplemente abres tu Google Sheets, vas a <em>Compartir</em> y le retiras el permiso, o eliminas su correo en la pestaña <em>"Correos Autorizados"</em>.
                </p>
              </div>
            </div>
          ) : activeTab === 'whitelist' ? (
            /* WHITELIST MANAGEMENT TAB */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-[#69377D]">
                <p className="font-bold">Control de Acceso al CRM</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Solo los correos registrados en esta lista podrán ingresar al panel de administración.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Escribe el Gmail del nuevo usuario (ej. socia@gmail.com)..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#BF0B57]"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#BF0B57] hover:bg-[#a00949] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Autorizar</span>
                </button>
              </form>

              {/* List of authorized users */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Usuarios con acceso ({authorizedEmails.length}):
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {authorizedEmails.map((email) => {
                    const isSelf = currentUser?.email && email.toLowerCase() === currentUser.email.toLowerCase();

                    return (
                      <div
                        key={email}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {email[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{email}</div>
                            <div className="text-[10px] text-slate-400">
                              {isSelf ? 'Administradora Principal (Tú)' : 'Colaboradora Autorizada'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isSelf ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Propietaria
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Revocar acceso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 3: Dominios Autorizados & PIN */
            <div className="space-y-4 text-xs">
              {/* Vercel Domain Info Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-700 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-amber-950">
                      Dominio de Vercel y Firebase (auth/unauthorized-domain)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Si al pulsar &quot;Iniciar sesión con Google&quot; en Vercel aparece un error de dominio no autorizado, solo debes registrar la dirección de tu web en Firebase Console.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tu dominio actual:</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{currentHostname || 'tu-proyecto.vercel.app'}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentHostname) {
                          navigator.clipboard.writeText(currentHostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedDomain ? '¡Copiado!' : 'Copiar'}</span>
                    </button>

                    <a
                      href={firebaseSettingsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Abrir Firebase</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-[11px] space-y-1.5">
                  <div className="font-bold text-amber-950">Pasos rápidos en Firebase:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Haz clic en el botón <strong>&quot;Abrir Firebase&quot;</strong>.</li>
                    <li>Baja a la sección <strong>&quot;Dominios autorizados&quot; (Authorized domains)</strong>.</li>
                    <li>Haz clic en <strong>&quot;Agregar dominio&quot;</strong>, pega tu dominio copiado y pulsa <strong>Guardar</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Master PIN Settings Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#BF0B57] flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      PIN Maestro de Administradora
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Permite el acceso directo sin Google en caso de emergencias o problemas en el navegador.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600">PIN actual:</span>
                  <span className="font-mono font-bold text-sm text-[#BF0B57] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentPin}
                  </span>
                </div>

                <form onSubmit={handleUpdatePin} className="flex gap-2">
                  <input
                    type="text"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Nuevo PIN (ej: 2026, 4488)"
                    maxLength={10}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#BF0B57] outline-none text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Guardar PIN
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Tu cuenta: <strong>{currentUser?.email || 'mibibliotecologo@gmail.com'}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
