import React, { useState, useMemo, useEffect } from 'react';
import { Salon, SalonServiceItem, SpecialistItem, SlotItem } from '../../../types';
import { defaultSpecialists } from '../../../data/mockData';
import { slotService } from '../../slots/services/slotService';
import { formatMoney } from '../../../utils/money';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';
import {
  Plus,
  Check,
  Clock,
  Star,
  UserCheck,
  Scissors,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Tag,
  Gift,
  CheckCircle2,
  Receipt,
  Sparkles,
  CalendarDays,
  FileText,
  User,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  specialInstructions?: string;
}

export interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  initialSelectedServiceIds?: string[];
  onContinue: (
    salon: Salon,
    selectedServices: SalonServiceItem[],
    selectedSpecialist: SpecialistItem | null,
    selectedSlot: SlotItem,
    pricingSummary: {
      subtotal: number;
      discount: number;
      total: number;
      deposit: number;
      balanceAtSalon: number;
      couponCode?: string;
    },
    customerDetails?: CustomerDetails
  ) => void;
  onConfirmBooking?: (
    salon: Salon,
    selectedServices: SalonServiceItem[],
    selectedSpecialist: SpecialistItem | null,
    selectedSlot: SlotItem,
    pricingSummary: {
      subtotal: number;
      discount: number;
      total: number;
      deposit: number;
      balanceAtSalon: number;
      couponCode?: string;
    },
    customerDetails: CustomerDetails
  ) => void;
}

const COUPONS: Record<string, { discountPaise?: number; percent?: number; name: string }> = {
  GLOW100: { discountPaise: 10000, name: 'Flat ₹100 OFF' },
  FESTIVE20: { percent: 20, name: '20% Festive Discount' },
  FIRSTGLOW: { discountPaise: 15000, name: 'First Booking ₹150 OFF' },
};

const format12HourTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const displayH = h < 10 ? `0${h}` : `${h}`;
  return `${displayH}:${m} ${ampm}`;
};

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  isOpen,
  onClose,
  salon,
  initialSelectedServiceIds,
  onContinue,
  onConfirmBooking,
}) => {
  const { showToast } = useUIStore();
  const { user } = useSessionStore();

  const services = salon.services || [];
  const specialists = salon.specialists || defaultSpecialists;

  // 1. Multi-service selection state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Sync initialSelectedServiceIds when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedServiceIds && initialSelectedServiceIds.length > 0) {
        setSelectedServiceIds(initialSelectedServiceIds);
      } else if (services.length > 0) {
        setSelectedServiceIds([services[0].id]);
      }
    }
  }, [isOpen, initialSelectedServiceIds, services]);

  // 2. Specialist selection state (null = "Any Specialist")
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistItem | null>(
    specialists[0] || null
  );

  // 3. Date & Slot selection state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(
    () => new Date(Date.now() + 86400000).toISOString().split('T')[0],
    []
  );

  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [slotsList, setSlotsList] = useState<SlotItem[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState<boolean>(false);

  // 4. Coupon state
  const [couponInput, setCouponInput] = useState<string>('GLOW100');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; name: string; discountPaise: number } | null>(null);

  // 5. Special Instructions & Customer Details State
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Aarav Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState<string>('aarav@glowslot.com');

  // Sync user details from logged in profile
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Validation status for required customer details
  const isDetailsValid = useMemo(() => {
    const nameValid = customerName.trim().length >= 2;
    const phoneClean = customerPhone.replace(/\D/g, '');
    const phoneValid = phoneClean.length >= 10;
    return nameValid && phoneValid;
  }, [customerName, customerPhone]);

  const activeDateStr = useMemo(() => {
    if (dateMode === 'today') return todayStr;
    if (dateMode === 'tomorrow') return tomorrowStr;
    return customDate || todayStr;
  }, [dateMode, todayStr, tomorrowStr, customDate]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const selectedServices = useMemo(() => {
    return services.filter((srv) => selectedServiceIds.includes(srv.id));
  }, [services, selectedServiceIds]);

  const subtotalPrice = useMemo(() => {
    return selectedServices.reduce((sum, srv) => sum + srv.basePrice, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, srv) => sum + srv.durationMin, 0);
  }, [selectedServices]);

  // Fetch live time slots whenever activeDateStr or subtotalPrice changes
  useEffect(() => {
    let isMounted = true;
    const loadSlots = async () => {
      setIsFetchingSlots(true);
      const primaryServiceId = selectedServices[0]?.id || 'srv-101';
      const items = await slotService.listByDay(
        salon.id,
        primaryServiceId,
        activeDateStr,
        subtotalPrice || 24900,
        user?.id
      );

      if (isMounted) {
        const availableOnly = items.filter(
          (s) => s.status === 'available' || s.status === 'held'
        );
        setSlotsList(availableOnly);

        if (availableOnly.length > 0 && (!selectedSlot || !availableOnly.some((s) => s.id === selectedSlot.id))) {
          setSelectedSlot(availableOnly[0]);
        }
        setIsFetchingSlots(false);
      }
    };

    if (isOpen) {
      loadSlots();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, salon.id, activeDateStr, subtotalPrice, selectedServices, user?.id]);

  // Apply Coupon Logic
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code');
      return;
    }

    const found = COUPONS[code];
    if (found) {
      let discountPaise = 0;
      if (found.discountPaise) {
        discountPaise = found.discountPaise;
      } else if (found.percent) {
        discountPaise = Math.round((subtotalPrice * found.percent) / 100);
      }

      discountPaise = Math.min(discountPaise, subtotalPrice - 5000);
      setAppliedCoupon({ code, name: found.name, discountPaise });
      showToast(`Coupon '${code}' applied successfully!`);
    } else {
      showToast('Invalid coupon code. Try GLOW100 or FESTIVE20');
    }
  };

  // Pricing Summary Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const totalAmount = Math.max(0, subtotalPrice - discountAmount);
  const depositAmount = Math.round(totalAmount * 0.15);
  const balanceAtSalon = Math.max(0, totalAmount - depositAmount);

  const getDetailsPayload = (): CustomerDetails => ({
    name: customerName.trim(),
    phone: customerPhone.trim(),
    email: customerEmail.trim() || undefined,
    specialInstructions: specialInstructions.trim() || undefined,
  });

  const getPricingPayload = () => ({
    subtotal: subtotalPrice,
    discount: discountAmount,
    total: totalAmount,
    deposit: depositAmount,
    balanceAtSalon,
    couponCode: appliedCoupon?.code,
  });

  const handleReviewSummary = () => {
    if (selectedServices.length === 0) {
      showToast('Please select at least 1 service');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select a time slot to continue');
      return;
    }
    if (!isDetailsValid) {
      showToast('Please provide a valid Name and Contact number');
      return;
    }

    onContinue(
      salon,
      selectedServices,
      selectedSpecialist,
      selectedSlot,
      getPricingPayload(),
      getDetailsPayload()
    );
    onClose();
  };

  const handleConfirmBooking = () => {
    if (selectedServices.length === 0) {
      showToast('Please select at least 1 service');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select a time slot');
      return;
    }
    if (!isDetailsValid) {
      showToast('Please provide a valid Name and Contact number');
      return;
    }

    if (onConfirmBooking) {
      onConfirmBooking(
        salon,
        selectedServices,
        selectedSpecialist,
        selectedSlot,
        getPricingPayload(),
        getDetailsPayload()
      );
    } else {
      onContinue(
        salon,
        selectedServices,
        selectedSpecialist,
        selectedSlot,
        getPricingPayload(),
        getDetailsPayload()
      );
    }
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Book Appointment">
      <div className="flex flex-col gap-6 pb-36">
        {/* Salon Summary Badge */}
        <div className="bg-primary-soft/40 p-3 rounded-card border border-primary/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-text">{salon.name}</h3>
              <ShieldCheck size={14} className="text-primary fill-primary/10" />
            </div>
            <p className="text-[11px] text-muted">{salon.area} • {salon.city}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-deal bg-deal/10 px-2 py-1 rounded-chip">
            <Star size={12} className="fill-deal text-deal" />
            <span>{salon.rating}</span>
          </div>
        </div>

        {/* SECTION 1: Select Services */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm font-bold text-text">Select Services</h2>
            </div>
            <span className="text-[11px] text-muted font-medium">Multiple selection enabled</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {services.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3 rounded-card border transition-all duration-150 cursor-pointer flex gap-3 relative ${
                    isSelected
                      ? 'border-primary bg-primary-soft/30 shadow-level-1'
                      : 'border-border/80 bg-surface hover:border-primary/40'
                  }`}
                >
                  {/* Service Image / Icon */}
                  <div className="w-14 h-14 rounded-button bg-muted/20 shrink-0 overflow-hidden relative">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-soft text-primary">
                        <Scissors size={20} />
                      </div>
                    )}

                    {service.isPopular && (
                      <span className="absolute top-1 left-1 text-[7px] font-black uppercase px-1 py-0.5 rounded-chip bg-deal text-stone-900 shadow-xs">
                        POPULAR
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
                    <div>
                      <h3 className="text-xs font-bold text-text truncate">{service.name}</h3>
                      {service.description && (
                        <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50 text-[11px]">
                      <span className="text-muted flex items-center gap-1 font-medium">
                        <Clock size={11} /> {service.durationMin} mins
                      </span>
                      <span className="font-bold text-text tabular-nums">
                        {formatMoney(service.basePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Add / Remove Action Button */}
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(service.id);
                      }}
                      className={`py-1 px-2.5 rounded-chip text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface border border-border text-text hover:bg-primary-soft'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={11} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={11} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Services Summary Box */}
          {selectedServices.length > 0 && (
            <div className="bg-surface rounded-card border border-border p-3 flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                <div>
                  <span className="font-bold text-text">{selectedServices.length} Services Selected</span>
                  <span className="text-muted block text-[10px]">
                    Total Duration: {totalDuration} mins
                  </span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-primary tabular-nums">
                {formatMoney(subtotalPrice)}
              </span>
            </div>
          )}
        </section>

        {/* SECTION 2: Select Specialist / Stylist */}
        <section className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm font-bold text-text">Select Specialist / Stylist</h2>
            </div>
            <span className="text-[11px] text-muted">Optional</span>
          </div>

          {/* Specialist Option Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Any Specialist Option */}
            <div
              onClick={() => setSelectedSpecialist(null)}
              className={`p-2.5 rounded-card border cursor-pointer transition-all flex items-center gap-2.5 ${
                selectedSpecialist === null
                  ? 'border-primary bg-primary-soft/40 ring-1 ring-primary'
                  : 'border-border/80 bg-surface hover:border-primary/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-text">Any Specialist</h4>
                <p className="text-[10px] text-muted">First available stylist</p>
              </div>
              {selectedSpecialist === null && (
                <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check size={10} />
                </div>
              )}
            </div>

            {/* Individual Specialists */}
            {specialists.map((spec) => {
              const isSpecSelected = selectedSpecialist?.id === spec.id;

              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecialist(spec)}
                  className={`p-2.5 rounded-card border cursor-pointer transition-all flex items-center gap-2.5 ${
                    isSpecSelected
                      ? 'border-primary bg-primary-soft/40 ring-1 ring-primary'
                      : 'border-border/80 bg-surface hover:border-primary/30'
                  }`}
                >
                  <img
                    src={spec.photoUrl}
                    alt={spec.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-border"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-text truncate">{spec.name}</h4>
                      <div className="flex items-center text-[10px] font-bold text-deal shrink-0">
                        <Star size={10} className="fill-deal text-deal" />
                        <span>{spec.rating}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted truncate">{spec.role}</p>
                  </div>

                  {isSpecSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Select Date & Slot */}
        <section className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                3
              </div>
              <h2 className="text-sm font-bold text-text">Select Date & Slot</h2>
            </div>
            <span className="text-[11px] text-muted font-medium">Guaranteed Chair Hold</span>
          </div>

          {/* Date Selector Segment */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDateMode('today')}
              className={`py-2 px-2 rounded-card text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                dateMode === 'today'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-text hover:bg-primary-soft'
              }`}
            >
              <span>Today</span>
              <span className={`text-[10px] font-normal ${dateMode === 'today' ? 'text-white/80' : 'text-muted'}`}>
                {todayStr.split('-').slice(1).join('/')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDateMode('tomorrow')}
              className={`py-2 px-2 rounded-card text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                dateMode === 'tomorrow'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-text hover:bg-primary-soft'
              }`}
            >
              <span>Tomorrow</span>
              <span className={`text-[10px] font-normal ${dateMode === 'tomorrow' ? 'text-white/80' : 'text-muted'}`}>
                {tomorrowStr.split('-').slice(1).join('/')}
              </span>
            </button>

            <div className="relative">
              <label
                className={`w-full h-full py-2 px-2 rounded-card text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                  dateMode === 'custom'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface border-border text-text hover:bg-primary-soft'
                }`}
              >
                <div className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  <span>Calendar</span>
                </div>
                <span className={`text-[10px] font-normal ${dateMode === 'custom' ? 'text-white/80' : 'text-muted'}`}>
                  {customDate ? customDate.split('-').slice(1).join('/') : 'Select'}
                </span>
                <input
                  type="date"
                  min={todayStr}
                  value={customDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomDate(e.target.value);
                      setDateMode('custom');
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1">
                <Clock size={13} className="text-primary" /> Available Time Slots
              </span>
              <span className="text-[10px] text-muted">
                {isFetchingSlots ? 'Loading live chairs...' : `${slotsList.length} slots available`}
              </span>
            </div>

            {isFetchingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-button bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : slotsList.length === 0 ? (
              <div className="p-4 rounded-card bg-surface border border-border text-center text-xs text-muted">
                No slots available for this date. Please pick another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slotsList.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const displayTime = format12HourTime(slot.time);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 rounded-card text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-level-1 ring-2 ring-primary/40 scale-[1.02]'
                          : 'bg-surface border-border text-text hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{displayTime}</span>
                        {isSelected && <CheckCircle2 size={12} className="shrink-0" />}
                      </div>
                      <span className={`text-[9px] tabular-nums font-semibold ${isSelected ? 'text-white/90' : 'text-primary'}`}>
                        {formatMoney(slot.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: Special Instructions */}
        <section className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                4
              </div>
              <h2 className="text-sm font-bold text-text">Special Instructions</h2>
            </div>
            <span className="text-[11px] text-muted">Optional</span>
          </div>

          <div className="relative">
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
              placeholder="Add any styling notes or special requests..."
              className="w-full p-3 text-xs bg-surface border border-border rounded-input text-text placeholder:text-muted focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </section>

        {/* SECTION 5: Your Details */}
        <section className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                5
              </div>
              <h2 className="text-sm font-bold text-text">Your Details</h2>
            </div>

            {/* Validation Status Badge */}
            {isDetailsValid ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-chip border border-emerald-200 shadow-xs">
                <CheckCircle2 size={12} className="text-emerald-600" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-chip">
                <AlertCircle size={12} /> Incomplete
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5 bg-surface p-3.5 rounded-card border border-border">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-text flex items-center gap-1">
                <User size={12} className="text-primary" /> Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-9 px-3 rounded-input bg-bg border border-border text-xs text-text focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Contact Number */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-text flex items-center gap-1">
                <Phone size={12} className="text-primary" /> Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-9 px-3 rounded-input bg-bg border border-border text-xs text-text focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Email (Optional) */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-text flex items-center gap-1">
                <Mail size={12} className="text-muted" /> Email Address <span className="text-muted font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="aarav@glowslot.com"
                className="w-full h-9 px-3 rounded-input bg-bg border border-border text-xs text-text focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* SECTION 6: Coupon Code & Financial Summary */}
        <section className="flex flex-col gap-3 pt-1 bg-surface p-3.5 rounded-card border border-border shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Tag size={15} className="text-primary" /> Apply Promo / Coupon Code
            </span>
            {appliedCoupon && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-chip">
                {appliedCoupon.name} Applied
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon (e.g. GLOW100)"
              className="flex-1 h-9 px-3 rounded-input bg-bg border border-border text-xs text-text placeholder:text-muted uppercase font-mono focus:border-primary focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
              className="shrink-0"
            >
              Apply
            </Button>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="mt-2 pt-2.5 border-t border-border/60 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between text-muted">
              <span>Service Subtotal ({selectedServices.length} items)</span>
              <span className="font-semibold text-text tabular-nums">{formatMoney(subtotalPrice)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span className="tabular-nums">- {formatMoney(appliedCoupon.discountPaise)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-muted">
              <span>Estimated Duration</span>
              <span className="font-semibold text-text">{totalDuration} mins</span>
            </div>

            <div className="flex items-center justify-between font-bold text-sm text-text pt-2 border-t border-border">
              <span>Total Appointment Amount</span>
              <span className="tabular-nums text-primary">{formatMoney(totalAmount)}</span>
            </div>

            {/* Advance Deposit & Balance at Salon */}
            <div className="bg-primary-soft/30 p-2.5 rounded-card border border-primary/20 flex flex-col gap-1 mt-1 text-[11px]">
              <div className="flex items-center justify-between text-primary font-bold">
                <span>15% Advance Deposit Required</span>
                <span className="tabular-nums">{formatMoney(depositAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-muted font-medium">
                <span>Remaining Balance Payable at Salon</span>
                <span className="tabular-nums font-semibold text-text">{formatMoney(balanceAtSalon)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Action Footer with Booking Summary */}
        <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-border p-3.5 max-w-lg mx-auto flex flex-col gap-2.5 shadow-level-2 z-50">
          {/* Summary Strip */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-bold text-text truncate">
                {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''} • {totalDuration} min
              </span>
              <span className="text-[10px] text-muted truncate">
                {selectedServices.map((s) => s.name).join(', ')}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-muted block">Total Amount</span>
              <span className="text-base font-extrabold text-primary tabular-nums">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          {/* Button Group */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handleReviewSummary}
              className="flex-1 text-[11px] px-2 py-2"
            >
              Review Full Appointment Summary
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              disabled={selectedServices.length === 0 || !selectedSlot || !isDetailsValid}
              onClick={handleConfirmBooking}
              className="flex-1 text-[11px] px-2 py-2 shadow-xs"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
