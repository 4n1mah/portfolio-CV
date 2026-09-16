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
  /** Headline under the name: the job being applied for, in three words. */
  role: string;
  /** The three lines a recruiter reads before deciding to keep reading. */
  summary: string;
  headings: { summary: string; education: string; experience: string; projects: string; skills: string };
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
  role: "Desarrollador de Software · Backend",
  summary:
    "Desarrollador backend (Python · FastAPI · PostgreSQL) que llega al código desde la operación. Diseñé y lideré una plataforma de automatización por WhatsApp hoy en producción —API, panel web y app Android— y reportes automatizados que ahorran más de 13 horas por semana. Tres años atendiendo clientes y equipos en Estados Unidos, en inglés.",
  headings: { summary: "Perfil", education: "Educación", experience: "Experiencia", projects: "Proyectos", skills: "Habilidades e idiomas" },
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
            "Diseñé y lideré la plataforma completa: API en FastAPI, panel en Next.js y app Android sobre PostgreSQL.",
            "Desarrollé el chatbot (Gemini, WhatsApp Cloud API): resuelve pedidos y cotizaciones y escala el resto.",
            "Construí el sitio y el panel administrativo (Next.js, Prisma, Firebase): catálogo, pedidos y reportes de ventas.",
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
            "Enruté más de 20,000 leads diarios en Salesforce y AWS para una operación de más de 500 agentes.",
            "Alineé la estrategia de enrutamiento con los líderes de Ventas e Ingresos para priorizar las metas del negocio.",
          ],
        },
        {
          title: "Analista de Tiempo Real (Workforce Management)",
          dates: "Oct 2025 – Feb 2026",
          bullets: [
            "Automaticé el reporte de SLA de 10+ departamentos (Power Query, Power Pivot): ahorra 13 horas semanales.",
            "Mantuve el SLA sobre 90% en todos los departamentos, monitoreando adherencia y ocupación en Aspect WFM.",
            "Gestioné ~60 tickets operativos diarios y envié reportes diarios de KPI a los departamentos a mi cargo.",
          ],
        },
        {
          title: "Ejecutivo de Cuentas de Ventas",
          dates: "May 2025 – Oct 2025",
          bullets: [
            "Cerré ventas de principio a fin para clientes de EE. UU., con desempeño sobre el promedio del equipo.",
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
            "Automaticé en Slack el envío de métricas individuales y los dashboards de un equipo de 15 agentes.",
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
        "Bot de WhatsApp que registra gastos en lenguaje natural y controla pagos fijos; en producción en Railway.",
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
  role: "Software Developer · Backend",
  summary:
    "Backend developer (Python · FastAPI · PostgreSQL) who came to code through operations. Designed and led a WhatsApp automation platform now in production —API, web panel and Android app— and automated reporting that saves more than 13 hours a week. Three years supporting United States customers and teams, in English.",
  headings: { summary: "Profile", education: "Education", experience: "Experience", projects: "Projects", skills: "Skills & Languages" },
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
            "Designed and led the whole platform: FastAPI backend, Next.js panel and Android app over PostgreSQL.",
            "Built the support chatbot (Gemini, WhatsApp Cloud API): handles orders and quotes, escalates the rest.",
            "Built the public site and admin panel (Next.js, Prisma, Firebase): catalog, orders and sales reports.",
            "Led requirements, functional testing and the pre-deployment audit: 100% test case coverage.",
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
            "Routed 20,000+ leads a day through Salesforce and AWS for an operation of 500+ agents.",
            "Aligned routing strategy with Sales and Revenue leadership to prioritize business goals.",
          ],
        },
        {
          title: "Real-Time Analyst (Workforce Management)",
          dates: "Oct 2025 – Feb 2026",
          bullets: [
            "Automated the SLA report for 10+ departments (Power Query, Power Pivot): saves 13+ hours a week.",
            "Kept SLA above 90% in every department, monitoring adherence and occupancy in Aspect WFM.",
            "Handled ~60 operational tickets per day and sent daily KPI reports to the departments I supported.",
          ],
        },
        {
          title: "Sales Account Executive",
          dates: "May 2025 – Oct 2025",
          bullets: [
            "Owned every sale end to end for U.S. customers, at or above the team average.",
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
            "Supported and coached front-line agents in English for Verizon customers in the U.S.",
            "Automated the Slack delivery of individual metrics and the Google Sheets dashboards for 15 agents.",
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
      bullets: ["WhatsApp bot that logs expenses in natural language and tracks fixed payments; live on Railway."],
    },
    {
      name: "Interactive portfolio",
      stack: "Next.js, TypeScript, PixiJS, GSAP, Zustand",
      link: { label: "github.com/4n1mah/portfolio-CV", href: "https://github.com/4n1mah/portfolio-CV" },
      bullets: ["Bilingual isometric plaza with booths, animated characters and an accessible simple version; on Vercel."],
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
