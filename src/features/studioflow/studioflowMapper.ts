import type { PromoBanner, ReviewItem, Salon, SalonServiceItem, SlotItem, SpecialistItem } from '../../types';

/** Every StudioFlow website is exposed in GlowSlot with this id prefix: `sf:<slug>`. */
export const SF_PREFIX = 'sf:';
export const isStudioflowId = (id?: string | null): boolean => !!id && id.startsWith(SF_PREFIX);
export const salonIdFromSlug = (slug: string) => `${SF_PREFIX}${slug}`;
export const slugFromSalonId = (id: string) => id.slice(SF_PREFIX.length);

/** Slot ids encode everything needed to book: sf:<slug>|<serviceId>|<YYYY-MM-DD>|<HH:mm>|<stylistId> */
export const buildSlotId = (slug: string, serviceId: string, date: string, time: string, stylistId = 'any') =>
  `${SF_PREFIX}${slug}|${serviceId}|${date}|${time}|${stylistId}`;

export function parseSlotId(slotId: string) {
  if (!isStudioflowId(slotId)) return null;
  const [slug, serviceId, date, time, stylistId] = slotId.slice(SF_PREFIX.length).split('|');
  if (!slug || !serviceId || !date || !time) return null;
  return { slug, serviceId, date, time, stylistId: stylistId || 'any' };
}

export interface PublishedWebsiteRow {
  slug: string;
  content: any;
  published_at?: string;
  owner_id?: string;
}

const toPaise = (rupees: unknown) => Math.round(Number(rupees || 0) * 100);

export function mapServices(content: any): SalonServiceItem[] {
  return (Array.isArray(content?.services) ? content.services : []).map((s: any) => ({
    id: String(s.id),
    name: String(s.name || 'Service'),
    category: String(s.category || 'General'),
    gender: 'unisex' as const,
    durationMin: Math.max(1, Number(s.durationMinutes) || 30),
    basePrice: toPaise(s.price),
    description: s.description || undefined,
    isPopular: !!s.popular,
  }));
}

export function mapSpecialists(content: any): SpecialistItem[] {
  return (Array.isArray(content?.stylists) ? content.stylists : [])
    .filter((s: any) => (s.status ?? 'Available') !== 'Inactive')
    .map((s: any) => ({
      id: String(s.id),
      name: String(s.name || 'Specialist'),
      role: s.role || 'Specialist',
      rating: Number(s.rating) || 0,
      experienceYears: 0,
      photoUrl: s.avatarUrl || '',
      earliestSlot: '',
      specialties: Array.isArray(s.specialties) ? s.specialties : [],
      bio: s.bio || undefined,
    }));
}

export function mapReviews(content: any): ReviewItem[] {
  const list = content?.profile?.websiteTestimonials;
  return (Array.isArray(list) ? list : [])
    .filter((t: any) => (t.status ?? 'approved') === 'approved' && t.approved !== false)
    .map((t: any) => ({
      id: String(t.id),
      authorName: t.name || 'Customer',
      rating: Number(t.rating) || 5,
      date: t.date || '',
      tags: t.serviceName ? [t.serviceName] : [],
      comment: t.comment || '',
      userAvatar: t.avatarUrl || undefined,
    }));
}

function activePromo(profile: any) {
  const p = profile?.promotions;
  if (p?.enabled) {
    const exp = p.expiryDate ? new Date(p.expiryDate).getTime() : NaN;
    if (Number.isNaN(exp) || exp > Date.now()) return p;
  }
  return null;
}

export function mapWebsiteToSalon(row: PublishedWebsiteRow, opts: { distanceKm?: number } = {}): Salon {
  const content = row.content || {};
  const profile = content.profile || {};
  const services = mapServices(content);
  const reviews = mapReviews(content);
  const gallery: string[] = Array.isArray(content.gallery) ? content.gallery.filter(Boolean) : [];
  const images = [profile.coverImageUrl, ...gallery].filter(Boolean);
  const promo = activePromo(profile);
  const campaign = profile.promoCampaign?.enabled ? profile.promoCampaign : null;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const addressParts = [profile.shopFlatNo, profile.address, profile.areaLocality, profile.city, profile.postalCode].filter(Boolean);

  return {
    id: salonIdFromSlug(row.slug),
    name: profile.businessName || row.slug,
    area: profile.areaLocality || profile.city || '',
    city: profile.city || '',
    address: addressParts.join(', '),
    distanceKm: opts.distanceKm ?? 0,
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
    startingPrice: services.length ? Math.min(...services.map((s) => s.basePrice)) : 0,
    isOpen: true,
    openingHours: profile.workingHoursMonFri || '',
    images,
    gender: 'unisex',
    categories: Array.from(new Set(services.map((s) => s.category))),
    isVerified: true,
    badgeType: 'VERIFIED',
    isDeal: !!(promo || campaign),
    dealDiscountPercent: Number(promo?.discountPercent ?? campaign?.discountPercent) || undefined,
    aboutText: profile.about || profile.tagline || '',
    amenities: [],
    latitude: profile.latitude != null ? Number(profile.latitude) : undefined,
    longitude: profile.longitude != null ? Number(profile.longitude) : undefined,
    services,
    packages: [],
    reviews,
    specialists: mapSpecialists(content),
  };
}

export function mapWebsiteToBanner(row: PublishedWebsiteRow): PromoBanner | null {
  const profile = row.content?.profile || {};
  const promo = activePromo(profile);
  const campaign = profile.promoCampaign?.enabled ? profile.promoCampaign : null;
  if (!promo && !campaign) return null;
  return {
    id: `${SF_PREFIX}banner:${row.slug}`,
    title: promo?.title || campaign?.headline || profile.businessName,
    subtitle: promo?.message || campaign?.customOfferText || campaign?.subtext || '',
    tag: promo?.promoCode || campaign?.promoCode || promo?.highlightBadge || 'OFFER',
    bgGradient: 'from-primary to-accent',
    imageUrl: promo?.imageUrl || campaign?.imageUrl || undefined,
    link: salonIdFromSlug(row.slug),
  };
}

export function mapAvailabilityToSlots(
  slug: string,
  serviceId: string,
  date: string,
  basePricePaise: number,
  rows: Array<{ time: string; available: boolean; stylistId?: string }>,
  stylistId = 'any'
): SlotItem[] {
  return rows.map((r) => ({
    id: buildSlotId(slug, serviceId, date, r.time, stylistId),
    salonId: salonIdFromSlug(slug),
    serviceId,
    date,
    time: r.time,
    price: basePricePaise,
    isFree: false,
    isPeak: false,
    status: r.available ? 'available' : 'booked',
  }));
}
