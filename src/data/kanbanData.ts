import { KanbanColumn } from '../types';

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'col_nuevos',
    title: 'Nuevos en Feria',
    color: '#F59E0B' // Amber
  },
  {
    id: 'col_contactados',
    title: 'Primer Contacto',
    color: '#0284C7' // Sky Blue
  },
  {
    id: 'col_catalogo',
    title: 'Catálogo Enviado',
    color: '#69377D' // Brand Purple
  },
  {
    id: 'col_negociacion',
    title: 'En Seguimiento / Dudas',
    color: '#E0407D' // Brand Accent Pink
  },
  {
    id: 'col_ganados',
    title: 'Cierre Exitoso',
    color: '#10B981' // Emerald
  }
];

export const COLUMN_COLOR_OPTIONS = [
  { name: 'Ámbar', hex: '#F59E0B' },
  { name: 'Azul', hex: '#0284C7' },
  { name: 'Morado Belcorp', hex: '#69377D' },
  { name: 'Rosa Acento', hex: '#E0407D' },
  { name: 'Fucsia Principal', hex: '#BF0B57' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Índigo', hex: '#4F46E5' },
  { name: 'Gris Neutro', hex: '#64748B' }
];
