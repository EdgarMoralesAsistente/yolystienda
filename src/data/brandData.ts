import { BrandInfo } from '../types';

export const BRANDS_DATA: BrandInfo[] = [
  {
    id: 'lbel',
    name: "L'Bel",
    tagline: 'Alta cosmética francesa y cuidado antiedad',
    description: 'Fórmulas científicas de prestigio internacional, sérums concentrados de alta tecnología y perfumería fina de la casa Symrise en París.',
    accentColor: '#69377D', // Morado elegante
    heroCategories: ['Cuidado Facial Antiedad', 'Sérums de Alta Potencia', 'Perfumería Fina de Lujo', 'Tratamientos Específicos'],
    featuredProducts: [
      { name: 'Nocturne Sérum', category: 'Tratamiento Facial', highlight: 'Sérum renovador nocturno #1 en ventas' },
      { name: 'Liasson Parfum', category: 'Alta Perfumería', highlight: 'Notas florales de iris francés y vainilla' },
      { name: 'Bio Resist Nutritiva', category: 'Cuidado Antiedad', highlight: '96% ingredientes de origen natural' },
      { name: 'Base Clarifiant FPS 30', category: 'Maquillaje Tratante', highlight: 'Cobertura impecable con acción antimanchas' }
    ]
  },
  {
    id: 'esika',
    name: 'Ésika',
    tagline: 'Maquillaje de larga duración y fragancias que enamoran',
    description: 'La marca que resalta la belleza latina con la mayor duración en color, fragancias ganadoras de premios y cuidado para toda la familia.',
    accentColor: '#BF0B57', // Fucsia principal
    heroCategories: ['Labiales Indelebles Colorfix', 'Perfumería Femenina y Masculina', 'Máscaras de Pestañas', 'Cuidado Personal Familiar'],
    featuredProducts: [
      { name: 'Colorfix 24H Duo Tattoo', category: 'Labial Indeleble', highlight: '24 horas de color sin transferir ni resecar' },
      { name: 'Red Power Parfum', category: 'Perfumería', highlight: 'Aroma oriental con flor de immortelle' },
      { name: 'Kalos Sport / Impact', category: 'Fragancia Masculina', highlight: 'Frescura intensa y fijación prolongada' },
      { name: 'Mega Full Size', category: 'Máscara de Pestañas', highlight: 'Efecto extensión de pestañas visible' }
    ]
  },
  {
    id: 'cyzone',
    name: 'Cyzone',
    tagline: 'Tendencias virales, actitud juvenil y colores vibrantes',
    description: 'Moda fresca, tonos en tendencia de TikTok, aromas juveniles irresistibles y productos prácticos para tu estilo diario al mejor precio.',
    accentColor: '#E0407D', // Rosa acento
    heroCategories: ['Maquillaje Studio Look', 'Perfumes Juveniles Populares', 'Skincare Diario Skin First', 'Billeteras y Accesorios'],
    featuredProducts: [
      { name: 'Studio Look Labial Mate', category: 'Maquillaje', highlight: 'Color mate que no se corre ni transfiere' },
      { name: 'Sweet Black Eau de Parfum', category: 'Perfume Juvenil', highlight: 'Notas dulces de pink pomelo y sándalo' },
      { name: 'Nitro para Él', category: 'Fragancia Fresca', highlight: 'Aroma fresco con tecnología de larga duración' },
      { name: 'Skin First Purificante', category: 'Limpieza Facial', highlight: 'Control de brillo y textura suave al instante' }
    ]
  }
];

export const TESTIMONIALS_DATA = [
  {
    name: 'Carolina M.',
    role: 'Emprendedora y Consultora de Ventas',
    brand: 'Equipo Yoly',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    quote: 'Empecé vendiendo solo a mis compañeras de oficina para tener un dinero extra y hoy cubro la mensualidad de mis hijos. La asesoría de Yoly desde el día 1 fue clave para perder el miedo a vender.',
    gain: '+35% comisiones mensuales'
  },
  {
    name: 'Valeria R.',
    role: 'Cliente Fiel',
    brand: 'Clienta L\'Bel y Ésika',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    quote: 'Conocí a Yoly en un evento y me recomendó el sérum Nocturne de L\'Bel. Mi piel cambió por completo en 2 semanas. Siempre me avisa las promociones antes de que se agoten.',
    gain: 'Ahorro del 30% en catálogo'
  },
  {
    name: 'Mariana S.',
    role: 'Mamá y Consultora Independiente',
    brand: 'Equipo Yoly',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    quote: 'No tenía tiempo por cuidar a mi bebé. Con el catálogo digital en WhatsApp vendo mientras estoy en casa. En mi primer mes me gané además un juego de sartenes de premio.',
    gain: 'Horario 100% propio'
  }
];

export const FAQ_DATA = [
  {
    question: '¿Tengo que pagar algo para inscribirme como vendedora?',
    answer: 'No pagas ninguna cuota de inscripción. Al registrarte adquieres tu Kit de Inicio a un precio sumamente accesible y subsidiado, el cual contiene productos de alta rotación que puedes vender de inmediato para recuperar tu inversión y obtener ganancia desde tu primera semana.'
  },
  {
    question: '¿Qué porcentaje de ganancia obtengo vendiendo los productos?',
    answer: 'Tus ganancias van desde un 25% hasta un 40% sobre el precio de catálogo, dependiendo del monto de tus pedidos y campañas. Además, ganas productos de regalo que puedes revender al 100% de ganancia pura y premios por acumulación de puntos (electrodomésticos, tecnología, etc.).'
  },
  {
    question: '¿Puedo comprar solo para consumo personal sin vender?',
    answer: '¡Por supuesto! Si solo deseas comprar, puedes dejar tus datos para que te envíe los catálogos digitales vigentes con descuentos especiales de feria, asesoría personalizada de tono de piel y fragancias, y promociones 2x1.'
  },
  {
    question: '¿Cómo funciona la venta por catálogo digital?',
    answer: 'Hoy en día no necesitas salir de casa cargando catálogos pesados. Recibes un enlace interactivo personalizado que puedes compartir por WhatsApp, Instagram o Facebook. Tus clientes eligen sus productos y te llega la lista armada directamente a tu chat.'
  },
  {
    question: 'No tengo experiencia en ventas, ¿alguien me enseña?',
    answer: '¡Cuentas conmigo! Yo (Yoly) seré tu líder y mentora directa. Te enseñaré cómo presentar los productos, qué ofrecer a cada tipo de cliente, cómo cobrar y cómo maximizar tus ganancias en cada campaña.'
  }
];

export const FAIR_BENEFITS = [
  {
    title: 'Descuento Exclusivo de Feria',
    description: 'Accede a ofertas especiales y regalos sorpresa por tu registro presencial o en línea hoy.',
    icon: 'Sparkles'
  },
  {
    title: 'Catálogo Digital Inmediato',
    description: 'Recibe en tu WhatsApp los 3 catálogos virtuales interactivos sin ocupar espacio en tu celular.',
    icon: 'Smartphone'
  },
  {
    title: 'Capacitación Personalizada',
    description: 'Acompañamiento 1 a 1 de Yoly para que inicies con paso firme y resultados reales.',
    icon: 'GraduationCap'
  },
  {
    title: 'Garantía de Satisfacción Belcorp',
    description: 'Productos respaldados por estándares de calidad internacional en dermatología y perfumería.',
    icon: 'ShieldCheck'
  }
];
