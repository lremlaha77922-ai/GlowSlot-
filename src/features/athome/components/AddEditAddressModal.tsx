import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { UserAddress } from '../../../types';
import { addressService } from '../services/addressService';
import { useSessionStore } from '../../../store/useSessionStore';

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
  const { user } = useSessionStore();
  const [label, setLabel] = useState<UserAddress['label']>(initialData?.label || 'Home');
  const [houseNumber, setHouseNumber] = useState(initialData?.houseNumber || '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [area, setArea] = useState(initialData?.area || 'Koramangala');
  const [city, setCity] = useState(initialData?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(initialData?.pincode || '560095');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber.trim() || !pincode.trim()) {
      setError('Please fill in house/flat number and pincode.');
      return;
    }

    setIsLoading(true);
    const addressToSave: UserAddress = {
      id: initialData?.id || `addr-${Date.now()}`,
      label,
      houseNumber: houseNumber.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      area: area.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault,
    };

    const saved = await addressService.saveAddress(addressToSave, user?.id);
    setIsLoading(false);
    onSaved(saved);
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
                className={`flex-1 py-2 rounded-button text-xs font-semibold border transition-all cursor-pointer ${
                  label === l
                    ? 'bg-primary text-white border-primary shadow-level-1'
                    : 'bg-surface text-text border-border hover:bg-primary-soft/50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Flat / House / Building No."
          placeholder="e.g. Flat 402, Green Glen Heights"
          value={houseNumber}
          onChange={(e) => {
            setHouseNumber(e.target.value);
            setError('');
          }}
          required
        />

        <Input
          label="Street / Locality / Sector"
          placeholder="e.g. 14th Main, HSR Sector 2"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="e.g. Near BDA Complex"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Area / Locality"
            placeholder="e.g. Koramangala"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <Input
            label="Pincode"
            placeholder="560095"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
        </div>

        {/* Set as Default Switch */}
        <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="accent-primary w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-medium text-text">Make this my default address</span>
        </label>

        {error && <span className="text-xs text-error font-medium">{error}</span>}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading} className="mt-2">
          {isLoading ? 'Saving...' : initialData ? 'Update Address' : 'Save & Continue'}
        </Button>
      </form>
    </Sheet>
  );
};
