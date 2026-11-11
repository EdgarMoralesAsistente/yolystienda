import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { GoogleSheetsConfig, createCRMSpreadsheet, pushAllDataToSheets, pullDataFromSheets } from '../lib/googleSheetsService';
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
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'idle'; message?: string }>({
    type: 'idle'
  });

  // Manual link existing sheet input
  const [manualSheetIdOrUrl, setManualSheetIdOrUrl] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'conexion' | 'appscript'>('conexion');

  // Create new Sheet automatically
  const handleAutoCreate = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({
        type: 'error',
        message: 'No se encontró el token de acceso. Por favor cierra sesión y vuelve a entrar con tu cuenta de Google.'
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

  // Push CRM to Sheets
  const handleSyncToSheets = async () => {
    if (!sheetsConfig) return;
    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', message: 'Inicia sesión con Google para sincronizar.' });
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
    if (!sheetsConfig) return;
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
    // extract if user pasted full URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }

    const token = getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', message: 'Inicia sesión con tu cuenta de Google.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'idle' });

    try {
      // Test read to verify access
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
      setStatusMessage({ type: 'idle' });
    }
  };

  const appsScriptCode = `// CÓDIGO DE GOOGLE APPS SCRIPT PARA TU CRM
function doGet(e) {
  return HtmlService.createHtmlOutput("Backend CRM Yoly funcionando correctamente.");
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.id || "lead_" + Date.now(),
      new Date().toLocaleString(),
      data.nombre || "",
      data.apellido || "",
      data.whatsapp || "",
      data.email || "",
      data.interes || "",
      data.marcaFavorita || "",
      data.columnaId || "Nuevos en Feria",
      data.probabilidadConversion || 40,
      data.valorEstimado || 30,
      (data.etiquetas || []).join(", "),
      data.notasPrivadas || "",
      "",
      "",
      data.mensaje || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

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
                Backend en Google Sheets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacenamiento y sincronización de leads y actividades en tu Google Drive
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
            onClick={() => setActiveTab('conexion')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'conexion'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Conexión Directa (Automática)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appscript')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'appscript'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Google Apps Script (Opcional)
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
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

          {activeTab === 'conexion' ? (
            sheetsConfig ? (
              /* ALREADY CONNECTED VIEW */
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                        Base de Datos Conectada
                      </span>
                    </div>

                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Abrir en Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <div className="font-extrabold text-sm text-slate-900">
                      {sheetsConfig.spreadsheetTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                      ID: {sheetsConfig.spreadsheetId}
                    </div>
                    {sheetsConfig.lastSyncedAt && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Última sincronización: {new Date(sheetsConfig.lastSyncedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Summary of Sheets Created */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-700 mb-1.5">
                      Estructura de Hojas (Tablas) Sincronizadas:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">1. Leads:</span> {leads.length} registros
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">2. Columnas_Kanban:</span> {columns.length} etapas
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">3. Actividades_Programadas:</span> Tareas y fechas
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">4. Historial_Acciones:</span> Timeline de eventos
                      </div>
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
                      <span>Enviar datos a Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sobrescribe y actualiza las hojas con los {leads.length} leads y columnas actuales del CRM.
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
                      <span>Cargar desde Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Lee los cambios o leads que hayas añadido directamente desde la hoja de cálculo.
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
              /* NOT CONNECTED VIEW: 1-CLICK AUTOMATIC SETUP */
              <div className="space-y-5">
                {/* 1-Click Auto Creation Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-[#FAF8FB] border-2 border-emerald-300 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-2xl bg-emerald-600 text-white shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Opción Recomendada: Crear Base de Datos en 1 Clic
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        No necesitas saber programar ni crear archivos manualmente. La aplicación creará en tu Google Drive una hoja de cálculo completa con las 4 tablas necesarias formateadas:
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Hoja 1: Leads</strong> (Datos personales, WhatsApp, marca, etapa, probabilidad, notas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Hoja 2: Columnas_Kanban</strong> (Etapas del tablero de seguimiento)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Hoja 3: Actividades_Programadas</strong> (Llamadas, entregas y tareas agendadas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Hoja 4: Historial_Acciones</strong> (Registro de eventos de contacto)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoCreate}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isLoading ? 'Creando hoja en Google Drive...' : '✨ Crear Hoja de Cálculo Automáticamente'}</span>
                  </button>
                </div>

                {/* Option 2: Link existing sheet */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Link2 className="w-4 h-4 text-slate-500" />
                    <span>O vincular una hoja de cálculo existente</span>
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
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Vincular
                    </button>
                  </form>
                </div>
              </div>
            )
          ) : (
            /* APPS SCRIPT OPTIONAL TAB */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>¿Es necesario usar Google Apps Script?</span>
                </div>
                <p className="leading-relaxed">
                  <strong>¡No es obligatorio!</strong> Con la pestaña <em>"Conexión Directa"</em> la integración ya funciona de forma automática usando tu cuenta de Google.
                </p>
                <p className="leading-relaxed">
                  Solo necesitas Apps Script si deseas recibir leads desde otros formularios externos o crear webhooks personalizados.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Código de Apps Script para Google Sheets:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copiado' : 'Copiar Código'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  {appsScriptCode}
                </pre>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <strong>Instrucciones paso a paso para Apps Script:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 pl-1">
                  <li>Abre tu hoja en Google Sheets.</li>
                  <li>Ve al menú superior: <strong>Extensiones → Apps Script</strong>.</li>
                  <li>Pega el código de arriba y pulsa Guardar (disco).</li>
                  <li>Haz clic en <strong>Implementar → Nueva implementación → Aplicación web</strong>.</li>
                  <li>En "Quién tiene acceso", selecciona <strong>Cualquier usuario</strong> y pulsa Implementar.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {currentUser?.email ? (
              <span>Conectado como: <strong>{currentUser.email}</strong></span>
            ) : (
              <span>Sesión no iniciada</span>
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
