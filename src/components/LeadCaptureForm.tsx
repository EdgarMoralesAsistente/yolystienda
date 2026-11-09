import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Sparkles, Shield, User, Phone, Mail, ShoppingBag, TrendingUp, Gift } from 'lucide-react';
import { Lead, LeadInterest } from '../types';

interface LeadCaptureFormProps {
  initialInterest?: LeadInterest;
  initialBrand?: string;
  initialNotes?: string;
  onLeadAdded: (lead: Lead) => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  initialInterest = 'comprar',
  initialBrand = '',
  initialNotes = '',
  onLeadAdded
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [interes, setInteres] = useState<LeadInterest>(initialInterest);
  const [marcaFavorita, setMarcaFavorita] = useState(initialBrand || 'Todas las marcas');
  const [mensaje, setMensaje] = useState(initialNotes);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  // Sync props if changed from external clicks
  React.useEffect(() => {
    if (initialInterest) setInteres(initialInterest);
  }, [initialInterest]);

  React.useEffect(() => {
    if (initialBrand) setMarcaFavorita(initialBrand);
  }, [initialBrand]);

  React.useEffect(() => {
    if (initialNotes) setMensaje(initialNotes);
  }, [initialNotes]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = 'Por favor ingresa tu nombre';
    if (!apellido.trim()) errs.apellido = 'Por favor ingresa tu apellido';
    
    // Clean whatsapp digits
    const cleanedPhone = whatsapp.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 7) {
      errs.whatsapp = 'Ingresa un número de WhatsApp válido (mínimo 7 dígitos)';
    }

    if (!email.trim()) {
      errs.email = 'Por favor ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Ingresa un correo electrónico válido';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newLead: Lead = {
      id: 'lead_' + Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      interes,
      marcaFavorita,
      mensaje: mensaje.trim(),
      fecha: new Date().toISOString(),
      origen: 'Feria de Emprendimiento',
      estado: 'nuevo'
    };

    onLeadAdded(newLead);
    setSubmittedLead(newLead);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setNombre('');
    setApellido('');
    setWhatsapp('');
    setEmail('');
    setInteres('comprar');
    setMarcaFavorita('Todas las marcas');
    setMensaje('');
    setErrors({});
    setIsSubmitted(false);
    setSubmittedLead(null);
  };

  // Generate friendly WhatsApp message link for direct contact
  const getWhatsAppLink = (lead: Lead) => {
    const interestText =
      lead.interes === 'comprar'
        ? 'comprar productos de belleza'
        : lead.interes === 'vender'
        ? 'unirme a tu equipo de ventas y generar ingresos extras'
        : 'tanto comprar productos como vender y generar ingresos extras';

    const text = encodeURIComponent(
      `¡Hola Yoly! Estuve en la Feria de Emprendimiento.\n\n` +
      `Mi nombre es ${lead.nombre} ${lead.apellido}.\n` +
      `Me interesa: ${interestText}.\n` +
      `Marca de interés: ${lead.marcaFavorita || 'Todas'}.\n` +
      `Mi email es: ${lead.email}.\n` +
      (lead.mensaje ? `Nota: ${lead.mensaje}\n\n` : '\n') +
      `¡Quedo a la espera de tu respuesta y del catálogo!`
    );

    // Default to general WhatsApp link (user can replace phone or open directly)
    return `https://wa.me/?text=${text}`;
  };

  return (
    <section id="contacto" className="pt-2 pb-10 md:pt-4 md:pb-14 bg-[#FAF8FB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5EC] text-[#69377D] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#BF0B57]" />
            Formulario Oficial de la Feria
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#120F13] tracking-tight">
            Déjanos tus datos
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Recibe el catálogo digital con descuentos de feria o información para unirte al equipo de ventas.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE5EC] shadow-md">
          {isSubmitted && submittedLead ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  ¡Gracias, {submittedLead.nombre}!
                </h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Tus datos han quedado registrados correctamente. Yoly se pondrá en contacto contigo muy pronto.
                </p>
              </div>

              {/* Lead Summary Card */}
              <div className="bg-[#FAF8FB] p-5 rounded-2xl border border-[#EAE5EC] max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nombre completo:</span>
                  <span className="font-semibold text-slate-900">{submittedLead.nombre} {submittedLead.apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-semibold text-slate-900">{submittedLead.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900">{submittedLead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interés seleccionado:</span>
                  <span className="font-bold text-[#BF0B57] capitalize">
                    {submittedLead.interes === 'comprar' ? 'Comprar productos' : submittedLead.interes === 'vender' ? 'Vender y generar ingresos' : 'Ambos (Comprar y Vender)'}
                  </span>
                </div>
              </div>

              {/* Fast WhatsApp Handoff Action */}
              <div className="space-y-3 max-w-md mx-auto pt-2">
                <p className="text-xs font-semibold text-[#69377D]">
                  ¿Quieres respuesta inmediata aquí en la feria?
                </p>
                <a
                  href={getWhatsAppLink(submittedLead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar mensaje a Yoly por WhatsApp ahora</span>
                </a>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer pt-2 block mx-auto"
                >
                  Registrar otro contacto o reiniciar formulario
                </button>
              </div>
            </div>
          ) : (
            /* Lead Capture Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Radio Group for Interest: Comprar, Vender, Ambos */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  ¿Qué te interesa principalmente? <span className="text-[#BF0B57]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Comprar */}
                  <label
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      interes === 'comprar'
                        ? 'border-[#BF0B57] bg-[#BF0B57]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interes"
                      value="comprar"
                      checked={interes === 'comprar'}
                      onChange={() => setInteres('comprar')}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        interes === 'comprar'
                          ? 'bg-[#BF0B57] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Comprar</div>
                      <div className="text-[11px] text-slate-500">Catálogo y ofertas</div>
                    </div>
                  </label>

                  {/* Vender */}
                  <label
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      interes === 'vender'
                        ? 'border-[#BF0B57] bg-[#BF0B57]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interes"
                      value="vender"
                      checked={interes === 'vender'}
                      onChange={() => setInteres('vender')}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        interes === 'vender'
                          ? 'bg-[#BF0B57] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Vender</div>
                      <div className="text-[11px] text-slate-500">Ingresos extras</div>
                    </div>
                  </label>

                  {/* Ambos */}
                  <label
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      interes === 'ambos'
                        ? 'border-[#BF0B57] bg-[#BF0B57]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interes"
                      value="ambos"
                      checked={interes === 'ambos'}
                      onChange={() => setInteres('ambos')}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        interes === 'ambos'
                          ? 'bg-[#BF0B57] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Ambos</div>
                      <div className="text-[11px] text-slate-500">Consumo y negocio</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name & Surname grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nombre <span className="text-[#BF0B57]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Ej. María"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-[#FAF8FB] focus:bg-white focus:outline-none transition-colors ${
                        errors.nombre ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#BF0B57]'
                      }`}
                    />
                  </div>
                  {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Apellido <span className="text-[#BF0B57]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="apellido"
                      type="text"
                      placeholder="Ej. González"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-[#FAF8FB] focus:bg-white focus:outline-none transition-colors ${
                        errors.apellido ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#BF0B57]'
                      }`}
                    />
                  </div>
                  {errors.apellido && <p className="text-xs text-red-500 mt-1">{errors.apellido}</p>}
                </div>
              </div>

              {/* WhatsApp & Email grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="whatsapp" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    WhatsApp (Móvil) <span className="text-[#BF0B57]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="Ej. +51 987 654 321"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-[#FAF8FB] focus:bg-white focus:outline-none transition-colors ${
                        errors.whatsapp ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#BF0B57]'
                      }`}
                    />
                  </div>
                  {errors.whatsapp ? (
                    <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>
                  ) : (
                    <p className="text-[11px] text-slate-600 mt-1">Te enviaremos el catálogo digital directamente.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Correo Electrónico <span className="text-[#BF0B57]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-[#FAF8FB] focus:bg-white focus:outline-none transition-colors ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#BF0B57]'
                      }`}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  ) : (
                    <p className="text-[11px] text-slate-600 mt-1">Para recibir novedades y confirmación.</p>
                  )}
                </div>
              </div>

              {/* Brand preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="marca" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Marca que más te llama la atención
                  </label>
                  <select
                    id="marca"
                    value={marcaFavorita}
                    onChange={(e) => setMarcaFavorita(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-[#FAF8FB] focus:bg-white focus:outline-none focus:border-[#BF0B57] transition-colors"
                  >
                    <option value="Todas las marcas">Todas las marcas (L'Bel, Ésika y Cyzone)</option>
                    <option value="L'Bel">L'Bel (Alta cosmética & antiedad)</option>
                    <option value="Ésika">Ésika (Colorfix & fragancias líderes)</option>
                    <option value="Cyzone">Cyzone (Tendencias juveniles & Studio Look)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    ¿Alguna duda o producto específico? <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    id="mensaje"
                    type="text"
                    placeholder="Ej. Busco perfume Liasson / quiero info del kit de inicio"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-[#FAF8FB] focus:bg-white focus:outline-none focus:border-[#BF0B57] transition-colors"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-[#BF0B57] hover:bg-[#a00949] shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {interes === 'comprar'
                      ? 'Enviar datos y solicitar catálogo'
                      : interes === 'vender'
                      ? 'Quiero información para unirme al equipo'
                      : 'Enviar datos para comprar y vender'}
                  </span>
                </button>
              </div>

              {/* Trust statement */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tus datos son 100% privados y solo se usan para contactarte por Yoly. Cero spam.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
