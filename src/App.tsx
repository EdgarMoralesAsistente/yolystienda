import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { FlyerModal } from './components/FlyerModal';
import { LeadsManagerModal } from './components/LeadsManagerModal';
import { CRMAdminPanel } from './components/CRMAdminPanel';
import { CRMLoginView } from './components/CRMLoginView';
import { CRMLeadDetailModal } from './components/CRMLeadDetailModal';
import { CRMContactModal } from './components/CRMContactModal';
import { CRMLeadEditModal } from './components/CRMLeadEditModal';
import { CRMTemplateManagerModal } from './components/CRMTemplateManagerModal';
import { CRMGoogleSheetsModal } from './components/CRMGoogleSheetsModal';
import { CRMAccessManagerModal } from './components/CRMAccessManagerModal';
import { Lead, LeadInterest, LeadStatus, CRMTemplate, KanbanColumn } from './types';
import { DEFAULT_CRM_TEMPLATES } from './data/crmTemplates';
import { DEFAULT_KANBAN_COLUMNS } from './data/kanbanData';
import { initAuth, logout, getAccessToken } from './lib/googleAuth';
import { GoogleSheetsConfig, getSavedSheetsConfig, appendLeadToSheets } from './lib/googleSheetsService';
import { User } from 'firebase/auth';

const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: 'demo_1',
    nombre: 'Gabriela',
    apellido: 'Torres',
    whatsapp: '+51 987 112 334',
    email: 'gabriela.torres@gmail.com',
    interes: 'vender',
    marcaFavorita: 'Todas las marcas',
    mensaje: 'Hablé contigo en el stand sobre el kit de inicio de Ésika y Cyzone.',
    fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
    origen: 'Feria de Emprendimiento',
    estado: 'en_seguimiento',
    columnaId: 'col_negociacion',
    probabilidadConversion: 80,
    valorEstimado: 120,
    etiquetas: ['Stand Feria', 'Prioridad Alta', 'Interesada en Kit'],
    notasPrivadas: 'Desea saber fecha de cierre de campaña. Llamar por la tarde.',
    ultimoContacto: new Date(Date.now() - 3600000 * 1).toISOString(),
    canalUltimoContacto: 'whatsapp',
    accionesProgramadas: [
      {
        id: 'task_1',
        titulo: 'Llamar para confirmar inscripción en campaña',
        fechaProgramada: new Date(Date.now() + 3600000 * 24).toISOString(),
        tipo: 'llamada',
        completada: false
      }
    ],
    historialAcciones: [
      {
        id: 'h_1',
        fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
        tipo: 'registro',
        descripcion: 'Lead registrado en el stand de la feria.'
      },
      {
        id: 'h_2',
        fecha: new Date(Date.now() - 3600000 * 1).toISOString(),
        tipo: 'whatsapp',
        descripcion: 'Plantilla de bienvenida para consultora enviada por WhatsApp.'
      }
    ]
  },
  {
    id: 'demo_2',
    nombre: 'Patricia',
    apellido: 'Mendoza',
    whatsapp: '+51 991 445 667',
    email: 'patricia.mendoza@hotmail.com',
    interes: 'comprar',
    marcaFavorita: "L'Bel",
    mensaje: 'Quiero el catálogo digital para pedir el sérum Nocturne y una crema de ojos.',
    fecha: new Date(Date.now() - 3600000 * 5).toISOString(),
    origen: 'Feria de Emprendimiento',
    estado: 'contactado',
    columnaId: 'col_catalogo',
    probabilidadConversion: 65,
    valorEstimado: 45,
    etiquetas: ['Stand Feria', 'Comprar Sérum', 'Piel Seca/Manchas'],
    notasPrivadas: 'Busca productos para líneas de expresión.',
    ultimoContacto: new Date(Date.now() - 3600000 * 3).toISOString(),
    canalUltimoContacto: 'whatsapp',
    accionesProgramadas: [
      {
        id: 'task_2',
        titulo: 'Enviar muestras de la crema Nocturne',
        fechaProgramada: new Date(Date.now() + 3600000 * 48).toISOString(),
        tipo: 'entrega',
        completada: false
      }
    ],
    historialAcciones: [
      {
        id: 'h_3',
        fecha: new Date(Date.now() - 3600000 * 5).toISOString(),
        tipo: 'registro',
        descripcion: 'Lead registrado en la feria.'
      },
      {
        id: 'h_4',
        fecha: new Date(Date.now() - 3600000 * 3).toISOString(),
        tipo: 'whatsapp',
        descripcion: 'Catálogo virtual enviado por WhatsApp.'
      }
    ]
  },
  {
    id: 'demo_3',
    nombre: 'Luciana',
    apellido: 'Vega',
    whatsapp: '+51 976 554 321',
    email: 'luciana.vega@gmail.com',
    interes: 'ambos',
    marcaFavorita: 'Cyzone',
    mensaje: 'Me gustan los labiales Studio Look y quiero venderlos en mi universidad.',
    fecha: new Date(Date.now() - 3600000 * 8).toISOString(),
    origen: 'Feria de Emprendimiento',
    estado: 'nuevo',
    columnaId: 'col_nuevos',
    probabilidadConversion: 50,
    valorEstimado: 60,
    etiquetas: ['Stand Feria', 'Joven Emprendedora'],
    accionesProgramadas: [
      {
        id: 'task_3',
        titulo: 'Llamar para coordinar pedido de labiales Studio Look',
        fechaProgramada: new Date(Date.now() + 3600000 * 2).toISOString(),
        tipo: 'llamada',
        completada: false
      }
    ],
    historialAcciones: [
      {
        id: 'h_5',
        fecha: new Date(Date.now() - 3600000 * 8).toISOString(),
        tipo: 'registro',
        descripcion: 'Lead registrado en la feria de emprendimiento.'
      }
    ]
  },
  {
    id: 'demo_4',
    nombre: 'Carla',
    apellido: 'Rios',
    whatsapp: '+51 983 221 445',
    email: 'carla.rios@yahoo.com',
    interes: 'vender',
    marcaFavorita: 'Ésika',
    mensaje: 'Ya vendí por catálogo antes y quiero reactivarme en Belcorp.',
    fecha: new Date(Date.now() - 3600000 * 20).toISOString(),
    origen: 'Feria de Emprendimiento',
    estado: 'cliente',
    columnaId: 'col_ganados',
    probabilidadConversion: 100,
    valorEstimado: 200,
    etiquetas: ['Stand Feria', 'Consultora Activa', 'Experiencia Previa'],
    accionesProgramadas: [
      {
        id: 'task_4',
        titulo: 'Confirmar recepción del catálogo Ésika y kit',
        fechaProgramada: new Date(Date.now() - 3600000 * 36).toISOString(),
        tipo: 'whatsapp',
        completada: false
      }
    ],
    historialAcciones: [
      {
        id: 'h_6',
        fecha: new Date(Date.now() - 3600000 * 20).toISOString(),
        tipo: 'registro',
        descripcion: 'Contacto registrado en feria.'
      },
      {
        id: 'h_7',
        fecha: new Date(Date.now() - 3600000 * 4).toISOString(),
        tipo: 'cambio_columna',
        descripcion: 'Inscripción confirmada. Pasó a Cierre Exitoso.'
      }
    ]
  }
];

export default function App() {
  // Navigation view: 'landing' or 'admin'
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');

  // Google Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Kanban Columns state
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    try {
      const saved = localStorage.getItem('yoly_crm_columns');
      if (saved) return JSON.parse(saved);
      return DEFAULT_KANBAN_COLUMNS;
    } catch {
      return DEFAULT_KANBAN_COLUMNS;
    }
  });

  // Leads state
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('yoly_fair_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_DEMO_LEADS;
    } catch {
      return INITIAL_DEMO_LEADS;
    }
  });

  // Templates state
  const [templates, setTemplates] = useState<CRMTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('yoly_crm_templates');
      if (saved) return JSON.parse(saved);
      return DEFAULT_CRM_TEMPLATES;
    } catch {
      return DEFAULT_CRM_TEMPLATES;
    }
  });

  // Landing form & modal states
  const [formInterest, setFormInterest] = useState<LeadInterest>('comprar');
  const [formBrand, setFormBrand] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);

  // CRM Modals state
  const [activeDetailLead, setActiveDetailLead] = useState<Lead | null>(null);
  const [activeContactLead, setActiveContactLead] = useState<Lead | null>(null);
  const [activeEditLead, setActiveEditLead] = useState<Lead | null>(null);
  const [initialColumnForNewLead, setInitialColumnForNewLead] = useState<string>('col_nuevos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  // Google Sheets Backend state
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig | null>(() => getSavedSheetsConfig());
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync columns to storage
  useEffect(() => {
    try {
      localStorage.setItem('yoly_crm_columns', JSON.stringify(columns));
    } catch (e) {
      console.error('Error saving columns', e);
    }
  }, [columns]);

  // Sync leads to storage
  useEffect(() => {
    try {
      localStorage.setItem('yoly_fair_leads', JSON.stringify(leads));
    } catch (e) {
      console.error('Error saving leads', e);
    }
  }, [leads]);

  // Sync templates to storage
  useEffect(() => {
    try {
      localStorage.setItem('yoly_crm_templates', JSON.stringify(templates));
    } catch (e) {
      console.error('Error saving templates', e);
    }
  }, [templates]);

  // Public Landing Scroll Helper
  const scrollToForm = (interest?: LeadInterest, brand?: string, notes?: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
    }
    if (interest) setFormInterest(interest);
    if (brand) setFormBrand(brand);
    if (notes) setFormNotes(notes);

    setTimeout(() => {
      const formElement = document.getElementById('contacto');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const input = document.getElementById('nombre');
          if (input) input.focus();
        }, 500);
      }
    }, 100);
  };

  // Lead Actions
  const handleLeadAdded = (newLead: Lead) => {
    // Ensure lead has default Kanban column and initial probability
    const fullLead: Lead = {
      ...newLead,
      columnaId: columns[0]?.id || 'col_nuevos',
      probabilidadConversion: newLead.interes === 'ambos' ? 60 : 45,
      valorEstimado: newLead.interes === 'vender' ? 100 : 35,
      historialAcciones: [
        {
          id: 'log_' + Date.now(),
          fecha: new Date().toISOString(),
          tipo: 'registro',
          descripcion: `Lead registrado desde ${newLead.origen || 'Landing Page de Feria'}`
        }
      ]
    };
    setLeads((prev) => [fullLead, ...prev]);

    // Background append to Google Sheets if connected
    const token = getAccessToken();
    if (sheetsConfig && token) {
      appendLeadToSheets(token, sheetsConfig.spreadsheetId, fullLead, columns).catch((err) =>
        console.warn('Auto-sync to Google Sheets failed:', err)
      );
    }
  };

  const handleLeadsUpdatedFromSheets = (pulledLeads: Lead[]) => {
    setLeads(pulledLeads);
  };

  const handleSaveLead = (savedLead: Lead) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === savedLead.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLead.id ? savedLead : l));
      }
      return [savedLead, ...prev];
    });

    // If currently opened in detail modal, update activeDetailLead too
    if (activeDetailLead?.id === savedLead.id) {
      setActiveDetailLead(savedLead);
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (activeDetailLead?.id === id) {
      setActiveDetailLead(null);
    }
  };

  const handleUpdateLeadStatus = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, estado: newStatus } : l))
    );
  };

  // Kanban Movement Action
  const handleMoveLeadToColumn = (leadId: string, targetColumnId: string) => {
    const targetCol = columns.find((c) => c.id === targetColumnId);
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const newHistory = [
            {
              id: 'log_' + Date.now(),
              fecha: new Date().toISOString(),
              tipo: 'cambio_columna' as const,
              descripcion: `Movido a columna: "${targetCol?.title || targetColumnId}"`,
              usuario: currentUser?.displayName || currentUser?.email || 'Yoly'
            },
            ...(l.historialAcciones || [])
          ];

          return {
            ...l,
            columnaId: targetColumnId,
            historialAcciones: newHistory
          };
        }
        return l;
      })
    );
  };

  // Column CRUD Handlers
  const handleAddColumn = (title: string, color: string) => {
    const newCol: KanbanColumn = {
      id: 'col_' + Date.now(),
      title,
      color
    };
    setColumns((prev) => [...prev, newCol]);
  };

  const handleEditColumn = (columnId: string, title: string, color: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, title, color } : c))
    );
  };

  const handleDeleteColumn = (columnId: string) => {
    // Fallback to first remaining column for any leads
    const remainingCols = columns.filter((c) => c.id !== columnId);
    const fallbackColId = remainingCols[0]?.id || 'col_nuevos';

    setLeads((prev) =>
      prev.map((l) => (l.columnaId === columnId ? { ...l, columnaId: fallbackColId } : l))
    );
    setColumns(remainingCols);
  };

  const handleQuickAddTag = (id: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const currentTags = l.etiquetas || [];
          if (!currentTags.includes(tag)) {
            return { ...l, etiquetas: [...currentTags, tag] };
          }
        }
        return l;
      })
    );
  };

  const handleRemoveTag = (id: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          return { ...l, etiquetas: (l.etiquetas || []).filter((t) => t !== tag) };
        }
        return l;
      })
    );
  };

  const handleLeadContacted = (leadId: string, channel: 'whatsapp' | 'email') => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            estado: l.estado === 'nuevo' ? 'contactado' : l.estado,
            ultimoContacto: new Date().toISOString(),
            canalUltimoContacto: channel
          };
        }
        return l;
      })
    );
  };

  // Template Actions
  const handleSaveTemplate = (tpl: CRMTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === tpl.id);
      if (exists) {
        return prev.map((t) => (t.id === tpl.id ? tpl : t));
      }
      return [tpl, ...prev];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  // If in CRM Admin mode
  if (currentView === 'admin') {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[#FAF8FB] font-['Montserrat',sans-serif]">
          <CRMLoginView
            onLoginSuccess={(user) => {
              setCurrentUser(user);
            }}
            onBackToLanding={() => setCurrentView('landing')}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8FB] font-['Montserrat',sans-serif]">
        <CRMAdminPanel
          currentUser={currentUser}
          onLogout={handleLogout}
          onBackToLanding={() => setCurrentView('landing')}
          leads={leads}
          columns={columns}
          templates={templates}
          sheetsConfig={sheetsConfig}
          onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
          onOpenAccessManager={() => setIsAccessModalOpen(true)}
          onOpenLeadDetail={(lead) => setActiveDetailLead(lead)}
          onOpenEditModal={(lead, initialColId) => {
            setActiveEditLead(lead);
            setInitialColumnForNewLead(initialColId || columns[0]?.id || 'col_nuevos');
            setIsEditModalOpen(true);
          }}
          onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
          onDeleteLead={handleDeleteLead}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onMoveLeadToColumn={handleMoveLeadToColumn}
          onAddColumn={handleAddColumn}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
          onQuickAddTag={handleQuickAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Google Sheets Backend Sync Modal */}
        <CRMGoogleSheetsModal
          isOpen={isGoogleSheetsModalOpen}
          onClose={() => setIsGoogleSheetsModalOpen(false)}
          sheetsConfig={sheetsConfig}
          onConfigChange={setSheetsConfig}
          leads={leads}
          columns={columns}
          onLeadsUpdatedFromSheets={handleLeadsUpdatedFromSheets}
          currentUser={currentUser}
        />

        {/* Access & Collaborators Manager Modal */}
        <CRMAccessManagerModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          currentUser={currentUser}
          sheetsConfig={sheetsConfig}
        />

        {/* Ficha Integral Modal (The comprehensive Lead Sheet requested) */}
        <CRMLeadDetailModal
          isOpen={Boolean(activeDetailLead)}
          onClose={() => setActiveDetailLead(null)}
          lead={activeDetailLead}
          columns={columns}
          templates={templates}
          currentUser={currentUser}
          onSaveLead={handleSaveLead}
          onDeleteLead={handleDeleteLead}
        />

        {/* Quick Contact Modal (WhatsApp & Gmail Templates direct) */}
        <CRMContactModal
          isOpen={Boolean(activeContactLead)}
          onClose={() => setActiveContactLead(null)}
          lead={activeContactLead}
          templates={templates}
          currentUser={currentUser}
          onLeadContacted={handleLeadContacted}
        />

        {/* Lead Edit / Create Modal */}
        <CRMLeadEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setActiveEditLead(null);
          }}
          leadToEdit={activeEditLead}
          initialColumnId={initialColumnForNewLead}
          onSaveLead={handleSaveLead}
        />

        {/* Template Manager Modal */}
        <CRMTemplateManagerModal
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      </div>
    );
  }

  // Otherwise: Public Direct Landing View (with very little scroll)
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FB] text-[#120F13] font-['Montserrat',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onScrollToForm={(interest) => scrollToForm(interest || 'comprar')}
        onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        onGoToAdmin={() => setCurrentView('admin')}
        leadsCount={leads.length}
        isLoggedIn={Boolean(currentUser)}
      />

      {/* Main Content: Ultra-direct with very little scroll */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* 1. Hero Section with authentic flyer */}
        <Hero
          onScrollToForm={(interest) => scrollToForm(interest || 'comprar')}
          onOpenFlyerModal={() => setIsFlyerModalOpen(true)}
        />

        {/* 2. Direct Lead Capture Form */}
        <LeadCaptureForm
          initialInterest={formInterest}
          initialBrand={formBrand}
          initialNotes={formNotes}
          onLeadAdded={handleLeadAdded}
        />
      </main>

      {/* Full-view Flyer Modal */}
      <FlyerModal
        isOpen={isFlyerModalOpen}
        onClose={() => setIsFlyerModalOpen(false)}
        onGoToForm={() => scrollToForm('comprar')}
      />

      {/* Quick Fair Lead View Modal */}
      <LeadsManagerModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        leads={leads}
        onDeleteLead={handleDeleteLead}
        onClearAll={() => setLeads([])}
      />
    </div>
  );
}
