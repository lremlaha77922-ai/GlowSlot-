import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { UserAddress } from '../../../types';
import { addressService } from '../../../data/mockAddresses';

interface AddEditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (addr: UserAddress) => void;
  initialData?: UserAddress | null;
}

export const AddEditAddressModal: React.FC<AddEditAddressModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialData,
}) => {
  const [label, setLabel] = useState<UserAddress['label']>(initialData?.label || 'Home');
  const [houseNumber, setHouseNumber] = useState(initialData?.houseNumber || '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [area, setArea] = useState(initialData?.area || 'Koramangala');
  const [city, setCity] = useState(initialData?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(initialData?.pincode || '560095');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber.trim() || !street.trim() || !pincode.trim()) {
      setError('Please fill in house/flat number, street, and pincode.');
      return;
    }

    if (initialData?.id) {
      const updated = addressService.updateAddress(initialData.id, {
        label,
        houseNumber,
        street,
        landmark,
        area,
        city,
        pincode,
        isDefault,
      });
      if (updated) onSaved(updated);
    } else {
      const created = addressService.addAddress({
        label,
        houseNumber,
        street,
        landmark,
        area,
        city,
        pincode,
        isDefault,
      });
      onSaved(created);
    }

    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Address' : 'Add New Address (S07)'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pb-4">
        {/* Label Selector */}
        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
            Address Type
          </label>
          <div className="flex gap-2">
            {(['Home', 'Work', 'Other'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`py-1.5 px-3.5 rounded-button text-xs font-semibold border transition-all cursor-pointer ${
                  label === l
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-muted border-border hover:bg-primary-soft/50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Flat / House No. / Building"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="e.g. Flat 301, Sunshine Heights"
          required
        />

        <Input
          label="Street / Road / Area"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. 5th Main, 4th Block"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Landmark (Optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Metro Station"
          />
          <Input
            label="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 560095"
            maxLength={6}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Area / Neighborhood"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded text-primary accent-primary"
          />
          <span className="text-xs text-text font-medium">Set as default address</span>
        </label>

        {error && <span className="text-xs text-error">{error}</span>}

        <Button type="submit" variant="primary" size="lg" className="mt-3">
          Save Address
        </Button>
      </form>
    </Sheet>
  );
};
