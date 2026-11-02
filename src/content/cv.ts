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
  /** Right side of the organization line, Harvard style: "City, Country". */
  location: string;
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
  education: { org: string; location: string; degree: string; dates: string }[];
  experience: CvEntry[];
  projects: { name: string; stack: string; link?: { label: string; href: string }; bullets: string[] }[];
  skills: { label: string; items: string }[];
}

export const cvContact = [
  { label: profile.site.replace("https://", ""), href: profile.site },
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
  role: "Desarrollador de Software",
  summary:
    "Desarrollador de software que lleva productos de la arquitectura al despliegue: servicios en Python y FastAPI, interfaces en Next.js y TypeScript sobre PostgreSQL. Construí la plataforma completa de Kan-M —bot de WhatsApp, sitio, panel y app Android—, hoy en uso diario. Vengo de operaciones: parto del proceso de negocio, no del código. Inglés avanzado.",
  headings: { summary: "Perfil", education: "Educación", experience: "Experiencia", projects: "Proyectos", skills: "Habilidades e idiomas" },
  education: [
    { org: "Instituto Tecnológico de las Américas (ITLA)", location: "Santo Domingo, R.D.", degree: "Tecnólogo en Desarrollo de Software", dates: "2023 – Actualidad" },
    { org: "INFOTEP", location: "Santo Domingo, R.D.", degree: "Técnico en Mecatrónica", dates: "2022 – 2023" },
    { org: "Centro de Tecnología Universal (CENTU)", location: "Santo Domingo, R.D.", degree: "Técnico en Informática", dates: "2018 – 2019" },
  ],
  experience: [
    {
      org: "Data Vimenca",
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Analista de Tiempo Real (Workforce Management)",
          dates: "Sep 2026 – Actualidad",
          bullets: [
            "Monitoreo la operación en vivo y coordino los ajustes cuando las métricas del día se desvían.",
            "Codifico actividades y excepciones de agentes en el sistema de WFM para que los horarios reflejen la operación real.",
          ],
        },
      ],
    },
    {
      org: "Kan-M Repostería y Catering (proyecto para cliente)",
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Líder Técnico y Arquitecto",
          dates: "Mar 2026 – Actualidad",
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
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Analista de Enrutamiento de Leads",
          dates: "Feb 2026 – Jul 2026",
          bullets: [
            "Enruté más de 20,000 leads diarios en Salesforce y AWS para una operación de más de 500 agentes.",
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
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Coach de Soporte",
          dates: "Ene 2023 – May 2025",
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
    { label: "Lenguajes y frameworks", items: "Python, FastAPI, Pydantic, TypeScript, JavaScript, React, Next.js, Git" },
    { label: "Bases de datos", items: "SQL, PostgreSQL, SQLAlchemy, Prisma, modelado de datos" },
    { label: "Integraciones e IA", items: "APIs REST, WhatsApp Business API, Gemini API, Groq, Firebase" },
    { label: "Pruebas y despliegue", items: "pytest, Vitest, Railway, Vercel" },
    { label: "Datos", items: "Pandas, NumPy, Excel avanzado (Power Query, Power Pivot), Salesforce, AWS" },
    { label: "Idiomas", items: "Español (nativo), inglés (avanzado)" },
  ],
};

const en: Cv = {
  pageTitle: "CV — Sadiel Rojas Padilla",
  back: "← Back to the portfolio",
  download: "Download PDF",
  file: "/downloads/CV-Sadiel-Rojas-Padilla-EN.pdf",
  location: "Dominican Republic",
  role: "Software Developer",
  summary:
    "Software developer who takes products from architecture to deployment: Python and FastAPI services, Next.js and TypeScript interfaces over PostgreSQL. Built the whole Kan-M platform — WhatsApp bot, site, admin panel and Android app — in daily use today. I start from the business process, not the code. Advanced English.",
  headings: { summary: "Profile", education: "Education", experience: "Experience", projects: "Projects", skills: "Skills & Languages" },
  education: [
    { org: "Instituto Tecnológico de las Américas (ITLA)", location: "Santo Domingo, R.D.", degree: "Associate Degree in Software Development", dates: "2023 – Present" },
    { org: "INFOTEP", location: "Santo Domingo, R.D.", degree: "Mechatronics Technician", dates: "2022 – 2023" },
    { org: "Centro de Tecnología Universal (CENTU)", location: "Santo Domingo, R.D.", degree: "IT Technician", dates: "2018 – 2019" },
  ],
  experience: [
    {
      org: "Data Vimenca",
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Real-Time Analyst (Workforce Management)",
          dates: "Sep 2026 – Present",
          bullets: [
            "Monitor the operation live and coordinate adjustments when the day's metrics drift off target.",
            "Code agent activities and exceptions in the WFM system so schedules reflect the real operation.",
          ],
        },
      ],
    },
    {
      org: "Kan-M Repostería y Catering (client project)",
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Technical Lead & Architect",
          dates: "Mar 2026 – Present",
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
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Lead Routing Analyst",
          dates: "Feb 2026 – Jul 2026",
          bullets: [
            "Routed 20,000+ leads a day through Salesforce and AWS for an operation of 500+ agents.",
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
      location: "Santo Domingo, R.D.",
      roles: [
        {
          title: "Support Coach",
          dates: "Jan 2023 – May 2025",
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
    { label: "Languages & frameworks", items: "Python, FastAPI, Pydantic, TypeScript, JavaScript, React, Next.js, Git" },
    { label: "Databases", items: "SQL, PostgreSQL, SQLAlchemy, Prisma, data modeling" },
    { label: "Integrations & AI", items: "REST APIs, WhatsApp Business API, Gemini API, Groq, Firebase" },
    { label: "Testing & deployment", items: "pytest, Vitest, Railway, Vercel" },
    { label: "Data", items: "Pandas, NumPy, advanced Excel (Power Query, Power Pivot), Salesforce, AWS" },
    { label: "Languages", items: "Spanish (native), English (advanced)" },
  ],
};

export const cv: Record<Locale, Cv> = { es, en };
