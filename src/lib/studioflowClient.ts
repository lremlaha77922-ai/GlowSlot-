import { createClient } from '@supabase/supabase-js';

/**
 * Second Supabase client: the StudioFlow white-label platform project.
 * Salon websites, published content, availability, bookings and deposits live there,
 * so the website and this app always read/write the same data.
 *
 * The publishable key is safe in the browser (RLS + RPC protected) and is the same
 * key the StudioFlow website itself ships with. Override via env if the project changes.
 */
const STUDIOFLOW_URL =
  (import.meta.env.VITE_STUDIOFLOW_SUPABASE_URL as string | undefined) ||
  'https://zilwgiuiygqqardzutxi.supabase.co';
const STUDIOFLOW_KEY =
  (import.meta.env.VITE_STUDIOFLOW_SUPABASE_KEY as string | undefined) ||
  'sb_publishable_Xck8H8PcTCCnEwkvBfiSLw_c973vJkH';

export const studioflowClient = createClient(STUDIOFLOW_URL, STUDIOFLOW_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Separate storage key so it never collides with the GlowSlot (qesvnusgljnhnhswslva) session.
    storageKey: 'glowslot_studioflow_session',
  },
});

export const isStudioflowEnabled = (): boolean =>
  import.meta.env.VITE_STUDIOFLOW_DISABLED !== 'true' && import.meta.env.VITE_USE_MOCK_DATA !== 'true';
