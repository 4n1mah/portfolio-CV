// CV in the Harvard format, in Spanish and English. It condenses src/content/sections.ts into one page:
// keep both in sync when a job, project or skill changes, then rebuild the PDFs (npm run cv:pdf, see README).

import { profile, type Locale } from "./sections";

export interface CvRole {
  title: string;
  dates: string;
  bullets: string[];
}

export interface CvEntry {
  org: string;
  /** Right side of the organization line: dates when there is a single role. */
  dates?: string;
  roles: CvRole[];
}

export interface Cv {
  pageTitle: string;
  back: string;
  download: string;
  file: string;
  location: string;
  headings: { education: string; experience: string; projects: string; skills: string };
  education: { org: string; degree: string; dates: string }[];
  experience: CvEntry[];
  projects: { name: string; stack: string; link?: { label: string; href: string }; bullets: string[] }[];
  skills: { label: string; items: string }[];
}

export const cvContact = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "linkedin.com/in/sadielrojaspadilla", href: profile.links[0].href },
  { label: "github.com/4n1mah", href: profile.links[1].href },
  // the number is never printed, only the link
  { label: "WhatsApp", href: `https://wa.me/${profile.whatsapp}` },
];

const es: Cv = {
  pageTitle: "CV — Sadiel Rojas Padilla",
  back: "← Volver al portafolio",
  download: "Descargar PDF",
  file: "/downloads/CV-Sadiel-Rojas-Padilla-ES.pdf",
  location: "República Dominicana",
  headings: { education: "Educación", experience: "Experiencia", projects: "Proyectos", skills: "Habilidades e idiomas" },
  education: [
    { org: "Instituto Tecnológico de las Américas (ITLA)", degree: "Tecnólogo en Desarrollo de Software, enfoque Backend", dates: "2023 – Actualidad" },
    { org: "INFOTEP", degree: "Técnico en Mecatrónica", dates: "2022 – 2023" },
    { org: "Centro de Tecnología Universal (CENTU)", degree: "Técnico en Informática", dates: "2018 – 2019" },
  ],
  experience: [
    {
      org: "Kan-M Repostería y Catering (proyecto para cliente)",
      dates: "Mar 2026 – Actualidad",
      roles: [
        {
          title: "Líder Técnico y Arquitecto",
          dates: "",
          bullets: [
            "Diseñé y lideré un sistema de automatización por WhatsApp: API en FastAPI, panel web en Next.js y app Android, en tres repositorios integrados con PostgreSQL.",
            "Desarrollé el chatbot de atención al cliente (Gemini API, WhatsApp Cloud API) que resuelve preguntas frecuentes, delivery y cotizaciones, y escala a una persona los casos que requieren criterio.",
            "Construí el sitio público y el panel administrativo (Next.js, TypeScript, Prisma, Firebase), en producción: catálogo con carrito, cotizaciones, seguimiento de pedidos y reportes de ventas.",
            "Lideré requerimientos, pruebas funcionales y la auditoría previa al despliegue: 100% de casos de prueba cubiertos.",
          ],
        },
      ],
    },
    {
      org: "National Debt Relief / Broadway Support Services",
      dates: "May 2025 – Jul 2026",
      roles: [
        {
          title: "Analista de Enrutamiento de Leads",
          dates: "Feb 2026 – Jul 2026",
          bullets: [
            "Enruté leads en Salesforce y AWS en una operación de más de 500 agentes y más de 20,000 leads diarios, ajustando la distribución en tiempo real según el desempeño.",
            "Alineé la estrategia de enrutamiento con los líderes de Ventas e Ingresos para priorizar las metas del negocio.",
          ],
        },
        {
          title: "Analista de Tiempo Real (Workforce Management)",
          dates: "Oct 2025 – Feb 2026",
          bullets: [
            "Creé un reporte de SLA automatizado en Excel (Power Query, Power Pivot) que consolida más de 10 departamentos; adoptado en toda la empresa, ahorra más de 13 horas por semana.",
            "Mantuve el SLA sobre 90% en todos los departamentos, monitoreando adherencia y ocupación en Aspect WFM.",
            "Gestioné ~60 tickets operativos diarios y envié reportes diarios de KPI a los departamentos a mi cargo.",
          ],
        },
        {
          title: "Ejecutivo de Cuentas de Ventas",
          dates: "May 2025 – Oct 2025",
          bullets: [
            "Llevé cada venta de principio a fin para clientes de EE. UU. (descubrimiento, objeciones, cierre e inscripción), con desempeño constante en o por encima del promedio del equipo.",
          ],
        },
      ],
    },
    {
      org: "Alorica · Cuenta Verizon",
      dates: "Ene 2023 – May 2025",
      roles: [
        {
          title: "Coach de Soporte",
          dates: "",
          bullets: [
            "Brindé soporte técnico y coaching en inglés a agentes de primera línea para clientes de Verizon en EE. UU.",
            "Construí una automatización en Slack que enviaba métricas individuales a cada agente y dashboards automatizados en Google Sheets para un equipo de 15 agentes.",
          ],
        },
      ],
    },
  ],
  projects: [
    {
      name: "Finance Bot",
      stack: "Python, FastAPI, Groq (Llama 3.3), SQLAlchemy, pytest",
      link: { label: "github.com/4n1mah/finance-bot", href: "https://github.com/4n1mah/finance-bot" },
      bullets: [
        "Bot de WhatsApp que registra gastos en lenguaje natural, responde consultas por período o categoría y controla pagos fijos; desplegado en producción en Railway.",
      ],
    },
    {
      name: "Portafolio interactivo",
      stack: "Next.js, TypeScript, PixiJS, GSAP, Zustand",
      link: { label: "github.com/4n1mah/portfolio-CV", href: "https://github.com/4n1mah/portfolio-CV" },
      bullets: ["Plaza isométrica bilingüe con stands, personajes animados y versión simple accesible; desplegada en Vercel."],
    },
  ],
  skills: [
    { label: "Backend", items: "Python, FastAPI, Pydantic, Next.js, TypeScript, JavaScript, Git" },
    { label: "Bases de datos", items: "SQL, PostgreSQL, SQLAlchemy, Prisma, modelado de datos" },
    { label: "Integraciones e IA", items: "APIs REST, WhatsApp Business API, Gemini API, Groq, Firebase" },
    { label: "Pruebas y despliegue", items: "pytest, Vitest, Railway, Vercel" },
    { label: "Datos", items: "Pandas, NumPy, Excel avanzado (Power Query, Power Pivot), Tableau, Sigma Computing, Salesforce, AWS" },
    { label: "Idiomas", items: "Español (nativo), inglés (avanzado)" },
  ],
};

const en: Cv = {
  pageTitle: "CV — Sadiel Rojas Padilla",
  back: "← Back to the portfolio",
  download: "Download PDF",
  file: "/downloads/CV-Sadiel-Rojas-Padilla-EN.pdf",
  location: "Dominican Republic",
  headings: { education: "Education", experience: "Experience", projects: "Projects", skills: "Skills & Languages" },
  education: [
    { org: "Instituto Tecnológico de las Américas (ITLA)", degree: "Associate Degree in Software Development, Backend focus", dates: "2023 – Present" },
    { org: "INFOTEP", degree: "Mechatronics Technician", dates: "2022 – 2023" },
    { org: "Centro de Tecnología Universal (CENTU)", degree: "IT Technician", dates: "2018 – 2019" },
  ],
  experience: [
    {
      org: "Kan-M Repostería y Catering (client project)",
      dates: "Mar 2026 – Present",
      roles: [
        {
          title: "Technical Lead & Architect",
          dates: "",
          bullets: [
            "Designed and led a WhatsApp automation system: FastAPI backend, Next.js web panel and Android app, across three repositories integrated with PostgreSQL.",
            "Built the customer service chatbot (Gemini API, WhatsApp Cloud API) that handles FAQs, delivery and quotes, and escalates cases that need judgment to a person.",
            "Built the public website and admin panel (Next.js, TypeScript, Prisma, Firebase), live in production: catalog with cart, quotes, order tracking and sales reports.",
            "Led requirements, functional testing and the pre-deployment audit, reaching 100% test case coverage before production.",
          ],
        },
      ],
    },
    {
      org: "National Debt Relief / Broadway Support Services",
      dates: "May 2025 – Jul 2026",
      roles: [
        {
          title: "Lead Routing Analyst",
          dates: "Feb 2026 – Jul 2026",
          bullets: [
            "Routed leads through Salesforce and AWS in an operation of 500+ agents and 20,000+ leads per day, adjusting distribution in real time based on performance.",
            "Aligned routing strategy with Sales and Revenue leadership to prioritize business goals.",
          ],
        },
        {
          title: "Real-Time Analyst (Workforce Management)",
          dates: "Oct 2025 – Feb 2026",
          bullets: [
            "Built an automated SLA report in Excel (Power Query, Power Pivot) consolidating 10+ departments; adopted company-wide, it saves 13+ hours per week.",
            "Kept SLA above 90% in every department by monitoring adherence and occupancy across 5–6 campaigns in Aspect WFM.",
            "Handled ~60 operational tickets per day and sent daily KPI reports to the departments I supported.",
          ],
        },
        {
          title: "Sales Account Executive",
          dates: "May 2025 – Oct 2025",
          bullets: [
            "Owned every sale end to end for U.S. customers (discovery, objections, closing, enrollment), at or above the team average.",
          ],
        },
      ],
    },
    {
      org: "Alorica · Verizon Account",
      dates: "Jan 2023 – May 2025",
      roles: [
        {
          title: "Support Coach",
          dates: "",
          bullets: [
            "Provided technical support and coaching in English to front-line agents serving Verizon customers in the U.S.",
            "Built a Slack automation sending individual metrics to each agent, and automated Google Sheets dashboards for 15 agents.",
          ],
        },
      ],
    },
  ],
  projects: [
    {
      name: "Finance Bot",
      stack: "Python, FastAPI, Groq (Llama 3.3), SQLAlchemy, pytest",
      link: { label: "github.com/4n1mah/finance-bot", href: "https://github.com/4n1mah/finance-bot" },
      bullets: ["WhatsApp bot that logs expenses in natural language, answers queries by period or category and tracks fixed payments; deployed to production on Railway."],
    },
    {
      name: "Interactive portfolio",
      stack: "Next.js, TypeScript, PixiJS, GSAP, Zustand",
      link: { label: "github.com/4n1mah/portfolio-CV", href: "https://github.com/4n1mah/portfolio-CV" },
      bullets: ["Bilingual isometric plaza with booths, animated characters walking around it and an accessible simple version; deployed on Vercel."],
    },
  ],
  skills: [
    { label: "Backend", items: "Python, FastAPI, Pydantic, Next.js, TypeScript, JavaScript, Git" },
    { label: "Databases", items: "SQL, PostgreSQL, SQLAlchemy, Prisma, data modeling" },
    { label: "Integrations & AI", items: "REST APIs, WhatsApp Business API, Gemini API, Groq, Firebase" },
    { label: "Testing & deployment", items: "pytest, Vitest, Railway, Vercel" },
    { label: "Data", items: "Pandas, NumPy, advanced Excel (Power Query, Power Pivot), Tableau, Sigma Computing, Salesforce, AWS" },
    { label: "Languages", items: "Spanish (native), English (advanced)" },
  ],
};

export const cv: Record<Locale, Cv> = { es, en };
