import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Upload,
  Download,
  AlertCircle,
  Sparkles,
  Link2,
  Trash2,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Send,
  Zap,
  Play
} from 'lucide-react';
import {
  GoogleSheetsConfig,
  createCRMSpreadsheet,
  pushAllDataToSheets,
  pullDataFromSheets,
  CRM_APPS_SCRIPT_TEMPLATE,
  saveAppsScriptUrl,
  getSavedAppsScriptUrl,
  testAppsScriptWebhook
} from '../lib/googleSheetsService';
import { Lead, KanbanColumn } from '../types';
import { getAccessToken } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface CRMGoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetsConfig: GoogleSheetsConfig | null;
  onConfigChange: (config: GoogleSheetsConfig | null) => void;
  leads: Lead[];
  columns: KanbanColumn[];
  onLeadsUpdatedFromSheets: (pulledLeads: Lead[]) => void;
  currentUser: User | null;
}

export const CRMGoogleSheetsModal: React.FC<CRMGoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  sheetsConfig,
  onConfigChange,
  leads,
  columns,
  onLeadsUpdatedFromSheets,
  currentUser
}) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'idle';
    message?: string;
  }>({
    type: 'idle'
  });

  // Manual link existing sheet input
  const [manualSheetIdOrUrl, setManualSheetIdOrUrl] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'appscript' | 'conexion'>('appscript');

  // Apps Script Webhook URL input
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState(() =>
    sheetsConfig?.appsScriptUrl || getSavedAppsScriptUrl() || ''
  );

  useEffect(() => {
    if (sheetsConfig?.appsScriptUrl) {
      setAppsScriptUrlInput(sheetsConfig.appsScriptUrl);
    }
  }, [sheetsConfig]);

  // Save Apps Script URL
  const handleSaveAppsScriptUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = appsScriptUrlInput.trim();
    if (!clean) {
      setStatusMessage({
        type: 'error',
        message: 'Por favor pega la URL de tu aplicación web (empieza con https://script.google.com/...)'
      });
      return;
    }

    if (!clean.includes('script.google.com')) {
      setStatusMessage({
        type: 'error',
        message: 'La URL ingresada no parece ser de Google Apps Script. Debe provenir de script.google.com'
      });
      return;
    }

    saveAppsScriptUrl(clean);
    if (sheetsConfig) {
      onConfigChange({
        ...sheetsConfig,
        appsScriptUrl: clean
      });
    } else {
      onConfigChange({
        spreadsheetId: '',
        spreadsheetUrl: '',
        spreadsheetTitle: 'Google Sheets CRM (Apps Script)',
        appsScriptUrl: clean
      });
    }

    setStatusMessage({
      type: 'success',
      message: '¡URL de Apps Script guardada correctamente! Todos los leads del formulario se enviarán a esta hoja.'
    });
  };

  // Test Apps Script Webhook
  const handleTestWebhook = async () => {
    const clean = appsScriptUrlInput.trim();
    if (!clean) {
      setStatusMessage({
        type: 'error',
        message: 'Primero pega la URL de tu Web App de Google Apps Script para probar la conexión.'
      });
      return;
    }

    setIsTestingWebhook(true);
    setStatusMessage({ type: 'idle' });

    try {
      const res = await testAppsScriptWebhook(clean);
      if (res.success) {
        // Also save it
        saveAppsScriptUrl(clean);
        setStatusMessage({
          type: 'success',
          message: '🎉 ' + res.message
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Error al conectar con la URL de Apps Script.'
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Create new Sheet automatically via Google API
  const handleAutoCreate = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({
        type: 'error',
        message: 'Inicia sesión con Google (Gmail) para crear la hoja automáticamente, o usa la pestaña Apps Script.'
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'idle' });

    try {
      const config = await createCRMSpreadsheet(token, leads, columns);
      onConfigChange(config);
      setStatusMessage({
        type: 'success',
        message: '¡Google Sheets creado con éxito! Ya puedes abrirlo en tu Google Drive y ver todas las tablas sincronizadas.'
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        message: err.message || 'Error al crear la hoja en Google Sheets. Verifica los permisos de tu cuenta.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Push all CRM data to Sheets
  const handleSyncToSheets = async () => {
    if (!sheetsConfig?.spreadsheetId) {
      setStatusMessage({
        type: 'error',
        message: 'Primero debes vincular el ID de la hoja de Google Sheets.'
      });
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setStatusMessage({
        type: 'error',
        message: 'Para sincronizar masivamente con la API de Google, inicia sesión con Google (Gmail).'
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'idle' });

    try {
      await pushAllDataToSheets(token, sheetsConfig.spreadsheetId, leads, columns);
      onConfigChange({
        ...sheetsConfig,
        lastSyncedAt: new Date().toISOString()
      });
      setStatusMessage({
        type: 'success',
        message: `¡Datos actualizados con éxito en Google Sheets! (${leads.length} leads enviados).`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Error al sincronizar datos hacia Google Sheets.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pull from Sheets
  const handlePullFromSheets = async () => {
    if (!sheetsConfig?.spreadsheetId) return;
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', message: 'Inicia sesión con Google para sincronizar.' });
      return;
    }

    const confirmPull = window.confirm(
      '¿Deseas descargar los datos desde Google Sheets hacia tu CRM? Esto actualizará tus leads con los cambios hechos en la hoja.'
    );
    if (!confirmPull) return;

    setIsLoading(true);
    setStatusMessage({ type: 'idle' });

    try {
      const { leads: pulledLeads } = await pullDataFromSheets(token, sheetsConfig.spreadsheetId, columns);
      if (pulledLeads.length > 0) {
        onLeadsUpdatedFromSheets(pulledLeads);
        onConfigChange({
          ...sheetsConfig,
          lastSyncedAt: new Date().toISOString()
        });
        setStatusMessage({
          type: 'success',
          message: `¡Se importaron ${pulledLeads.length} leads desde Google Sheets con éxito!`
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: 'No se encontraron filas con datos en la pestaña Leads de tu Google Sheets.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Error al importar datos desde Google Sheets.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Link existing sheet
  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSheetIdOrUrl.trim()) return;

    let id = manualSheetIdOrUrl.trim();
    const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }

    const token = getAccessToken();
    if (!token) {
      // Still allow linking by ID without token for manual reference
      const config: GoogleSheetsConfig = {
        spreadsheetId: id,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
        spreadsheetTitle: 'Google Sheets Vinculado',
        appsScriptUrl: appsScriptUrlInput.trim() || undefined,
        lastSyncedAt: new Date().toISOString()
      };
      onConfigChange(config);
      setManualSheetIdOrUrl('');
      setStatusMessage({
        type: 'success',
        message: `¡Hoja vinculada con éxito! ID: ${id}.`
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'idle' });

    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('No se pudo acceder a la hoja. Asegúrate de tener permisos con tu cuenta de Google.');
      }

      const data = await res.json();
      const config: GoogleSheetsConfig = {
        spreadsheetId: id,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
        spreadsheetTitle: data.properties?.title || 'Mi Google Sheets CRM',
        appsScriptUrl: appsScriptUrlInput.trim() || undefined,
        lastSyncedAt: new Date().toISOString()
      };

      onConfigChange(config);
      setManualSheetIdOrUrl('');
      setStatusMessage({
        type: 'success',
        message: `¡Hoja vinculada con éxito! Conectado a: "${config.spreadsheetTitle}".`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'ID o enlace de Google Sheets inválido.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    if (window.confirm('¿Seguro que deseas desvincular Google Sheets? Tus datos locales se conservarán intactos.')) {
      onConfigChange(null);
      saveAppsScriptUrl('');
      setAppsScriptUrlInput('');
      setStatusMessage({ type: 'idle' });
    }
  };

  const isScriptActive = Boolean(appsScriptUrlInput.trim() && appsScriptUrlInput.includes('script.google.com'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-['Montserrat',sans-serif]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Integración con Google Sheets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacena tus leads en tiempo real directamente en tu Google Drive
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
            onClick={() => setActiveTab('appscript')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'appscript'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Captura en Vivo (Google Apps Script)</span>
            {isScriptActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conexion')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'conexion'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Hojas y Sincronización Masiva</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Status Alert if any */}
          {statusMessage.type === 'error' && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{statusMessage.message}</span>
            </div>
          )}

          {statusMessage.type === 'success' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{statusMessage.message}</span>
            </div>
          )}

          {activeTab === 'appscript' ? (
            /* TAB 1: APPS SCRIPT WEBHOOK (RECOMMENDED FOR PUBLIC FORM CAPTURE) */
            <div className="space-y-4 text-xs">
              {/* Critical clarification box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-700 space-y-2">
                <div className="flex items-start gap-2 text-emerald-900 font-extrabold text-xs sm:text-sm">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>¿Por qué tus leads de prueba no estaban llegando a Google Sheets?</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed pl-6">
                  Cuando un cliente o visitante llena el formulario público (o escanea tu código QR en la feria), <strong>no inicia sesión con tu cuenta de Gmail</strong>. Por eso, para que los datos viajen directo a tu hoja de cálculo sin pedirle contraseña a nadie, Google utiliza una <strong>Web App de Apps Script</strong> (un webhook seguro que tú creas en 2 minutos).
                </p>
              </div>

              {/* Status & Input Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    URL de tu Web App de Google Apps Script:
                  </label>
                  {isScriptActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Conexión Activa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Pendiente de Configurar
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveAppsScriptUrl} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={appsScriptUrlInput}
                    onChange={(e) => setAppsScriptUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none font-mono text-[11px] text-slate-800"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Guardar URL
                    </button>
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook || !appsScriptUrlInput.trim()}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTestingWebhook ? 'Probando...' : '🧪 Probar Envío'}</span>
                    </button>
                  </div>
                </form>

                <p className="text-[11px] text-slate-500">
                  Al pulsar <strong>&quot;🧪 Probar Envío&quot;</strong>, enviaremos una fila de prueba de inmediato para que confirmes que aparece en tu hoja.
                </p>
              </div>

              {/* Step by Step Guide with Code */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-extrabold text-xs text-slate-900">
                  Pasos sencillos para crear tu Web App en Google Sheets (Solo se hace 1 vez):
                </div>

                <div className="space-y-2.5 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Abre tu hoja en Google Sheets y en el menú superior ve a: <strong>Extensiones → Apps Script</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span>Borra el código que aparezca y pega este código exacto:</span>
                      <div className="mt-1.5 relative">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(CRM_APPS_SCRIPT_TEMPLATE);
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedScript ? '¡Copiado!' : 'Copiar Código'}</span>
                        </button>
                        <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10.5px] overflow-x-auto max-h-40 leading-relaxed">
                          {CRM_APPS_SCRIPT_TEMPLATE}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Haz clic en el icono de <strong>Guardar (disco 💾)</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Haz clic arriba a la derecha en el botón azul <strong>Implementar → Nueva implementación</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      5
                    </span>
                    <span>
                      En el engranaje ⚙️ elige <strong>Aplicación web</strong>. En <em>&quot;Quién tiene acceso&quot;</em> selecciona <strong>&quot;Cualquier usuario&quot; (Anyone)</strong> y pulsa <strong>Implementar</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      6
                    </span>
                    <span>
                      Copia la <strong>URL de la aplicación web</strong> que te da Google, pégala arriba y haz clic en <strong>&quot;Guardar URL&quot;</strong>. ¡Eso es todo!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: FULL SPREADSHEET & DIRECT GOOGLE API SYNC */
            <div className="space-y-4 text-xs">
              {sheetsConfig?.spreadsheetId ? (
                /* CONNECTED SHEET DETAILS */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                          Hoja Principal Vinculada
                        </span>
                      </div>

                      {sheetsConfig.spreadsheetUrl && (
                        <a
                          href={sheetsConfig.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Abrir en Google Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                      <div className="font-extrabold text-sm text-slate-900">
                        {sheetsConfig.spreadsheetTitle || 'CRM Yoly Belcorp'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                        ID: {sheetsConfig.spreadsheetId}
                      </div>
                      {sheetsConfig.lastSyncedAt && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          Última sincronización masiva: {new Date(sheetsConfig.lastSyncedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Structure of Tabs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">1. Leads:</span> {leads.length} registros
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">2. Columnas:</span> {columns.length} etapas
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">3. Actividades:</span> Fechas y tareas
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">4. Historial:</span> Timeline
                      </div>
                    </div>
                  </div>

                  {/* Actions: Push & Pull */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleSyncToSheets}
                      disabled={isLoading}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Subir todos los leads a Google Sheets</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sube y actualiza en lote tus {leads.length} leads actuales hacia tu hoja.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={handlePullFromSheets}
                      disabled={isLoading}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all shadow-xs cursor-pointer group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-[#69377D]">
                        <Download className="w-4 h-4 text-[#69377D]" />
                        <span>Descargar desde Google Sheets</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Lee filas nuevas que hayas escrito manualmente en la hoja.
                      </p>
                    </button>
                  </div>

                  {/* Disconnect Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desvincular esta hoja</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* NOT YET LINKED */
                <div className="space-y-4">
                  {/* Option 1: 1-Click creation */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                          Crear Hoja Completa en tu Google Drive
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Crea un archivo nuevo en tu Drive con las 4 tablas (Leads, Columnas, Actividades, Historial).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoCreate}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{isLoading ? 'Creando hoja en Google Drive...' : '✨ Crear Hoja Automáticamente en Drive'}</span>
                    </button>
                  </div>

                  {/* Option 2: Link existing ID */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                      <Link2 className="w-4 h-4 text-slate-500" />
                      <span>O vincular por enlace / ID de Google Sheet</span>
                    </div>

                    <form onSubmit={handleLinkExisting} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Pega el enlace o ID de tu Google Sheet..."
                        value={manualSheetIdOrUrl}
                        onChange={(e) => setManualSheetIdOrUrl(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !manualSheetIdOrUrl.trim()}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Vincular
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {currentUser?.email ? (
              <span>Sesión activa: <strong>{currentUser.email}</strong></span>
            ) : (
              <span>Modo Administradora (PIN)</span>
            )}
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
