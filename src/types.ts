export type LeadInterest = 'comprar' | 'vender' | 'ambos';

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'en_seguimiento'
  | 'cliente'
  | 'consultora'
  | 'descartado';

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
  etiquetas?: string[];
  notasPrivadas?: string;
  ultimoContacto?: string;
  canalUltimoContacto?: 'whatsapp' | 'email';
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
