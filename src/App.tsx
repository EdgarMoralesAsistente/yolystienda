import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { Footer } from './components/Footer';
import { FlyerModal } from './components/FlyerModal';
import { LeadsManagerModal } from './components/LeadsManagerModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { CRMAdminPanel } from './components/CRMAdminPanel';
import { CRMLoginView } from './components/CRMLoginView';
import { CRMContactModal } from './components/CRMContactModal';
import { CRMLeadEditModal } from './components/CRMLeadEditModal';
import { CRMTemplateManagerModal } from './components/CRMTemplateManagerModal';
import { Lead, LeadInterest, LeadStatus, CRMTemplate } from './types';
import { DEFAULT_CRM_TEMPLATES } from './data/crmTemplates';
import { initAuth, logout } from './lib/googleAuth';
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
    etiquetas: ['Stand Feria', 'Prioridad Alta', 'Interesada en Kit'],
    notasPrivadas: 'Desea saber fecha de cierre de campaña. Llamar por la tarde.',
    ultimoContacto: new Date(Date.now() - 3600000 * 1).toISOString(),
    canalUltimoContacto: 'whatsapp'
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
    estado: 'nuevo',
    etiquetas: ['Stand Feria', 'Comprar Sérum'],
    notasPrivadas: 'Busca productos para líneas de expresión.'
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
    etiquetas: ['Stand Feria', 'Joven Emprendedora']
  }
];

export default function App() {
  // Navigation view: 'landing' or 'admin'
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');

  // Google Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('yoly_fair_leads');
      if (saved) return JSON.parse(saved);
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

  // Modals state
  const [formInterest, setFormInterest] = useState<LeadInterest>('comprar');
  const [formBrand, setFormBrand] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);

  // CRM Modals state
  const [activeContactLead, setActiveContactLead] = useState<Lead | null>(null);
  const [activeEditLead, setActiveEditLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

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
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleSaveLead = (savedLead: Lead) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === savedLead.id);
      if (exists) {
        return prev.map((l) => (l.id === savedLead.id ? savedLead : l));
      }
      return [savedLead, ...prev];
    });
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLeadStatus = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, estado: newStatus } : l))
    );
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
          templates={templates}
          onOpenEditModal={(lead) => {
            setActiveEditLead(lead);
            setIsEditModalOpen(true);
          }}
          onOpenContactModal={(lead) => {
            setActiveContactLead(lead);
          }}
          onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
          onDeleteLead={handleDeleteLead}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onQuickAddTag={handleQuickAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Contact Modal (WhatsApp & Gmail Templates) */}
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
    <div className="min-h-screen flex flex-col bg-[#FAF8FB] text-[#120F13] font-['Montserrat',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onScrollToForm={(interest) => scrollToForm(interest || 'comprar')}
        onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        onGoToAdmin={() => setCurrentView('admin')}
        leadsCount={leads.length}
        isLoggedIn={Boolean(currentUser)}
      />

      {/* Main Content: Ultra-direct with very little scroll */}
      <main className="flex-1">
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

      {/* Footer */}
      <Footer
        onOpenLeadsModal={() => setIsLeadsModalOpen(true)}
        onGoToAdmin={() => setCurrentView('admin')}
        leadsCount={leads.length}
      />

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

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}
