// Supabase Edge Function: process-reengagement-reminders
// Identifies completed bookings > 30 days old and prepares/sends WhatsApp re-engagement reminders safely.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface ReengagementRequestPayload {
  test_mode?: boolean;
  days_old?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const hasProvider = Boolean(whatsappApiKey);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: ReengagementRequestPayload = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        // use default empty body
      }
    }

    const isTestMode = body.test_mode ?? true; // TEST MODE active by default
    const daysOld = body.days_old ?? 30;

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

    // 1. Query eligible completed bookings older than specified days (default 30)
    const { data: eligibleBookings, error: fetchErr } = await supabase
      .from("bookings")
      .select("id, user_id, salon_id, created_at, profiles(full_name, phone), salons(name)")
      .eq("status", "completed")
      .lte("created_at", cutoffDate);

    if (fetchErr) {
      console.error("[Reengagement Error] Fetching eligible bookings failed:", fetchErr);
      return new Response(
        JSON.stringify({ error: "Failed to query eligible bookings", details: fetchErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidates = eligibleBookings || [];
    let createdCount = 0;
    let skippedDuplicateCount = 0;
    let noPhoneCount = 0;
    let processedCount = 0;

    const reminderType = "30_day_reengagement";

    // 2. Process each candidate with strict duplicate check
    for (const booking of candidates) {
      const bookingId = String(booking.id);
      const userId = String(booking.user_id || "unknown-user");
      const salonId = booking.salon_id ? String(booking.salon_id) : undefined;
      const salonName = (booking.salons as any)?.name || "GlowSlot Salon";
      const customerName = (booking.profiles as any)?.full_name || "Valued Customer";
      const rawPhone = (booking.profiles as any)?.phone || "";

      // Check if reminder record already exists (Idempotency)
      const { data: existing } = await supabase
        .from("booking_reengagement_reminders")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("reminder_type", reminderType)
        .maybeSingle();

      if (existing) {
        skippedDuplicateCount++;
        continue;
      }

      processedCount++;

      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
      let status = "pending";

      if (!cleanPhone) {
        status = "skipped_no_phone";
        noPhoneCount++;
      } else if (!hasProvider && !isTestMode) {
        status = "no_provider";
      } else {
        status = "pending";
      }

      const bookingLink = salonId
        ? `https://glowslot.app/?salonId=${salonId}`
        : "https://glowslot.app/";

      const messageText = `Hi ${customerName} 👋\n\nIt's been a while since your last visit to ${salonName}.\n\nReady for your next beauty & grooming session?\n\nBook your next appointment with GlowSlot:\n${bookingLink}\n\n— GlowSlot`;

      const whatsappUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
        : undefined;

      // 3. Create reminder record with UNIQUE constraint protection
      const { error: insertErr } = await supabase
        .from("booking_reengagement_reminders")
        .upsert(
          {
            booking_id: bookingId,
            user_id: userId,
            salon_id: salonId,
            phone: cleanPhone || null,
            reminder_type: reminderType,
            scheduled_at: new Date().toISOString(),
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "booking_id,reminder_type" }
        );

      if (!insertErr) {
        createdCount++;
      } else {
        console.warn(`[Reengagement] Upsert skipped or failed for booking ${bookingId}:`, insertErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_eligible: candidates.length,
        processed: processedCount,
        created: createdCount,
        skipped_duplicates: skippedDuplicateCount,
        no_phone: noPhoneCount,
        has_whatsapp_provider: hasProvider,
        test_mode: isTestMode,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Reengagement Exception]", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
