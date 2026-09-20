// Contenido del portafolio en español e inglés.
// Todo el sitio (lobby, vista previa, paneles y modo simple) lee de aquí.

import type { FeatureId, PlaceId, StandId } from "@/lobby/store";

export type Locale = "es" | "en";

export const profile = {
  name: "Sadiel Rojas Padilla",
  site: "https://sadielrojas.vercel.app",
  email: "sadielrojas08@gmail.com",
  // Solo se usa para el enlace de WhatsApp; no se muestra en la página.
  whatsapp: "18095195688",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sadielrojaspadilla" },
    { label: "GitHub", href: "https://github.com/4n1mah" },
  ],
};

const REPO = "https://github.com/4n1mah";

interface Project {
  title: string;
  category: string;
  color: string;
  description: string;
  tags: string[];
  result: string;
  links: { label: string; href: string }[];
}

interface StandText {
  title: string;
  subtitle: string;
  sideText: string[];
  greeting: string[];
}

/** How visitors talk about a place they walk to. */
interface PlaceText {
  /** "¿Ya viste {name}?" */
  name: string;
  /** "Voy {to}" */
  to: string;
  /** Said on arrival, or when you hover the place while they are there. */
  lines: string[];
}

/** An upcoming feature: shown in the lobby and in its panel as "under construction". */
interface FeatureText {
  title: string;
  kicker: string;
  preview: string[];
  description: string;
  plans: string[];
}

const es = {
  ui: {
    role: "Desarrollador de Software",
    tagline: ["La imaginación", "es el límite"],
    welcome: "Bienvenido/a a mi espacio profesional",
    metaDescription:
      "Portafolio interactivo de Sadiel Rojas Padilla, desarrollador de software enfocado en backend con Python, FastAPI y Next.js.",
    loading: "Abriendo el lobby…",
    hintMouse: "Pasa el mouse sobre un stand · Haz click para entrar",
    hintTouch: "Arrastra para explorar · Toca un stand",
    enter: "Entrar a",
    preview: "Vista previa",
    clickToEnter: "Click para entrar →",
    simpleMode: "Modo simple",
    backToLobby: "← Volver al lobby",
    backToInteractive: "Volver al lobby interactivo",
    sections: "Secciones",
    language: "Idioma",
    downloadCv: "Descargar CV",
    cvFile: "/downloads/CV-Sadiel-Rojas-Padilla-ES.pdf",
    contactTitle: "¿Hablamos?",
    writeMe: "Escríbeme",
    findMe: "Encuéntrame en",
    underConstruction: "En construcción",
    whatsComing: "Lo que viene",
    headings: {
      story: "Mi historia",
      values: "Lo que me mueve",
      drivers: "Mi motivación",
      funFacts: "Datos curiosos",
      soft: "Habilidades interpersonales",
      languages: "Idiomas",
      learning: "Aprendiendo ahora",
      education: "Educación",
    },
  },
  about: {
    title: "Sobre mí",
    kicker: "Persona · Historia · Motivación",
    preview: ["Mi historia", "Lo que me mueve", "Mi motivación", "Datos curiosos"],
    intro:
      "Soy desarrollador de software enfocado en backend, con Python y FastAPI como herramientas principales. Vengo del mundo de las operaciones y la analítica, y eso me dio algo que valoro mucho: entender cómo los sistemas impactan a las personas que los usan todos los días.",
    story: [
      "Empecé como técnico en informática, pasé por la mecatrónica y luego trabajé en soporte, ventas y análisis en tiempo real para empresas de Estados Unidos. En cada rol terminaba haciendo lo mismo: automatizar lo repetitivo y convertir datos en herramientas útiles.",
    ],
    storyCta: {
      text: "Actualmente estudiando Desarrollo de Software en el ITLA mientras trabajo en proyectos que puedan elevar mi conocimiento y mi carrera profesional. ¡Puedes verlos en el ",
      link: "salón de proyectos",
      after: "!",
    },
    values: [
      { title: "Automatizar lo repetitivo", text: "Si una tarea se hace a mano todos los días, merece un sistema." },
      { title: "Pensar en el usuario final", text: "Mi experiencia en operaciones me enseñó a construir para quien usa la herramienta." },
      { title: "Aprender construyendo", text: "Cada proyecto es una oportunidad para crecer técnicamente." },
    ],
    drivers: "Me mueve crear sistemas que ahorran tiempo, ordenan procesos y hacen la vida más fácil a las personas.",
    funFacts: [
      "Bilingüe: español nativo e inglés avanzado",
      "Técnico en Mecatrónica",
      "Siempre encuentro formas de optimizar el tiempo",
      "Me encanta crear cosas",
    ],
  },
  portfolio: {
    title: "Portafolio",
    kicker: "Proyectos · Casos · Resultados",
    preview: ["Kan-M: sitio web y panel", "Kan-M: bot de WhatsApp", "Bot de finanzas", "Tracker de SLA"],
    projects: [
      {
        title: "Kan-M — Sitio web y panel administrativo",
        category: "Full-stack · En producción",
        color: "#8a6a52",
        description:
          "Sitio público para una repostería y catering de la Zona Colonial: catálogo con carrito, cotizaciones de eventos con fotos, seguimiento de pedidos y versión bilingüe. Incluye un panel administrativo con calendario de carga de trabajo, gestión de productos, reportes de ventas, roles de usuario y notificaciones push.",
        tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL (Neon)", "Firebase", "Vercel"],
        result: "Sitio vivo usado por un negocio real",
        links: [
          { label: "Ver sitio", href: "https://kanmreposteriaycatering.com/" },
          { label: "Repositorio", href: `${REPO}/kan-m-web` },
        ],
      },
      {
        title: "Kan-M — Bot de WhatsApp",
        category: "Backend · IA · Proyecto para cliente",
        color: "#4f6b62",
        description:
          "Chatbot de atención al cliente que resuelve lo repetitivo (horario, ubicación, delivery, preguntas frecuentes y datos para cotizaciones) y escala a una persona lo que requiere criterio. Combina respuestas fijas con una capa de IA y convive con la app de WhatsApp Business en el mismo número.",
        tags: ["Python", "FastAPI", "PostgreSQL", "Gemini API", "WhatsApp Cloud API", "Railway"],
        result: "Líder técnico y arquitecto · 100% de casos de prueba cubiertos antes del despliegue",
        links: [{ label: "Repositorio", href: `${REPO}/Kan-m-bot` }],
      },
      {
        title: "Finance Bot",
        category: "Backend · IA · Proyecto personal",
        color: "#1f2a44",
        description:
          'Registro de gastos por WhatsApp en lenguaje natural: escribes "Gasté 350 en uber" y el bot extrae monto, categoría y descripción. Permite consultar gastos por período o categoría y lleva el control de pagos fijos con su próxima fecha.',
        tags: ["Python", "FastAPI", "Groq (Llama 3.3)", "SQLAlchemy", "Pydantic", "pytest"],
        result: "Desplegado en producción en Railway",
        links: [{ label: "Repositorio", href: `${REPO}/finance-bot` }],
      },
      {
        title: "Tracker automatizado de SLA",
        category: "Automatización · Datos",
        color: "#c9a27a",
        description:
          "Reporte en Excel con Power Query y Power Pivot que consolida más de 10 departamentos en un dashboard que se actualiza solo, reemplazando un proceso manual diario.",
        tags: ["Power Query", "Power Pivot", "Dashboards"],
        result: "Adoptado en toda la empresa · ahorra más de 13 horas por semana",
        links: [],
      },
    ] as Project[],
  },
  skills: {
    title: "Habilidades",
    kicker: "Herramientas · Conocimientos · Crecimiento",
    preview: ["Backend", "Bases de datos", "Integraciones e IA", "Datos y automatización"],
    groups: [
      { name: "Backend y desarrollo", items: ["Python", "FastAPI", "Pydantic", "Next.js", "TypeScript", "JavaScript", "HTML", "Git"] },
      { name: "Bases de datos", items: ["SQL", "PostgreSQL", "SQLAlchemy", "Prisma", "Modelado de datos"] },
      { name: "Integraciones e IA", items: ["APIs REST", "JSON", "XML", "WhatsApp Business API", "Gemini API", "Groq", "Firebase"] },
      { name: "Pruebas y despliegue", items: ["pytest", "Vitest", "Railway", "Vercel"] },
      {
        name: "Datos y automatización",
        items: ["Pandas", "NumPy", "Excel avanzado (Power Query, Power Pivot)", "Sigma Computing", "Google Sheets", "Tableau"],
      },
      { name: "Herramientas", items: ["Salesforce CRM", "AWS", "Aspect WFM", "Slack", "Microsoft Teams"] },
    ],
    soft: ["Liderazgo técnico", "Levantamiento de requerimientos", "QA y pruebas", "Comunicación con clientes", "Trabajo multifuncional"],
    languages: ["Español (nativo)", "Inglés (avanzado)"],
    learning: ["Desarrollo de Software enfocado al Backend", "Power BI"],
  },
  experience: {
    title: "Experiencias",
    kicker: "Trayectoria · Colaboraciones · Logros",
    preview: ["Proyecto Kan-M", "National Debt Relief", "Alorica · Verizon", "Educación"],
    timeline: [
      {
        role: "Líder Técnico y Arquitecto",
        company: "Kan-M Repostería y Catering · Proyecto para cliente",
        period: "Mar 2026 — Actualidad",
        description: "Diseño y liderazgo de un sistema de automatización por WhatsApp: API en FastAPI, panel web en Next.js y app Android.",
        achievements: [
          "Definí la arquitectura de tres repositorios integrados con PostgreSQL",
          "Lideré requerimientos, pruebas funcionales y auditoría previa al despliegue",
          "100% de cobertura de casos de prueba antes de producción",
        ],
      },
      {
        role: "Analista de Enrutamiento de Leads",
        company: "National Debt Relief / Broadway Support Services",
        period: "Feb 2026 — Jul 2026",
        description:
          "Responsable de que los leads llegaran a los agentes de ventas correctos en el momento correcto, en una operación de más de 500 agentes y más de 20,000 leads diarios.",
        achievements: [
          "Distribuía los leads en Salesforce y AWS para cumplir las métricas del equipo y generar más ventas para la empresa",
          "Monitoreaba el flujo de leads en tiempo real y ajustaba la distribución sobre la marcha según el desempeño en vivo",
          "Alineaba la estrategia de enrutamiento con los líderes de Ventas e Ingresos para priorizar las metas del negocio",
        ],
      },
      {
        role: "Analista de Tiempo Real (RTA)",
        company: "National Debt Relief / Broadway Support Services",
        period: "Oct 2025 — Feb 2026",
        description:
          "Analista de Workforce Management (WFM): vigilaba en tiempo real que la operación cumpliera sus métricas en 5–6 campañas usando Aspect WFM.",
        achievements: [
          "Creé el SLA Report: un tracker automatizado en Excel (Power Query y Power Pivot) que consolida más de 10 departamentos, adoptado en toda la empresa y que ahorra más de 13 horas semanales",
          "Monitoreaba SLA, adherencia y ocupación, y me aseguraba de que las llamadas se atendieran, coordinando acciones inmediatas con el piso",
          "Mantuve el SLA por encima del 90% en todos los departamentos",
          "Preparaba y enviaba reportes diarios de KPI y métricas a los departamentos a mi cargo",
          "Gestionaba ~60 tickets diarios de la operación hasta su cierre",
        ],
      },
      {
        role: "Ejecutivo de Cuentas de Ventas",
        company: "National Debt Relief / Broadway Support Services",
        period: "May 2025 — Oct 2025",
        description:
          "Venta consultiva de programas de alivio de deudas para clientes del mercado de EE. UU., en un entorno de alto volumen orientado a metas.",
        achievements: [
          "Llevaba cada venta de principio a fin: descubrimiento de necesidades, manejo de objeciones, cierre e inscripción en el programa",
          "Mantuve un desempeño constante en o por encima del promedio del equipo de ventas",
          "Esta experiencia en ventas es la que después guió mi forma de distribuir leads y diseñar los reportes de SLA",
        ],
      },
      {
        role: "Coach de Soporte",
        company: "Alorica · Cuenta Verizon",
        period: "Ene 2023 — May 2025",
        description: "Soporte técnico y coaching en inglés a agentes de primera línea para clientes de Verizon en EE. UU.",
        achievements: [
          "Construí una automatización en Slack que enviaba métricas individuales a cada agente",
          "Dashboards en Google Sheets con flujos automatizados para un equipo de 15 agentes",
        ],
      },
    ],
    education: [
      { title: "Tecnólogo en Desarrollo de Software (Backend)", place: "Instituto Tecnológico de las Américas (ITLA)", period: "2023 — Actualidad" },
      { title: "Técnico en Mecatrónica", place: "INFOTEP", period: "2022 — 2023" },
      { title: "Técnico en Informática", place: "Centro de Tecnología Universal (CENTU)", period: "2018 — 2019" },
    ],
  },
  features: {
    notes: {
      title: "Muro de visitantes",
      kicker: "Notas · Comentarios · Comunidad",
      preview: ["Deja una nota sobre la plaza", "Lee lo que escriben otros", "Moderado y seguro"],
      description: "Muy pronto podrás dejar una nota o un comentario sobre la plaza y leer lo que han escrito otros visitantes.",
      plans: [
        "Notas cortas con tu nombre o de forma anónima",
        "Cada texto se filtra y se limpia antes de publicarse",
        "Todo se guarda en una base de datos",
      ],
    },
    stats: {
      title: "Lo más visitado",
      kicker: "Visitas · Secciones · En vivo",
      preview: ["Secciones más visitadas", "Datos en vivo de la plaza", "Cuenta sesiones, no personas"],
      description: "Cada vez que alguien abre una sección de la plaza se suma una visita. Esto es lo que llevamos.",
      plans: [
        "Se cuenta una visita por sección y por sesión del navegador",
        "Si abres la misma sección dos veces, cuenta una",
        "No se guardan cookies ni datos personales",
      ],
    },
    anima: {
      title: "Anima",
      kicker: "Asistente virtual · En entrenamiento",
      preview: ["Pregúntale sobre mi CV", "Respuestas al instante", "En entrenamiento"],
      description:
        "Anima es la nueva asistente de la plaza. Todavía la están entrenando, pero pronto podrá responder tus preguntas sobre mi experiencia, proyectos y habilidades.",
      plans: ["Respuestas basadas en mi CV", "Conversación en español y en inglés"],
    },
  } as Record<FeatureId, FeatureText>,
  // Tablero de visitas: lo que rodea al gráfico, en el panel y en la pantalla del lobby.
  statsBoard: {
    windows: { all: "Desde el inicio", week: "Últimos 7 días" },
    howItWorks: "Cómo se cuenta",
    total: { one: "visita en total", many: "visitas en total" },
    visits: { one: "visita", many: "visitas" },
    updated: "Actualizado a las {time}",
    loading: "Cargando las estadísticas…",
    offline: "El tablero no está disponible en este momento. Inténtalo de nuevo en un rato.",
    empty: "Todavía no hay visitas en este periodo. La tuya puede ser la primera.",
  },
  lobby: {
    stands: {
      about: {
        title: "Sobre mí",
        subtitle: "PERSONA · HISTORIA · MOTIVACIÓN",
        sideText: ["Más que un CV,", "una historia", "de pasión."],
        greeting: ["¡Hola! Aquí te cuento un poco sobre mí.", "¡Hola! Haz click para conocer más."],
      },
      portfolio: {
        title: "Portafolio",
        subtitle: "PROYECTOS · CASOS · RESULTADOS",
        sideText: ["IDEAS", "PROYECTOS", "SOLUCIONES", "REALES"],
        greeting: ["Aquí están mis proyectos reales.", "Haz click para ver los casos."],
      },
      skills: {
        title: "Habilidades",
        subtitle: "HERRAMIENTAS · CONOCIMIENTOS · CRECIMIENTO",
        sideText: ["APRENDER", "CREAR", "MEJORAR", "REPETIR"],
        greeting: ["Aquí están mis habilidades 🙂", "Haz click para ver más."],
      },
      experience: {
        title: "Experiencias",
        subtitle: "TRAYECTORIA · COLABORACIONES · LOGROS",
        sideText: ["EXPERIENCIAS", "QUE CONSTRUYEN", "EL MAÑANA"],
        greeting: ["Puedes ver mi experiencia aquí.", "Haz click para ver mi trayectoria."],
      },
    } as Record<StandId, StandText>,
    activeGreeting: "¡Bienvenida/o! Aquí tienes todo 👉",
    // Visitors only announce where they are really going, and comment on the place they are at.
    crowd: {
      going: ["Voy {to}", "Ahora {to} 👉"],
      ask: "¿Ya viste {name}?",
      agree: ["¡Voy para allá!", "¡Buena idea! 👍"],
      places: {
        about: { name: "Sobre mí", to: "a Sobre mí", lines: ["Más que un CV 👏", "Qué buena historia ✨", "Me cae bien 🙂"] },
        portfolio: { name: "el Portafolio", to: "al Portafolio", lines: ["¡Mira este proyecto! 😍", "Proyectos reales 👏", "Qué buena idea 💡"] },
        skills: { name: "Habilidades", to: "a Habilidades", lines: ["¡Python y FastAPI! 🐍", "Buen stack 🛠️", "Aprender, crear, mejorar 💪"] },
        experience: { name: "Experiencias", to: "a Experiencias", lines: ["Qué trayectoria 👏", "Buena experiencia 💼", "Interesante recorrido"] },
        notes: { name: "el muro de visitantes", to: "al muro de visitantes", lines: ["Pronto dejo mi nota 📝", "¿Cuándo abren el muro?"] },
        stats: { name: "las estadísticas", to: "a ver las estadísticas", lines: ["¿Qué será lo más visitado? 📊", "Los números están en vivo 📈"] },
        anima: { name: "a Anima", to: "a saludar a Anima", lines: ["¡Hola, Anima! 👋", "¿Qué tal el entrenamiento?"] },
        plaza: { name: "la plaza", to: "a la plaza", lines: ["Qué bonita la plaza 🌳", "Me encanta este lugar"] },
      } as Record<PlaceId, PlaceText>,
    },
    // one list per seated visitor: laptop on the bench, coffee on the other bench, laptop on the sofa by Skills
    sitterLines: [["Revisando proyectos 💻", "Qué interesante 👏"], ["Un cafecito en la plaza ☕", "Qué bonito lugar 🌳"], ["Tomo notas de Habilidades 📝", "Me quedo un rato más"]],
    plazaSign: "Sadiel’s Plaza",
    notesSign: "Muro de visitantes",
    comingSoon: "PRÓXIMAMENTE",
    statsTitle: "SECCIONES MÁS VISITADAS",
    underConstruction: "EN CONSTRUCCIÓN",
    animaRole: "ASISTENTE · EN ENTRENAMIENTO",
    animaLines: [
      "¡Hola! Soy Anima 👋",
      "Soy nueva en la plaza ✨",
      "Todavía me están entrenando…",
      "Pronto podré responder preguntas sobre el CV de Sadiel.",
      "Estoy aprendiendo mucho, ¡vuelve pronto! 📚",
    ],
    /** Anima answering a visitor who says hello. */
    animaReplies: ["¡Hola! 👋", "¡Hola! Aún estoy aprendiendo ✨"],
  },
};

export type Content = typeof es;

const en: Content = {
  ui: {
    role: "Software Developer",
    tagline: ["Imagination", "is the limit"],
    welcome: "Welcome to my professional space",
    metaDescription:
      "Interactive portfolio of Sadiel Rojas Padilla, a software developer focused on backend with Python, FastAPI and Next.js.",
    loading: "Opening the lobby…",
    hintMouse: "Hover over a booth · Click to enter",
    hintTouch: "Drag to explore · Tap a booth",
    enter: "Enter",
    preview: "Preview",
    clickToEnter: "Click to enter →",
    simpleMode: "Simple mode",
    backToLobby: "← Back to the lobby",
    backToInteractive: "Back to the interactive lobby",
    sections: "Sections",
    language: "Language",
    downloadCv: "Download CV",
    cvFile: "/downloads/CV-Sadiel-Rojas-Padilla-EN.pdf",
    contactTitle: "Let's talk?",
    writeMe: "Email me",
    findMe: "Find me on",
    underConstruction: "Under construction",
    whatsComing: "What's coming",
    headings: {
      story: "My story",
      values: "What drives me",
      drivers: "My motivation",
      funFacts: "Fun facts",
      soft: "Interpersonal skills",
      languages: "Languages",
      learning: "Currently learning",
      education: "Education",
    },
  },
  about: {
    title: "About me",
    kicker: "Person · Story · Motivation",
    preview: ["My story", "What drives me", "My motivation", "Fun facts"],
    intro:
      "I'm a software developer focused on backend, with Python and FastAPI as my main tools. I come from the world of operations and analytics, which gave me something I value a lot: understanding how systems affect the people who use them every day.",
    story: [
      "I started as an IT technician, studied mechatronics, and then worked in support, sales and real-time analytics for U.S. companies. In every role I ended up doing the same thing: automating repetitive work and turning data into useful tools.",
    ],
    storyCta: {
      text: "I'm currently studying Software Development at ITLA while working on projects that push my knowledge and my professional career forward. You can see them in the ",
      link: "projects hall",
      after: "!",
    },
    values: [
      { title: "Automate the repetitive", text: "If a task is done by hand every day, it deserves a system." },
      { title: "Think about the end user", text: "Operations taught me to build for the person who actually uses the tool." },
      { title: "Learn by building", text: "Every project is a chance to grow technically." },
    ],
    drivers: "I'm driven by building systems that save time, organize processes and make people's lives easier.",
    funFacts: [
      "Bilingual: native Spanish, advanced English",
      "Mechatronics technician",
      "I always find ways to optimize time",
      "I love creating things",
    ],
  },
  portfolio: {
    title: "Portfolio",
    kicker: "Projects · Cases · Results",
    preview: ["Kan-M: website & admin", "Kan-M: WhatsApp bot", "Finance bot", "SLA tracker"],
    projects: [
      {
        title: "Kan-M — Website & admin panel",
        category: "Full-stack · Live in production",
        color: "#8a6a52",
        description:
          "Public website for a bakery and catering business in Santo Domingo's Colonial Zone: catalog with cart, event quotes with photo uploads, order tracking and a bilingual interface. Includes an admin panel with a workload calendar, product management, sales reports, user roles and push notifications.",
        tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL (Neon)", "Firebase", "Vercel"],
        result: "Live site used by a real business",
        links: [
          { label: "Visit site", href: "https://kanmreposteriaycatering.com/" },
          { label: "Repository", href: `${REPO}/kan-m-web` },
        ],
      },
      {
        title: "Kan-M — WhatsApp bot",
        category: "Backend · AI · Client project",
        color: "#4f6b62",
        description:
          "Customer service chatbot that handles the repetitive work (hours, location, delivery, FAQs and quote details) and escalates anything that needs judgment to a person. It combines fixed answers with an AI layer and runs alongside the WhatsApp Business app on the same number.",
        tags: ["Python", "FastAPI", "PostgreSQL", "Gemini API", "WhatsApp Cloud API", "Railway"],
        result: "Technical lead & architect · 100% test case coverage before deployment",
        links: [{ label: "Repository", href: `${REPO}/Kan-m-bot` }],
      },
      {
        title: "Finance Bot",
        category: "Backend · AI · Personal project",
        color: "#1f2a44",
        description:
          'Expense tracking over WhatsApp in natural language: write "I spent 350 on uber" and the bot extracts the amount, category and description. You can query spending by period or category, and it tracks fixed payments with their next due date.',
        tags: ["Python", "FastAPI", "Groq (Llama 3.3)", "SQLAlchemy", "Pydantic", "pytest"],
        result: "Deployed to production on Railway",
        links: [{ label: "Repository", href: `${REPO}/finance-bot` }],
      },
      {
        title: "Automated SLA tracker",
        category: "Automation · Data",
        color: "#c9a27a",
        description:
          "Excel report built with Power Query and Power Pivot that consolidates 10+ departments into a self-updating dashboard, replacing a daily manual process.",
        tags: ["Power Query", "Power Pivot", "Dashboards"],
        result: "Adopted company-wide · saves 13+ hours per week",
        links: [],
      },
    ],
  },
  skills: {
    title: "Skills",
    kicker: "Tools · Knowledge · Growth",
    preview: ["Backend", "Databases", "Integrations & AI", "Data & automation"],
    groups: [
      { name: "Backend & development", items: ["Python", "FastAPI", "Pydantic", "Next.js", "TypeScript", "JavaScript", "HTML", "Git"] },
      { name: "Databases", items: ["SQL", "PostgreSQL", "SQLAlchemy", "Prisma", "Data modeling"] },
      { name: "Integrations & AI", items: ["REST APIs", "JSON", "XML", "WhatsApp Business API", "Gemini API", "Groq", "Firebase"] },
      { name: "Testing & deployment", items: ["pytest", "Vitest", "Railway", "Vercel"] },
      {
        name: "Data & automation",
        items: ["Pandas", "NumPy", "Advanced Excel (Power Query, Power Pivot)", "Sigma Computing", "Google Sheets", "Tableau"],
      },
      { name: "Tools", items: ["Salesforce CRM", "AWS", "Aspect WFM", "Slack", "Microsoft Teams"] },
    ],
    soft: ["Technical leadership", "Requirements gathering", "QA & testing", "Client communication", "Cross-functional teamwork"],
    languages: ["Spanish (native)", "English (advanced)"],
    learning: ["Software Development focused on Backend", "Power BI"],
  },
  experience: {
    title: "Experience",
    kicker: "Career · Collaborations · Achievements",
    preview: ["Kan-M project", "National Debt Relief", "Alorica · Verizon", "Education"],
    timeline: [
      {
        role: "Technical Lead & Architect",
        company: "Kan-M Repostería y Catering · Client project",
        period: "Mar 2026 — Present",
        description: "Designed and led a WhatsApp automation system: FastAPI backend, Next.js web panel and Android app.",
        achievements: [
          "Defined the architecture across three integrated repositories with PostgreSQL",
          "Led requirements gathering, functional testing and the pre-deployment audit",
          "100% test case coverage before production",
        ],
      },
      {
        role: "Lead Routing Analyst",
        company: "National Debt Relief / Broadway Support Services",
        period: "Feb 2026 — Jul 2026",
        description:
          "Made sure leads reached the right sales agents at the right time, in an operation of 500+ agents and 20,000+ leads per day.",
        achievements: [
          "Distributed leads through Salesforce and AWS to hit team metrics and drive more sales for the company",
          "Monitored lead flow in real time and adjusted distribution on the fly based on live performance",
          "Aligned routing strategy with Sales and Revenue leadership to prioritize business goals",
        ],
      },
      {
        role: "Real-Time Analyst (RTA)",
        company: "National Debt Relief / Broadway Support Services",
        period: "Oct 2025 — Feb 2026",
        description:
          "Workforce Management (WFM) analyst: kept the operation on target in real time across 5–6 campaigns using Aspect WFM.",
        achievements: [
          "Built the SLA Report: an automated Excel tracker (Power Query + Power Pivot) consolidating 10+ departments, adopted company-wide and saving 13+ hours per week",
          "Monitored SLA, adherence and occupancy and made sure calls were answered, coordinating immediate action with the floor",
          "Kept SLA above 90% in every department",
          "Prepared and sent daily KPI and metrics reports to the departments I supported",
          "Handled ~60 operational tickets per day through to resolution",
        ],
      },
      {
        role: "Sales Account Executive",
        company: "National Debt Relief / Broadway Support Services",
        period: "May 2025 — Oct 2025",
        description:
          "Consultative sales of debt relief programs for U.S. customers in a high-volume, goal-driven environment.",
        achievements: [
          "Owned every sale end to end: needs discovery, objection handling, closing and program enrollment",
          "Consistently performed at or above the team sales average",
          "This hands-on sales experience later shaped how I routed leads and designed SLA reporting",
        ],
      },
      {
        role: "Support Coach",
        company: "Alorica · Verizon Account",
        period: "Jan 2023 — May 2025",
        description: "Technical support and coaching in English for frontline agents serving Verizon customers in the U.S.",
        achievements: [
          "Built a Slack automation that delivered individual metrics to each agent",
          "Google Sheets dashboards with automated workflows for a team of 15 agents",
        ],
      },
    ],
    education: [
      { title: "Software Development Technologist (Backend)", place: "Instituto Tecnológico de las Américas (ITLA)", period: "2023 — Present" },
      { title: "Mechatronics Technician", place: "INFOTEP", period: "2022 — 2023" },
      { title: "IT Technician", place: "Centro de Tecnología Universal (CENTU)", period: "2018 — 2019" },
    ],
  },
  features: {
    notes: {
      title: "Visitor wall",
      kicker: "Notes · Comments · Community",
      preview: ["Leave a note about the plaza", "Read what others write", "Moderated and safe"],
      description: "Soon you'll be able to leave a note or a comment about the plaza and read what other visitors have written.",
      plans: [
        "Short notes, signed or anonymous",
        "Every text is filtered and cleaned before it's published",
        "Everything is stored in a database",
      ],
    },
    stats: {
      title: "Most visited",
      kicker: "Visits · Sections · Live",
      preview: ["Most visited sections", "Live data from the plaza", "Counts sessions, not people"],
      description: "Every time someone opens a section of the plaza it counts as a visit. This is the tally so far.",
      plans: [
        "One visit per section and per browser session",
        "Opening the same section twice counts once",
        "No cookies and no personal data are stored",
      ],
    },
    anima: {
      title: "Anima",
      kicker: "Virtual assistant · In training",
      preview: ["Ask her about my CV", "Instant answers", "In training"],
      description:
        "Anima is the plaza's new assistant. She's still in training, but soon she'll answer your questions about my experience, projects and skills.",
      plans: ["Answers based on my CV", "Chat in English and Spanish"],
    },
  },
  statsBoard: {
    windows: { all: "Since the start", week: "Last 7 days" },
    howItWorks: "How it's counted",
    total: { one: "visit in total", many: "visits in total" },
    visits: { one: "visit", many: "visits" },
    updated: "Updated at {time}",
    loading: "Loading the stats…",
    offline: "The board isn't available right now. Try again in a little while.",
    empty: "No visits in this period yet. Yours could be the first.",
  },
  lobby: {
    stands: {
      about: {
        title: "About me",
        subtitle: "PERSON · STORY · MOTIVATION",
        sideText: ["More than a CV,", "a story", "of passion."],
        greeting: ["Hi! Here's a little about me.", "Hi! Click to learn more."],
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "PROJECTS · CASES · RESULTS",
        sideText: ["IDEAS", "PROJECTS", "REAL", "SOLUTIONS"],
        greeting: ["Here are my real projects.", "Click to see the cases."],
      },
      skills: {
        title: "Skills",
        subtitle: "TOOLS · KNOWLEDGE · GROWTH",
        sideText: ["LEARN", "BUILD", "IMPROVE", "REPEAT"],
        greeting: ["Here are my skills 🙂", "Click to see more."],
      },
      experience: {
        title: "Experience",
        subtitle: "CAREER · COLLABORATIONS · ACHIEVEMENTS",
        sideText: ["EXPERIENCES", "THAT BUILD", "TOMORROW"],
        greeting: ["You can see my experience here.", "Click to see my career."],
      },
    },
    activeGreeting: "Welcome! Here's everything 👉",
    crowd: {
      going: ["Heading {to}", "Off {to} 👉"],
      ask: "Seen {name}?",
      agree: ["On my way!", "Good idea! 👍"],
      places: {
        about: { name: "the About booth", to: "to About me", lines: ["More than a CV 👏", "What a story ✨", "Seems nice 🙂"] },
        portfolio: { name: "the Portfolio", to: "to the Portfolio", lines: ["Check out this project! 😍", "Real projects 👏", "Great idea 💡"] },
        skills: { name: "the Skills booth", to: "to Skills", lines: ["Python and FastAPI! 🐍", "Nice stack 🛠️", "Learn, build, improve 💪"] },
        experience: { name: "the Experience booth", to: "to Experience", lines: ["What a career 👏", "Solid experience 💼", "Interesting path"] },
        notes: { name: "the visitor wall", to: "to the visitor wall", lines: ["I'll leave a note soon 📝", "When does the wall open?"] },
        stats: { name: "the stats board", to: "to the stats board", lines: ["What's the most visited? 📊", "The numbers are live 📈"] },
        anima: { name: "Anima", to: "to say hi to Anima", lines: ["Hi, Anima! 👋", "How's the training going?"] },
        plaza: { name: "the plaza", to: "to the plaza", lines: ["Lovely plaza 🌳", "I love this place"] },
      },
    },
    sitterLines: [["Browsing projects 💻", "How interesting 👏"], ["Coffee in the plaza ☕", "Lovely spot 🌳"], ["Taking notes on Skills 📝", "I'll stay a bit longer"]],
    plazaSign: "Sadiel’s Plaza",
    notesSign: "Visitor wall",
    comingSoon: "COMING SOON",
    statsTitle: "MOST VISITED SECTIONS",
    underConstruction: "UNDER CONSTRUCTION",
    animaRole: "ASSISTANT · IN TRAINING",
    animaLines: [
      "Hi! I'm Anima 👋",
      "I'm new to the plaza ✨",
      "They're still training me…",
      "Soon I'll answer questions about Sadiel's CV.",
      "I'm learning a lot, come back soon! 📚",
    ],
    animaReplies: ["Hi there! 👋", "Hi! I'm still learning ✨"],
  },
};

export const content: Record<Locale, Content> = { es, en };
