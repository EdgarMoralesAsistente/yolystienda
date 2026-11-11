import { Lead, KanbanColumn, ScheduledAction, ActivityLogEntry } from '../types';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'yoly_google_sheets_config';

export function getSavedSheetsConfig(): GoogleSheetsConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSheetsConfig(config: GoogleSheetsConfig | null): void {
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

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
 * Appends a newly captured lead directly to the Google Sheets without rewriting all rows
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

  await fetch(
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
        estado: 'en_seguimiento'
      };
    });

  return { leads: pulledLeads };
}
