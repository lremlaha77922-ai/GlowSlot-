import { create } from 'zustand';
import { CartItem, CartSlotInfo, QuickService, Product } from '../types';
import { PLATFORM_FEE_PAISE, TAX_PERCENT } from '../utils/constants';
import { calculateTaxes } from '../utils/money';

interface CartState {
  items: CartItem[];
  addItem: (service: QuickService) => void;
  addItemWithSlot: (
    service: { id: string; name: string; durationMin: number; basePrice: number },
    slot: CartSlotInfo
  ) => void;
  addProduct: (product: Product) => void;
  updateQty: (serviceId: string, delta: number) => void;
  removeItem: (serviceId: string) => void;
  clearCart: () => void;
  getItemQty: (serviceId: string) => number;
  getTotalCount: () => number;
  getSubtotalPaise: () => number;
  getTaxesPaise: () => number;
  getTotalPaise: () => number;
  getPrimarySlot: () => CartSlotInfo | undefined;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (service: QuickService) => {
    set((state) => {
      const existing = state.items.find((i) => i.serviceId === service.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.serviceId === service.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: `ci-${Date.now()}-${service.id}`,
            serviceId: service.id,
            name: service.name,
            price: service.price,
            durationMin: service.durationMin,
            qty: 1,
            type: 'service',
          },
        ],
      };
    });
  },

  addItemWithSlot: (service, slot) => {
    set((state) => {
      const existing = state.items.find((i) => i.serviceId === service.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.serviceId === service.id
              ? { ...i, price: slot.price, slot, type: 'service' }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: `ci-${Date.now()}-${service.id}`,
            serviceId: service.id,
            name: service.name,
            price: slot.price,
            durationMin: service.durationMin,
            qty: 1,
            type: 'service',
            slot,
          },
        ],
      };
    });
  },

  addProduct: (product: Product) => {
    set((state) => {
      const existing = state.items.find((i) => i.serviceId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.serviceId === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: `ci-${Date.now()}-${product.id}`,
            serviceId: product.id,
            name: product.name,
            price: product.price,
            durationMin: 0,
            qty: 1,
            type: 'product',
            imageUrl: product.images[0],
          },
        ],
      };
    });
  },

  updateQty: (serviceId: string, delta: number) => {
    set((state) => {
      const updated = state.items
        .map((i) => {
          if (i.serviceId === serviceId) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null);
      return { items: updated };
    });
  },

  removeItem: (serviceId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.serviceId !== serviceId),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getItemQty: (serviceId: string) => {
    const item = get().items.find((i) => i.serviceId === serviceId);
    return item ? item.qty : 0;
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  },

  getSubtotalPaise: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getTaxesPaise: () => {
    const subtotal = get().getSubtotalPaise();
    return calculateTaxes(subtotal, TAX_PERCENT);
  },

  getTotalPaise: () => {
    const subtotal = get().getSubtotalPaise();
    if (subtotal === 0) return 0;
    const taxes = get().getTaxesPaise();
    return subtotal + PLATFORM_FEE_PAISE + taxes;
  },

  getPrimarySlot: () => {
    const itemWithSlot = get().items.find((i) => !!i.slot);
    return itemWithSlot?.slot;
  },
}));
