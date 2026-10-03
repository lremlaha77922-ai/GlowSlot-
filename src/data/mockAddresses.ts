import { UserAddress } from '../types';

const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    houseNumber: 'Flat 402, Green Glen Apartments',
    street: 'Outer Ring Road, Bellandur',
    landmark: 'Near Central Mall',
    area: 'Bellandur',
    city: 'Bengaluru',
    pincode: '560103',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    houseNumber: 'Tower B, 3rd Floor, EcoSpace Tech Park',
    street: 'Marathahalli - Sarjapur Outer Ring Rd',
    area: 'Bellandur',
    city: 'Bengaluru',
    pincode: '560103',
    isDefault: false,
  },
];

const STORAGE_KEY = 'glowslot_addresses';

export const addressService = {
  getAddresses(): UserAddress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed reading addresses from localStorage:', e);
    }
    // Default fallback
    this.saveAddresses(INITIAL_ADDRESSES);
    return INITIAL_ADDRESSES;
  },

  saveAddresses(addresses: UserAddress[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch (e) {
      console.error('Failed saving addresses to localStorage:', e);
    }
  },

  addAddress(address: Omit<UserAddress, 'id'>): UserAddress {
    const addresses = this.getAddresses();
    const newAddress: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    if (newAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }
    addresses.push(newAddress);
    this.saveAddresses(addresses);
    return newAddress;
  },

  updateAddress(id: string, updated: Partial<UserAddress>): UserAddress | null {
    const addresses = this.getAddresses();
    const index = addresses.findIndex((a) => a.id === id);
    if (index === -1) return null;

    if (updated.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses[index] = { ...addresses[index], ...updated };
    this.saveAddresses(addresses);
    return addresses[index];
  },
};
