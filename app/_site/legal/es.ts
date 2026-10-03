import type { LegalTexts } from "./types";

export const es: LegalTexts = {
  chrome: {
    footerLabel: "Legal",
    nav: { terms: "Términos", privacy: "Privacidad", acceptableUse: "Uso aceptable", refund: "Reembolsos y saldo", contact: "Contacto" },
    effective: "Vigente desde: {date}",
    contents: "Contenido",
    translationNotice: "Esta traducción se ofrece solo como referencia. Si difiere de la [versión en inglés]({enUrl}), prevalece la versión en inglés.",
  },

  terms: {
    title: "Términos del servicio",
    description: "Términos que rigen el gateway de modelos de IA de TokenAPI, las claves de API, el saldo prepago y la facturación.",
    intro: "Estos Términos del servicio (los «Términos») rigen su acceso y uso del sitio web, la API y los servicios relacionados de TokenAPI (el «Servicio»), operados por {company} («TokenAPI», «nosotros»). Al crear una cuenta, usar una clave de API o utilizar el Servicio de cualquier otro modo, usted acepta estos Términos.",
    sections: [
      {
        h: "1. Requisitos",
        p: [
          "Debe tener al menos 18 años y capacidad para celebrar un contrato vinculante. Si utiliza el Servicio en nombre de una empresa u otra organización, declara que está autorizado para aceptar estos Términos en su nombre, y «usted» incluye a dicha organización.",
          "No puede usar el Servicio si es objeto de sanciones o se encuentra en un país o región donde la ley aplicable prohíba prestarle el Servicio. Usted es responsable de cumplir las leyes de control de exportaciones y sanciones aplicables a su uso.",
        ],
      },
      {
        h: "2. El Servicio",
        p: [
          "TokenAPI es un gateway de API que le da acceso a modelos de IA mediante identificadores de modelo estables (por ejemplo, `tokenapi-pro`). Cada identificador lo atienden uno o varios proveedores de modelos externos. Para mantener la calidad y la disponibilidad, podemos cambiar el proveedor o el modelo subyacente de un identificador, enrutar solicitudes a proveedores de respaldo, y añadir, modificar o retirar identificadores.",
          "Las respuestas de los modelos de IA se generan automáticamente. Pueden ser inexactas, incompletas u ofensivas, o parecerse a respuestas generadas para otras personas, y no representan nuestras opiniones. Usted debe evaluarlas antes de confiar en ellas.",
        ],
      },
      {
        h: "3. Cuentas y claves de API",
        p: [
          "Usted es responsable de mantener confidenciales las credenciales de su cuenta y sus claves de API, y de toda la actividad realizada con ellas. No incluya claves de API en navegadores ni en aplicaciones móviles, ni las comparta. Si cree que una clave se ha filtrado, avísenos de inmediato en {supportEmail}; podemos revocar o rotar claves para protegerle a usted o al Servicio.",
          "Debe proporcionar información de cuenta exacta y mantenerla actualizada.",
        ],
      },
      {
        h: "4. Saldo prepago, precios y facturación",
        p: [
          "El Servicio es prepago. Usted recarga un saldo en dólares estadounidenses y el uso se descuenta de ese saldo según el precio de cada modelo publicado en la página de [modelos](/models) en el momento de la solicitud. Podemos cambiar los precios del uso futuro; los cambios no afectan a las solicitudes ya completadas.",
          "Antes de procesar una solicitud, retenemos de su saldo el coste máximo posible de esa solicitud; al terminar, cobramos el uso real y liberamos el resto. No se cobran las solicitudes que fallan antes de que el modelo empiece a responder. Si una respuesta en streaming se cancela o se interrumpe, solo se cobran los tokens generados. El uso lo miden nuestros sistemas y nuestros registros sirven de base para el cobro, con sujeción al procedimiento de errores de facturación de nuestra [Política de reembolsos y saldo](/refund).",
          "Los pagos no son reembolsables y el saldo caduca tras {expiryMonths} meses sin uso ni recargas, según se describe en la [Política de reembolsos y saldo](/refund). Los precios no incluyen impuestos; usted es responsable de los impuestos aplicables a sus compras, salvo los impuestos sobre nuestros ingresos.",
        ],
      },
      {
        h: "5. Uso aceptable",
        p: [
          "Debe cumplir nuestra [Política de uso aceptable](/acceptable-use) y las políticas de uso de los proveedores de modelos que atienden sus solicitudes. Podemos bloquear solicitudes, limitar la frecuencia o suspender el acceso para prevenir abusos o proteger el Servicio.",
        ],
      },
      {
        h: "6. Su contenido",
        p: [
          "Entre usted y nosotros, usted conserva sus derechos sobre las entradas que envía y, en la medida en que lo permitan la ley y los términos del proveedor de modelos correspondiente, le pertenecen las respuestas generadas para usted. Usted es responsable de sus entradas y del uso que haga de las respuestas, incluido contar con los derechos y consentimientos necesarios para enviar cualquier dato.",
          "Usted nos concede los derechos necesarios para transmitir sus entradas a los proveedores de modelos y devolverle las respuestas, únicamente para prestar el Servicio. No almacenamos el contenido de las indicaciones ni de las respuestas; conservamos los metadatos de las solicitudes según se describe en la [Política de privacidad](/privacy). Los proveedores de modelos tratan las solicitudes conforme a sus propios términos.",
        ],
      },
      {
        h: "7. Proveedores externos",
        p: [
          "El Servicio depende de proveedores de modelos e infraestructura de terceros, cuyos términos y políticas pueden aplicarse a las solicitudes que se les envían. No somos responsables de sus servicios, interrupciones o actos, aunque cuando es posible enrutamos las solicitudes para sortear las interrupciones.",
        ],
      },
      {
        h: "8. Disponibilidad y cambios",
        p: [
          "Procuramos mantener el Servicio disponible, pero no garantizamos que funcione sin interrupciones ni errores, salvo que acordemos con usted un nivel de servicio por escrito. Podemos realizar mantenimiento y modificar, suspender o retirar funciones o identificadores de modelo. Cuando sea razonablemente posible, avisaremos con antelación de los cambios importantes.",
        ],
      },
      {
        h: "9. Suspensión y terminación",
        p: [
          "Puede dejar de usar el Servicio en cualquier momento. Podemos suspender o terminar su acceso, revocar claves de API o rechazar solicitudes si incumple estos Términos, genera riesgo o responsabilidad legal para nosotros o para terceros, no paga, presenta contracargos injustificados o si la ley lo exige. Cuando sea posible, le avisaremos con antelación.",
          "Si terminamos su cuenta por conveniencia y no por un incumplimiento suyo, le reembolsaremos el saldo no utilizado. En los demás casos, la terminación no da derecho a reembolso, salvo que la ley lo exija.",
        ],
      },
      {
        h: "10. Exclusión de garantías",
        p: [
          "En la máxima medida permitida por la ley, el Servicio y todas las respuestas se proporcionan «tal cual» y «según disponibilidad», sin garantías de ningún tipo, incluidas las de comerciabilidad, idoneidad para un fin determinado, exactitud y no infracción. Las respuestas no constituyen asesoramiento profesional, jurídico, médico ni financiero.",
        ],
      },
      {
        h: "11. Limitación de responsabilidad",
        p: [
          "En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos, ni de la pérdida de beneficios, ingresos, datos o fondo de comercio. Nuestra responsabilidad total por todas las reclamaciones relacionadas con el Servicio se limita a la mayor de estas cantidades: lo que nos pagó en los 12 meses anteriores a la reclamación o 100 USD.",
          "Nada de lo dispuesto en estos Términos limita una responsabilidad que no pueda limitarse por ley.",
        ],
      },
      {
        h: "12. Indemnización",
        p: [
          "Usted defenderá e indemnizará a {company} frente a reclamaciones, daños y gastos (incluidos honorarios razonables de abogados) derivados de sus entradas, del uso de las respuestas, del incumplimiento de estos Términos o de la Política de uso aceptable, o de la vulneración de la ley o de derechos de terceros.",
        ],
      },
      {
        h: "13. Cambios en estos Términos",
        p: [
          "Podemos actualizar estos Términos. Publicaremos la nueva versión con su fecha de entrada en vigor y le avisaremos de los cambios importantes por correo electrónico o dentro del Servicio. Si sigue usando el Servicio después de esa fecha, acepta los Términos actualizados.",
        ],
      },
      {
        h: "14. Ley aplicable y resolución de controversias",
        p: [
          "Estos Términos se rigen por las leyes del lugar en que esté establecido el operador del Servicio, sin tener en cuenta sus normas de conflicto de leyes. Antes de presentar cualquier reclamación, contacte con nosotros en [{legalEmail}](mailto:{legalEmail}) para que podamos intentar resolver la controversia de forma amistosa en un plazo de 30 días. Nada de lo dispuesto en este apartado limita los derechos imperativos de protección de los consumidores que le reconozcan las leyes de su país de residencia.",
        ],
      },
      {
        h: "15. Idioma y contacto",
        p: [
          "Podemos ofrecer traducciones de estos Términos como referencia; si una traducción difiere de la versión en inglés, prevalece la versión en inglés. Consultas sobre estos Términos: [{legalEmail}](mailto:{legalEmail}).",
        ],
      },
    ],
  },

  privacy: {
    title: "Política de privacidad",
    description: "Qué datos personales recopila TokenAPI, cómo los usa y comparte, dónde se tratan y cuáles son sus derechos.",
    intro: "Esta Política de privacidad explica cómo {company} («TokenAPI», «nosotros») recopila, usa y comparte datos personales cuando usted utiliza nuestro sitio web y nuestra API (el «Servicio»). Somos el responsable del tratamiento de los datos personales descritos aquí.",
    sections: [
      {
        h: "1. Datos que recopilamos",
        list: [
          "Datos de cuenta: su correo electrónico, nombre, nombre de la empresa y la información que nos envía al solicitar acceso o contactarnos.",
          "Datos de facturación: importes de recarga, saldo, facturas e historial de transacciones. Los datos de tarjetas y cuentas bancarias los gestiona nuestro proveedor de pagos; nunca recibimos el número completo de la tarjeta.",
          "Metadatos de uso de cada solicitud a la API: ID de solicitud, marca de tiempo, ID de la clave de API, el identificador de modelo invocado y el modelo que la atendió, recuento de tokens, coste, latencia, estado y tipo de error, dirección IP y user agent.",
          "Analítica del sitio web: estadísticas agregadas de visitas recopiladas sin cookies publicitarias (Vercel Web Analytics y Cloudflare Web Analytics).",
        ],
      },
      {
        h: "2. Contenido de indicaciones y respuestas",
        p: [
          "No almacenamos el contenido de sus indicaciones ni de las respuestas de los modelos. El contenido pasa por nuestro gateway hasta el proveedor de modelos que atiende la solicitud y vuelve a usted. Los proveedores de modelos tratan ese contenido conforme a sus propios términos y políticas de privacidad, lo que puede incluir una conservación temporal para vigilar abusos.",
        ],
      },
      {
        h: "3. Cómo usamos los datos",
        list: [
          "Para prestar el Servicio: autenticar claves de API, enrutar solicitudes y aplicar límites de frecuencia y de gasto.",
          "Para facturar: retener y liquidar cargos, mantener su saldo y conservar registros contables.",
          "Para mantener la seguridad: detectar fraude, abusos e infracciones de la Política de uso aceptable.",
          "Para prestar soporte y comunicarnos con usted sobre su cuenta y sobre cambios en el Servicio o en esta política.",
          "Para comprender y mejorar el Servicio mediante estadísticas agregadas.",
          "Para cumplir obligaciones legales.",
        ],
      },
      {
        h: "4. Bases jurídicas",
        p: [
          "Cuando se aplica el RGPD o una ley similar, tratamos los datos personales para ejecutar nuestro contrato con usted, por nuestro interés legítimo en operar, proteger y mejorar el Servicio, para cumplir obligaciones legales y, cuando se requiere, con su consentimiento.",
        ],
      },
      {
        h: "5. Con quién compartimos los datos",
        p: [
          "No vendemos datos personales. Solo los compartimos con proveedores que nos ayudan a operar el Servicio, en virtud de contratos que limitan su uso:",
        ],
        list: [
          "Proveedores de modelos de IA que procesan sus solicitudes, entre ellos Alibaba Cloud, DeepSeek y Google.",
          "Alojamiento e infraestructura: Vercel (alojamiento de la aplicación), Neon (base de datos) y Cloudflare (DNS y analítica del sitio web).",
          "Nuestro proveedor de pagos, que procesa sus pagos.",
          "Asesores profesionales y autoridades, cuando la ley lo exija o para proteger nuestros derechos.",
        ],
      },
      {
        h: "6. Transferencias internacionales",
        p: [
          "Nuestros proveedores tratan datos en varios países, incluidos Estados Unidos, China y Singapur, que pueden no ofrecer el mismo nivel de protección que su país. Cuando es necesario, aplicamos garantías adecuadas, como las cláusulas contractuales tipo. El contenido de las solicitudes se trata en el país del proveedor de modelos que las atiende.",
        ],
      },
      {
        h: "7. Conservación",
        p: [
          "Conservamos los datos de cuenta mientras la cuenta esté activa y durante un periodo razonable posterior. Los registros de uso y facturación se conservan el tiempo necesario a efectos contables, fiscales, de resolución de controversias y de auditoría, por lo general hasta siete años. Las estadísticas agregadas que no le identifican pueden conservarse más tiempo.",
        ],
      },
      {
        h: "8. Cookies",
        p: [
          "Solo usamos unas pocas cookies esenciales: `tokenapi_lang` recuerda el idioma elegido y el área de administración usa una cookie de sesión para el inicio de sesión del personal. Nuestra analítica no usa cookies, y no utilizamos cookies publicitarias ni de seguimiento entre sitios.",
        ],
      },
      {
        h: "9. Seguridad",
        p: [
          "Protegemos los datos con cifrado en tránsito, almacenamiento de claves de API mediante hash, credenciales de proveedores cifradas, control de acceso y registros. Ningún sistema es completamente seguro; mantenga protegidas sus claves de API y notifique cualquier incidente sospechoso a [{supportEmail}](mailto:{supportEmail}).",
        ],
      },
      {
        h: "10. Sus derechos",
        p: [
          "Según su lugar de residencia, puede tener derecho a acceder, rectificar, suprimir o exportar sus datos personales, a oponerse a determinados tratamientos o limitarlos, y a retirar su consentimiento. Para ejercerlos, escriba a [{privacyEmail}](mailto:{privacyEmail}). También puede presentar una reclamación ante la autoridad de protección de datos de su país.",
        ],
      },
      {
        h: "11. Menores",
        p: [
          "El Servicio no está dirigido a menores de 18 años y no recopilamos a sabiendas sus datos personales.",
        ],
      },
      {
        h: "12. Cambios y contacto",
        p: [
          "Podemos actualizar esta política y publicaremos la nueva versión con su fecha de entrada en vigor. Contacto: {company}, [{privacyEmail}](mailto:{privacyEmail}).",
        ],
      },
    ],
  },

  acceptableUse: {
    title: "Política de uso aceptable",
    description: "Qué está prohibido al usar TokenAPI y cómo lo aplicamos.",
    intro: "Esta política se aplica a todos los usuarios de TokenAPI y forma parte de nuestros [Términos del servicio](/terms). Las solicitudes también están sujetas a las políticas de uso de los proveedores de modelos que las atienden; si son más estrictas, también se aplican.",
    sections: [
      {
        h: "1. Contenido y actividades prohibidos",
        p: ["No puede usar el Servicio, ni ayudar a otros a usarlo, para:"],
        list: [
          "infringir la ley o facilitar actividades ilícitas;",
          "crear, distribuir o solicitar contenido sexual en el que intervengan menores, o cualquier contenido que explote o ponga en peligro a menores;",
          "promover o apoyar el terrorismo o el extremismo violento, o incitar a la violencia;",
          "acosar, amenazar o intimidar a personas, o promover el odio por características protegidas;",
          "desarrollar o usar malware, acceder sin autorización a sistemas o atacar la seguridad o disponibilidad de cualquier red o servicio;",
          "cometer fraude, phishing, estafas o spam, o suplantar a personas u organizaciones para engañar;",
          "desarrollar u obtener armas biológicas, químicas, nucleares o radiológicas, u otras armas capaces de causar víctimas masivas;",
          "llevar a cabo operaciones de influencia engañosas o campañas de desinformación, incluidas las relacionadas con elecciones;",
          "infringir derechos de propiedad intelectual o de privacidad, o recopilar o tratar datos personales o sensibles sin base jurídica;",
          "tomar decisiones totalmente automatizadas que produzcan efectos jurídicos o igualmente significativos para las personas (por ejemplo, de crédito, empleo, vivienda, salud o jurídicas) sin una revisión humana adecuada.",
        ],
      },
      {
        h: "2. Abuso del Servicio",
        p: ["No puede:"],
        list: [
          "eludir, desactivar o interferir con los límites de frecuencia, los límites de gasto, la autenticación o las medidas de seguridad, ni usar varias cuentas para evadir límites;",
          "compartir, vender o publicar claves de API, ni revender el Servicio como API independiente sin nuestro acuerdo por escrito;",
          "usar las respuestas para desarrollar modelos competidores cuando los términos del proveedor de modelos lo prohíban;",
          "sondear, escanear o someter a pruebas de carga el Servicio sin permiso, ni interferir con el uso de otros clientes.",
        ],
      },
      {
        h: "3. Aplicación",
        p: [
          "Podemos investigar presuntas infracciones y, según su gravedad, bloquear solicitudes, revocar claves de API, o suspender o cerrar cuentas, con o sin aviso previo. Cuando la ley lo exija, comunicaremos el contenido ilícito a las autoridades. El saldo de las cuentas cerradas por infracción no se reembolsa.",
        ],
      },
      {
        h: "4. Denunciar abusos",
        p: [
          "Denuncie abusos o vulnerabilidades de seguridad a [{abuseEmail}](mailto:{abuseEmail}). Incluya el ID de solicitud (`x-request-id`) si lo tiene.",
        ],
      },
    ],
  },

  refund: {
    title: "Política de reembolsos y saldo",
    description: "Cómo funcionan en TokenAPI el saldo prepago, los cargos, los reembolsos, los errores de facturación y la caducidad del saldo.",
    intro: "TokenAPI se paga con un saldo prepago. Esta política explica cómo se aplican los cargos, cuándo se puede devolver dinero y cuándo caduca el saldo. Forma parte de nuestros [Términos del servicio](/terms).",
    sections: [
      {
        h: "1. Saldo prepago",
        p: [
          "Las recargas se hacen en dólares estadounidenses. El saldo solo puede usarse para el consumo de TokenAPI a los precios por modelo publicados en la página de [modelos](/models). El saldo no es un depósito bancario, no genera intereses y no puede transferirse a otra cuenta ni canjearse por dinero en efectivo.",
        ],
      },
      {
        h: "2. Cómo se aplican los cargos",
        list: [
          "Antes de ejecutar una solicitud, se retiene de su saldo su coste máximo posible (indicación + `max_tokens`). Si el saldo no alcanza, la solicitud se rechaza y no se cobra nada.",
          "Al terminar la solicitud, se cobran los tokens reales y el resto de la retención se libera de inmediato.",
          "No se cobran las solicitudes que fallan antes de que el modelo empiece a responder.",
          "Si una respuesta en streaming se cancela o se interrumpe, solo se cobran los tokens generados.",
        ],
      },
      {
        h: "3. Reembolsos",
        p: [
          "Los pagos y las recargas son definitivos y no se reembolsan, salvo cuando la ley aplicable exija un reembolso (por ejemplo, por derechos imperativos de protección de los consumidores) o cuando cerremos su cuenta por conveniencia y no por un incumplimiento suyo, en cuyo caso le reembolsaremos el saldo no utilizado.",
        ],
      },
      {
        h: "4. Errores de facturación",
        p: [
          "Si cree que se le ha cobrado por error, escriba a [{supportEmail}](mailto:{supportEmail}) dentro de los {disputeDays} días siguientes al cargo e indique los ID de solicitud correspondientes (`x-request-id`). Si confirmamos el error, abonaremos el importe en su saldo o, si el error fue en un pago, lo devolveremos al método de pago original.",
        ],
      },
      {
        h: "5. Caducidad del saldo",
        p: [
          "El saldo caduca si su cuenta pasa {expiryMonths} meses consecutivos sin uso de la API y sin recargas. Le avisaremos por correo electrónico al menos {noticeDays} días antes de la caducidad; cualquier uso o recarga antes de esa fecha mantiene vigente el saldo.",
        ],
      },
      {
        h: "6. Contracargos",
        p: [
          "Contacte con nosotros antes de disputar un pago con su banco. Si se presenta un contracargo, podemos suspender la cuenta mientras se revisa. Los contracargos injustificados pueden dar lugar al cierre de la cuenta.",
        ],
      },
      {
        h: "7. Cierre de la cuenta",
        p: [
          "Puede solicitar el cierre de su cuenta en cualquier momento. El saldo restante se pierde al cerrarla, salvo que la ley exija un reembolso o se aplique el apartado 3.",
        ],
      },
    ],
  },

  contact: {
    title: "Contacto",
    description: "Cómo contactar con TokenAPI: datos de la empresa y canales de soporte, privacidad, abusos y asuntos legales.",
    intro: "Respondemos en un plazo de {days} días hábiles. Si su consulta se refiere a una solicitud concreta, incluya el ID de solicitud de la cabecera de respuesta `x-request-id`.",
    companyHeading: "Empresa",
    labels: { company: "Operado por", jurisdiction: "Registrada en", address: "Dirección" },
    channelsHeading: "Canales",
    channels: [
      { label: "General y ventas", detail: "Claves de API, precios por volumen, colaboraciones.", emailKey: "general" },
      { label: "Soporte y facturación", detail: "Problemas técnicos, cargos y saldo.", emailKey: "support" },
      { label: "Privacidad", detail: "Solicitudes de acceso, rectificación y supresión de datos.", emailKey: "privacy" },
      { label: "Abusos y seguridad", detail: "Denuncia de abusos o vulnerabilidades.", emailKey: "abuse" },
      { label: "Legal", detail: "Notificaciones y consultas sobre los términos.", emailKey: "legal" },
    ],
    responseNote: "Envíe las notificaciones legales formales por correo electrónico a la dirección legal indicada arriba.",
  },
};
