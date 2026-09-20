import type { StandId } from "@/lobby/store";

// El tablero de la plaza cuenta qué secciones se abren. La API vive en otro proyecto (portfolio-api).
// No se guardan cookies ni datos personales: solo un identificador al azar por pestaña.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SESSION_KEY = "portfolio-session";

export interface SectionStat {
  section: StandId;
  visits: number;
}

export interface Stats {
  total: number;
  sections: SectionStat[];
  /** Periodo contado; null cuando son todas las visitas desde el inicio. */
  days: number | null;
  /** Momento en que la API calculó estos números (ISO, en UTC). */
  generated_at: string;
}

/** Identificador al azar de esta pestaña; la API cuenta una visita por sesión y sección. */
function sessionId(): string {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Modo privado o almacenamiento bloqueado: un id nuevo, sin guardar.
    return crypto.randomUUID();
  }
}

/** Secciones ya enviadas en esta carga de la página, para no repetir la petición. */
const sent = new Set<StandId>();

/** Registra la apertura de una sección. Si falla, el visitante no se entera: son estadísticas, no contenido. */
export function recordVisit(section: StandId): void {
  if (sent.has(section)) return;
  sent.add(section);
  fetch(`${API_URL}/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, session_id: sessionId() }),
  }).catch(() => {
    // Sin red: que se pueda reintentar la próxima vez que abran la sección.
    sent.delete(section);
  });
}

/**
 * Las estadísticas para el tablero; null si la API no responde.
 * `days` limita el conteo a los últimos N días. `fresh` se salta la caché de 30 segundos
 * que pide la API, para cuando acabamos de registrar una visita y queremos verla reflejada.
 */
export async function fetchStats({ days, fresh }: { days?: number; fresh?: boolean } = {}): Promise<Stats | null> {
  const url = new URL(`${API_URL}/visits/stats`);
  if (days) url.searchParams.set("days", String(days));
  try {
    const res = await fetch(url, fresh ? { cache: "no-store" } : undefined);
    if (!res.ok) return null;
    return (await res.json()) as Stats;
  } catch {
    return null;
  }
}
