export type LeadInterest = 'comprar' | 'vender' | 'ambos';

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'en_seguimiento'
  | 'cliente'
  | 'consultora'
  | 'descartado';

export interface ActivityLogEntry {
  id: string;
  fecha: string;
  tipo: 'registro' | 'whatsapp' | 'email' | 'cambio_columna' | 'nota' | 'tarea' | 'probabilidad';
  descripcion: string;
  usuario?: string;
}

export interface ScheduledAction {
  id: string;
  tipo: 'llamada' | 'whatsapp' | 'email' | 'reunion' | 'entrega' | 'otro';
  titulo: string;
  fechaProgramada: string; // ISO string
  completada: boolean;
  notas?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export interface Lead {
  id: string;
  nombre: string;
  apellido: string;
  whatsapp: string;
  email: string;
  interes: LeadInterest;
  marcaFavorita?: string;
  mensaje?: string;
  fecha: string;
  origen: string;
  estado: LeadStatus;
  columnaId?: string; // ID of the Kanban column
  probabilidadConversion?: number; // 0 to 100 %
  valorEstimado?: number; // in USD or local currency
  etiquetas?: string[];
  notasPrivadas?: string;
  ultimoContacto?: string;
  canalUltimoContacto?: 'whatsapp' | 'email';
  historialAcciones?: ActivityLogEntry[];
  accionesProgramadas?: ScheduledAction[];
}

export interface CRMTemplate {
  id: string;
  titulo: string;
  tipo: 'whatsapp' | 'email' | 'ambos';
  asunto?: string;
  contenido: string;
  categoria: 'comprar' | 'vender' | 'ambos' | 'general' | 'seguimiento';
}

export interface BrandInfo {
  id: 'lbel' | 'esika' | 'cyzone';
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  heroCategories: string[];
  featuredProducts: {
    name: string;
    category: string;
    highlight: string;
  }[];
}
