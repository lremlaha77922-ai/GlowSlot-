import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { UserAddress } from '../../../types';

const STORAGE_KEY = 'glowslot_saved_addresses';

const getLocalAddresses = (): UserAddress[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return [
    {
      id: 'addr-1',
      label: 'Home',
      houseNumber: 'Flat 402, Green Glen Heights',
      street: '14th Main Road',
      landmark: 'Near HSR Police Station',
      area: 'HSR Layout Sector 2',
      city: 'Bengaluru',
      pincode: '560102',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Work',
      houseNumber: 'Tower B, 3rd Floor, Tech Park',
      street: 'Outer Ring Road',
      landmark: 'Opposite Metro Station',
      area: 'Bellandur',
      city: 'Bengaluru',
      pincode: '560103',
      isDefault: false,
    },
  ];
};

export const addressService = {
  async getAddresses(userId?: string): Promise<UserAddress[]> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });

        if (!error && data) {
          return data.map((a: any) => ({
            id: a.id,
            label: a.label as UserAddress['label'],
            houseNumber: a.house_number || a.address_line || 'Flat 101',
            street: a.street || '',
            landmark: a.landmark || '',
            area: a.area || 'Koramangala',
            city: a.city || 'Bengaluru',
            pincode: a.pincode || '560095',
            isDefault: a.is_default,
          }));
        }
      } catch {
        // fallback
      }
    }

    return getLocalAddresses();
  },

  async saveAddress(address: UserAddress, userId?: string): Promise<UserAddress> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .upsert({
            id: address.id.startsWith('addr-') ? undefined : address.id,
            user_id: userId,
            label: address.label,
            address_line: `${address.houseNumber}, ${address.street}`,
            landmark: address.landmark,
            area: address.area,
            city: address.city,
            pincode: address.pincode,
            is_default: address.isDefault,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            label: data.label as UserAddress['label'],
            houseNumber: address.houseNumber,
            street: address.street,
            landmark: data.landmark,
            area: data.area,
            city: data.city || 'Bengaluru',
            pincode: data.pincode,
            isDefault: data.is_default,
          };
        }
      } catch {
        // fallback
      }
    }

    const current = getLocalAddresses();
    const index = current.findIndex((a) => a.id === address.id);
    let updated: UserAddress[];

    if (index >= 0) {
      updated = [...current];
      updated[index] = address;
    } else {
      updated = [...current, address];
    }

    if (address.isDefault) {
      updated = updated.map((a) =>
        a.id === address.id ? a : { ...a, isDefault: false }
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return address;
  },

  async deleteAddress(id: string, userId?: string): Promise<void> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId);
      } catch {
        // fallback
      }
    }

    const current = getLocalAddresses();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
};
