import { getSupabaseClient, getSupabaseConfig } from '@/lib/supabase';

/**
 * Guest list for THIS invite only (Baraat & Waleema).
 * Never use `rsvps` — that table is for the full Noor-e-Safar link.
 */
export const RSVP_TABLE = 'rsvps_baraat_waleema' as const;

export type RSVPSubmission = {
  id?: string;
  name: string;
  response: 'yes' | 'no';
  events: string[];
  guests: number;
  message: string;
  submittedAt: string;
};

export interface RSVPService {
  submit(data: RSVPSubmission): Promise<void>;
  getAll(): Promise<RSVPSubmission[]>;
  clearAll(): Promise<void>;
  hasSubmitted(): boolean;
  getLast(): RSVPSubmission | null;
}

class LocalRSVPService implements RSVPService {
  private key = 'baraat-waleema-rsvp';
  private listKey = 'baraat-waleema-rsvp-list';

  async submit(data: RSVPSubmission) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      const existingList = await this.getAll();
      const updatedList = [data, ...existingList.filter((item) => item.name.toLowerCase() !== data.name.toLowerCase())];
      localStorage.setItem(this.listKey, JSON.stringify(updatedList));
    } catch {
      // fallback
    }
  }

  hasSubmitted() {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem(this.key));
  }

  getLast(): RSVPSubmission | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async getAll(): Promise<RSVPSubmission[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.listKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async clearAll() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.listKey);
      localStorage.removeItem(this.key);
    } catch {
      // fallback
    }
  }
}

type RsvpRow = {
  id: string;
  name: string;
  response: 'yes' | 'no';
  events: string[] | null;
  guests: number;
  message: string | null;
  submitted_at: string;
};

function rowToSubmission(row: RsvpRow): RSVPSubmission {
  return {
    id: row.id,
    name: row.name,
    response: row.response,
    events: row.events ?? [],
    guests: row.guests ?? 0,
    message: row.message ?? '',
    submittedAt: row.submitted_at,
  };
}

class SupabaseRSVPService implements RSVPService {
  private key = 'baraat-waleema-rsvp';

  async submit(data: RSVPSubmission) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.from(RSVP_TABLE).insert({
      name: data.name,
      response: data.response,
      events: data.events,
      guests: data.guests,
      message: data.message,
      submitted_at: data.submittedAt,
    });

    if (error) {
      throw error;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch {
        // ignore local cache failures
      }
    }
  }

  hasSubmitted() {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem(this.key));
  }

  getLast(): RSVPSubmission | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async getAll(): Promise<RSVPSubmission[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(RSVP_TABLE)
      .select('id, name, response, events, guests, message, submitted_at')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data as RsvpRow[] | null)?.map(rowToSubmission) ?? [];
  }

  async clearAll() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    // PostgREST requires a filter for deletes; this matches every row in THIS invite's table.
    const { error } = await supabase
      .from(RSVP_TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      throw error;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.key);
      } catch {
        // ignore local cache failures
      }
    }
  }
}

function createRsvpService(): RSVPService {
  const adapter = process.env.NEXT_PUBLIC_RSVP_ADAPTER?.trim().toLowerCase();
  const { isConfigured } = getSupabaseConfig();

  if (adapter === 'supabase' || (adapter !== 'local' && isConfigured)) {
    if (!isConfigured) {
      console.warn('RSVP adapter is supabase but Supabase env vars are missing; falling back to local.');
      return new LocalRSVPService();
    }
    return new SupabaseRSVPService();
  }

  return new LocalRSVPService();
}

export const rsvpService: RSVPService = createRsvpService();
