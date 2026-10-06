export function openInGoogleMaps(
  salonName: string,
  address: string,
  lat?: number,
  lng?: number
) {
  const safeName = (salonName || '').trim();
  const safeAddress = (address || '').trim();

  let query = '';

  if (typeof lat === 'number' && typeof lng === 'number') {
    // Precise destination using coordinates + name
    query = `${safeName}, ${lat}, ${lng}`;
  } else if (safeAddress) {
    // Destination using encoded name + address
    query = `${safeName}, ${safeAddress}`;
  } else {
    console.error('[GlowSlot] Salon location is unavailable.');
    return;
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  // Open in new tab - browser/OS will handle redirect to Google Maps app if installed
  window.open(mapUrl, '_blank', 'noopener,noreferrer');
}
