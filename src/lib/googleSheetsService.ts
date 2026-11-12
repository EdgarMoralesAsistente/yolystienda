import { Lead, KanbanColumn, ScheduledAction, ActivityLogEntry } from '../types';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  appsScriptUrl?: string;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'yoly_google_sheets_config';
const APPS_SCRIPT_URL_KEY = 'yoly_apps_script_url';

export function getSavedSheetsConfig(): GoogleSheetsConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if we only have the apps script url
      const scriptUrl = localStorage.getItem(APPS_SCRIPT_URL_KEY);
      if (scriptUrl) {
        return {
          spreadsheetId: '',
          spreadsheetUrl: '',
          spreadsheetTitle: 'Google Sheets (Apps Script Webhook)',
          appsScriptUrl: scriptUrl
        };
      }
      return null;
    }
    const parsed: GoogleSheetsConfig = JSON.parse(raw);
    if (!parsed.appsScriptUrl) {
      const scriptUrl = localStorage.getItem(APPS_SCRIPT_URL_KEY);
      if (scriptUrl) parsed.appsScriptUrl = scriptUrl;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSheetsConfig(config: GoogleSheetsConfig | null): void {
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (config.appsScriptUrl) {
      localStorage.setItem(APPS_SCRIPT_URL_KEY, config.appsScriptUrl);
    }
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function saveAppsScriptUrl(url: string): void {
  const clean = url.trim();
  if (clean) {
    localStorage.setItem(APPS_SCRIPT_URL_KEY, clean);
    const existing = getSavedSheetsConfig();
    if (existing) {
      existing.appsScriptUrl = clean;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } else {
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId: '',
        spreadsheetUrl: '',
        spreadsheetTitle: 'Google Sheets (Apps Script Webhook)',
        appsScriptUrl: clean
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    }
  } else {
    localStorage.removeItem(APPS_SCRIPT_URL_KEY);
    const existing = getSavedSheetsConfig();
    if (existing) {
      delete existing.appsScriptUrl;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  }
}

export function getSavedAppsScriptUrl(): string {
  try {
    const fromConfig = getSavedSheetsConfig()?.appsScriptUrl;
    if (fromConfig) return fromConfig.trim();
    const fromKey = localStorage.getItem(APPS_SCRIPT_URL_KEY);
    return fromKey ? fromKey.trim() : '';
  } catch {
    return '';
  }
}

/**
 * Sends a lead directly to the Google Apps Script Web App.
 * This works for ALL visitors (anonymous, public, mobile QR code scanners)
 * without requiring Google login.
 */
export async function sendLeadToAppsScript(
  appsScriptUrl: string,
  lead: Lead,
  columns?: KanbanColumn[]
): Promise<boolean> {
  const cleanUrl = appsScriptUrl.trim();
  if (!cleanUrl) {
    throw new Error('La URL de Google Apps Script está vacía.');
  }

  const colName =
    columns && lead.columnaId
      ? columns.find((c) => c.id === lead.columnaId)?.title || 'Nuevos en Feria'
      : 'Nuevos en Feria';

  const payload = {
    id: lead.id,
    fecha: lead.fecha || new Date().toISOString(),
    nombre: lead.nombre,
    apellido: lead.apellido,
    whatsapp: lead.whatsapp,
    email: lead.email,
    interes: lead.interes,
    marcaFavorita: lead.marcaFavorita || 'Todas las marcas',
    columna: colName,
    probabilidadConversion: lead.probabilidadConversion ?? 40,
    valorEstimado: lead.valorEstimado ?? 30,
    etiquetas: (lead.etiquetas || []).join(', '),
    notasPrivadas: lead.notasPrivadas || '',
    mensaje: lead.mensaje || '',
    origen: lead.origen || 'Landing Page de Feria'
  };

  try {
    // text/plain mode with no-cors avoids CORS preflight failures from Google Apps Script redirects
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err: any) {
    console.error('Error enviando lead a Apps Script:', err);
    throw new Error(err?.message || 'Error de red al conectar con Google Apps Script');
  }
}

/**
 * Sends a test ping to verify that the Google Apps Script Web App is reachable.
 */
export async function testAppsScriptWebhook(
  appsScriptUrl: string
): Promise<{ success: boolean; message: string }> {
  const cleanUrl = appsScriptUrl.trim();
  if (!cleanUrl) {
    return { success: false, message: 'Ingresa una URL válida de Google Apps Script' };
  }

  const testLead: Lead = {
    id: 'test_' + Date.now(),
    nombre: 'Prueba',
    apellido: 'Conexión Yoly',
    whatsapp: '+51 999 000 111',
    email: 'contacto.prueba@belcorp.com',
    interes: 'ambos',
    marcaFavorita: 'L’Bel / Ésika / Cyzone',
    fecha: new Date().toISOString(),
    origen: 'Prueba desde Panel CRM',
    estado: 'nuevo',
    mensaje: 'Fila de prueba automática para verificar la integración con Google Sheets.'
  };

  try {
    await sendLeadToAppsScript(cleanUrl, testLead);
    return {
      success: true,
      message: '¡Prueba enviada con éxito! Revisa tu Google Sheet en la pestaña "Leads". Verás esta fila agregada.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'No se pudo comunicar con Google Apps Script. Verifica la URL.'
    };
  }
}

export const CRM_APPS_SCRIPT_TEMPLATE = `// ================================================================
// CÓDIGO GOOGLE APPS SCRIPT PARA TU CRM YOLY (BELCORP)
// Pégalo en tu Google Sheet en: Extensiones -> Apps Script
// ================================================================

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: "success", 
      message: "¡Backend CRM Yoly activo y listo para recibir leads!" 
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads");
    
    // Si la pestaña "Leads" no existe, la crea automáticamente
    if (!sheet) {
      sheet = ss.insertSheet("Leads");
    }
    
    // Si la hoja está nueva, crea y estiliza los encabezados oficiales
    if (sheet.getLastRow() === 0) {
      var headers = [
        "ID",
        "Fecha Registro",
        "Nombre",
        "Apellido",
        "WhatsApp",
        "Email",
        "Interés",
        "Marca Favorita",
        "Etapa Kanban",
        "Probabilidad %",
        "Valor Estimado ($)",
        "Etiquetas",
        "Notas Privadas",
        "Último Contacto",
        "Canal Contacto",
        "Mensaje Original"
      ];
      sheet.appendRow(headers);
      
      // Estilo visual elegante con el color de marca de Yoly
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#BF0B57");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // Parsea los datos enviados desde la página web
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch(pErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var row = [
      data.id || ("lead_" + new Date().getTime()),
      data.fecha ? new Date(data.fecha).toLocaleString() : new Date().toLocaleString(),
      data.nombre || "",
      data.apellido || "",
      data.whatsapp || "",
      data.email || "",
      data.interes || "comprar",
      data.marcaFavorita || "Todas las marcas",
      data.columna || "Nuevos en Feria",
      data.probabilidadConversion || 45,
      data.valorEstimado || 35,
      data.etiquetas || "Stand Feria",
      data.notasPrivadas || "",
      "",
      "",
      data.mensaje || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: data.id })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}`;

/**
 * Creates a brand new Google Spreadsheet with 4 organized tabs:
 * 1. Leads
 * 2. Columnas_Kanban
 * 3. Actividades_Programadas
 * 4. Historial_Acciones
 */
export async function createCRMSpreadsheet(
  accessToken: string,
  leads: Lead[],
  columns: KanbanColumn[],
  title = "CRM Yoly - Belcorp (L'Bel, Ésika, Cyzone)"
): Promise<GoogleSheetsConfig> {
  const payload = {
    properties: {
      title
    },
    sheets: [
      {
        properties: {
          title: 'Leads',
          gridProperties: { frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'Columnas_Kanban',
          gridProperties: { frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'Actividades_Programadas',
          gridProperties: { frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'Historial_Acciones',
          gridProperties: { frozenRowCount: 1 }
        }
      }
    ]
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Error al crear Google Sheets: ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const config: GoogleSheetsConfig = {
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: title,
    appsScriptUrl: getSavedAppsScriptUrl() || undefined,
    lastSyncedAt: new Date().toISOString()
  };

  saveSheetsConfig(config);

  // Initial population of all sheets
  await pushAllDataToSheets(accessToken, spreadsheetId, leads, columns);

  return config;
}

/**
 * Pushes all CRM data (Leads, Columns, Tasks, History) into the 4 sheets.
 */
export async function pushAllDataToSheets(
  accessToken: string,
  spreadsheetId: string,
  leads: Lead[],
  columns: KanbanColumn[]
): Promise<void> {
  // 1. Leads Sheet Data
  const leadsHeaders = [
    'ID',
    'Fecha Registro',
    'Nombre',
    'Apellido',
    'WhatsApp',
    'Email',
    'Interés',
    'Marca Favorita',
    'Etapa Kanban (Columna)',
    'Probabilidad %',
    'Valor Estimado ($ USD)',
    'Etiquetas',
    'Notas Privadas',
    'Último Contacto',
    'Canal Contacto',
    'Mensaje Original'
  ];

  const leadsRows = leads.map((l) => {
    const colName = columns.find((c) => c.id === (l.columnaId || columns[0]?.id))?.title || l.columnaId || 'Nuevos';
    return [
      l.id,
      new Date(l.fecha).toLocaleString(),
      l.nombre,
      l.apellido,
      l.whatsapp,
      l.email,
      l.interes,
      l.marcaFavorita || 'Todas las marcas',
      colName,
      l.probabilidadConversion ?? 40,
      l.valorEstimado ?? 30,
      (l.etiquetas || []).join(', '),
      l.notasPrivadas || '',
      l.ultimoContacto ? new Date(l.ultimoContacto).toLocaleString() : '',
      l.canalUltimoContacto || '',
      l.mensaje || ''
    ];
  });

  // 2. Columnas Kanban Sheet Data
  const columnsHeaders = ['ID Columna', 'Título de Etapa', 'Color Hex'];
  const columnsRows = columns.map((c) => [c.id, c.title, c.color]);

  // 3. Actividades Programadas Sheet Data
  const tasksHeaders = [
    'ID Tarea',
    'Lead ID',
    'Nombre Lead',
    'Tipo Actividad',
    'Título / Descripción',
    'Fecha Programada',
    'Estado'
  ];

  const tasksRows: any[][] = [];
  leads.forEach((l) => {
    (l.accionesProgramadas || []).forEach((t) => {
      tasksRows.push([
        t.id,
        l.id,
        `${l.nombre} ${l.apellido}`,
        t.tipo,
        t.titulo,
        new Date(t.fechaProgramada).toLocaleString(),
        t.completada ? 'COMPLETADA' : 'PENDIENTE'
      ]);
    });
  });

  // 4. Historial Acciones Sheet Data
  const historyHeaders = [
    'ID Registro',
    'Lead ID',
    'Nombre Lead',
    'Fecha y Hora',
    'Tipo de Acción',
    'Descripción Detallada',
    'Usuario / Responsable'
  ];

  const historyRows: any[][] = [];
  leads.forEach((l) => {
    (l.historialAcciones || []).forEach((h) => {
      historyRows.push([
        h.id,
        l.id,
        `${l.nombre} ${l.apellido}`,
        new Date(h.fecha).toLocaleString(),
        h.tipo,
        h.descripcion,
        h.usuario || 'Yoly'
      ]);
    });
  });

  // Batch update values
  const valueRanges = [
    {
      range: 'Leads!A1:P' + Math.max(leadsRows.length + 1, 20),
      values: [leadsHeaders, ...leadsRows]
    },
    {
      range: 'Columnas_Kanban!A1:C' + Math.max(columnsRows.length + 1, 10),
      values: [columnsHeaders, ...columnsRows]
    },
    {
      range: 'Actividades_Programadas!A1:G' + Math.max(tasksRows.length + 1, 20),
      values: [tasksHeaders, ...tasksRows]
    },
    {
      range: 'Historial_Acciones!A1:G' + Math.max(historyRows.length + 1, 20),
      values: [historyHeaders, ...historyRows]
    }
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueRanges
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error al actualizar datos en Google Sheets`);
  }

  // Update timestamp in config
  const currentConfig = getSavedSheetsConfig();
  if (currentConfig && currentConfig.spreadsheetId === spreadsheetId) {
    saveSheetsConfig({
      ...currentConfig,
      lastSyncedAt: new Date().toISOString()
    });
  }
}

/**
 * Appends a newly captured lead directly to the Google Sheets using Google OAuth
 */
export async function appendLeadToSheets(
  accessToken: string,
  spreadsheetId: string,
  lead: Lead,
  columns: KanbanColumn[]
): Promise<void> {
  const colName = columns.find((c) => c.id === (lead.columnaId || columns[0]?.id))?.title || 'Nuevos en Feria';
  const row = [
    lead.id,
    new Date(lead.fecha).toLocaleString(),
    lead.nombre,
    lead.apellido,
    lead.whatsapp,
    lead.email,
    lead.interes,
    lead.marcaFavorita || 'Todas las marcas',
    colName,
    lead.probabilidadConversion ?? 40,
    lead.valorEstimado ?? 30,
    (lead.etiquetas || []).join(', '),
    lead.notasPrivadas || '',
    lead.ultimoContacto ? new Date(lead.ultimoContacto).toLocaleString() : '',
    lead.canalUltimoContacto || '',
    lead.mensaje || ''
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error al añadir lead en Google Sheets: ${res.statusText}`);
  }
}

/**
 * Reads Leads and Columns back from Google Sheets to sync changes made inside the spreadsheet
 */
export async function pullDataFromSheets(
  accessToken: string,
  spreadsheetId: string,
  existingColumns: KanbanColumn[]
): Promise<{ leads: Lead[]; columns?: KanbanColumn[] }> {
  // Read Leads tab
  const leadsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A2:P`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!leadsRes.ok) {
    throw new Error('No se pudo leer la hoja Leads desde Google Sheets');
  }

  const leadsData = await leadsRes.json();
  const rows: any[][] = leadsData.values || [];

  const pulledLeads: Lead[] = rows
    .filter((row) => row[2] && row[4]) // must have name and whatsapp
    .map((row, idx) => {
      const colTitle = row[8] || 'Nuevos en Feria';
      const matchedCol = existingColumns.find((c) => c.title.toLowerCase() === colTitle.toLowerCase());
      const columnaId = matchedCol ? matchedCol.id : existingColumns[0]?.id || 'col_nuevos';

      const interes = (['comprar', 'vender', 'ambos'].includes(String(row[6]).toLowerCase())
        ? String(row[6]).toLowerCase()
        : 'comprar') as Lead['interes'];

      return {
        id: row[0] || 'lead_' + Date.now() + '_' + idx,
        fecha: row[1] || new Date().toISOString(),
        nombre: row[2] || '',
        apellido: row[3] || '',
        whatsapp: row[4] || '',
        email: row[5] || '',
        interes,
        marcaFavorita: row[7] || 'Todas las marcas',
        columnaId,
        probabilidadConversion: Number(row[9]) || 40,
        valorEstimado: Number(row[10]) || 30,
        etiquetas: row[11] ? String(row[11]).split(',').map((s) => s.trim()).filter(Boolean) : ['Stand Feria'],
        notasPrivadas: row[12] || '',
        ultimoContacto: row[13] || undefined,
        canalUltimoContacto: row[14] === 'whatsapp' || row[14] === 'email' ? row[14] : undefined,
        mensaje: row[15] || '',
        origen: 'Google Sheets Sincronizado',
        estado: 'en_seguimiento',
        syncedToSheets: true
      };
    });

  return { leads: pulledLeads };
}
