import { CRMTemplate } from '../types';

export const DEFAULT_CRM_TEMPLATES: CRMTemplate[] = [
  {
    id: 'tpl_comprar_1',
    titulo: '🛍️ Bienvenida y Envío de Catálogo Digital (Comprar)',
    tipo: 'ambos',
    asunto: '¡Hola {nombre}! Aquí tienes tus catálogos de L\'Bel, Ésika y Cyzone 💄✨',
    categoria: 'comprar',
    contenido: `¡Hola {nombre}! Qué gusto saludarte. Te saluda Yoly, de la Feria de Emprendimiento.

Vi que estás interesada en conocer y adquirir productos de belleza de nuestras marcas líderes: L'Bel, Ésika y Cyzone.

Con mucho gusto te comparto los catálogos digitales interactivos vigentes:
✨ Catálogo L'Bel (Alta cosmética & cuidado antiedad)
✨ Catálogo Ésika (Maquillaje de alta duración y fragancias)
✨ Catálogo Cyzone (Tendencias juveniles y Studio Look)

Además, por haber dejado tus datos en la feria, tienes un descuento especial y regalito sorpresa en tu primer pedido.

Cuéntame qué productos estás buscando o si deseas asesoría personalizada para tu tipo de piel o elección de perfume. ¡Estoy a tus órdenes!`
  },
  {
    id: 'tpl_vender_1',
    titulo: '💼 Oportunidad de Negocio y Kit de Inicio (Vender)',
    tipo: 'ambos',
    asunto: '¡{nombre}, emprende tu negocio de belleza con L\'Bel, Ésika y Cyzone! 🌟',
    categoria: 'vender',
    contenido: `¡Hola {nombre}! Qué alegría saludarte. Te escribe Yoly de la Feria de Emprendimiento.

Me encantó ver tu interés en unirte a nuestro equipo de ventas para generar ingresos extra independientes. 

Trabajar con nosotros te da increíbles ventajas:
✅ Ganancias entre 25% y 40% sobre cada venta.
✅ 3 marcas prestigiosas (L'Bel, Ésika y Cyzone) en un solo pedido.
✅ Manejas tu tiempo 100% libre desde tu móvil o desde casa.
✅ Kit de inicio a un costo mínimo que recuperas con la primera venta.
✅ Premios de campaña (electrodomésticos, bonos y productos de regalo).
✅ Y lo más importante: yo te capacitaré y acompañaré paso a paso.

¿Tienes 5 minutos hoy o mañana para que te explique cómo recibir tu kit de inicio y hacer tu primera venta sin complicaciones?`
  },
  {
    id: 'tpl_ambos_1',
    titulo: '✨ Oportunidad Doble: Descuento Personal + Ventas (Ambos)',
    tipo: 'ambos',
    asunto: '¡{nombre}, compra con descuento mayorista y gana dinero extra! 💎',
    categoria: 'ambos',
    contenido: `¡Hola {nombre}! Te saluda Yoly de la Feria de Emprendimiento.

Noté que te interesan ambas opciones: disfrutar de los productos de belleza y al mismo tiempo generar ingresos extras. ¡Es la mejor decisión!

Al registrarte como consultora:
1. Compras todos tus productos personales de L'Bel, Ésika y Cyzone con hasta 40% de descuento.
2. Cada vez que una amiga, familiar o compañera te pida algo, ganas comisión directa.

Te comparto el catálogo digital y los detalles para iniciar. ¿Cuándo te viene bien una llamada breve para resolver tus dudas?`
  },
  {
    id: 'tpl_seguimiento_1',
    titulo: '📋 Seguimiento Amable y Dudas',
    tipo: 'ambos',
    asunto: '¡Hola {nombre}! ¿Pudiste revisar el catálogo? 🌸',
    categoria: 'seguimiento',
    contenido: `¡Hola {nombre}! Espero que estés teniendo una excelente semana. 

Paso a saludarte y saber si pudiste revisar los catálogos digitales que te compartí. 

Estamos por cerrar pedidos de la campaña actual y quería asegurarme de que no te quedes sin tus favoritos ni sin las promociones especiales de feria.

¿Tienes alguna duda o te ayudo a seleccionar el tono o producto ideal? ¡Quedo muy atenta!`
  },
  {
    id: 'tpl_promo_feria',
    titulo: '🎁 Oferta Especial Exclusiva de Feria',
    tipo: 'ambos',
    asunto: '¡Últimos días de beneficio exclusivo de Feria para ti, {nombre}! 🎉',
    categoria: 'general',
    contenido: `¡Hola {nombre}! Te saluda Yoly nuevamente.

Quería recordarte que tu beneficio especial por registrarte en la Feria de Emprendimiento sigue activo por tiempo limitado.

Ya sea que decidas hacer tu primer pedido de productos o ingresar a nuestro equipo con el Kit de Inicio, te incluiré una muestra de alta perfumería de regalo de mi parte.

¿Te gustaría que coordinemos hoy mismo?`
  }
];
