/**
 * URL and referral link generation utilities.
 * Handles environment-aware origins (window.location.origin in browser, or production glowslot.app).
 */

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    // If running in development or custom domain/preview, use the current active origin
    return window.location.origin;
  }
  return 'https://glowslot.app';
}

/**
 * Builds a valid, safely encoded referral invite URL.
 * Supports explicit domain override or dynamic origin.
 */
export function buildReferralInviteUrl(referralCode: string, origin?: string): string {
  const base = origin || getAppBaseUrl();
  const cleanCode = encodeURIComponent(referralCode.trim());
  return `${base}/invite?ref=${cleanCode}`;
}

/**
 * Generates the WhatsApp share URL with pre-filled message and invite link.
 */
export function buildWhatsAppShareUrl(referralCode: string, inviteUrl: string): string {
  const message = `Hey! Use my invite code ${referralCode} to get flat Rs.100 off your first salon appointment on Nexora! Join and book here: ${inviteUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
