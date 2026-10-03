import React, { useState, useEffect } from 'react';
import { Sheet } from '../../../components/Sheet';
import { UserAddress } from '../../../types';
import { addressService } from '../../../data/mockAddresses';
import { Button } from '../../../components/Button';
import { MapPin, Plus, Check, Edit2 } from 'lucide-react';
import { AddEditAddressModal } from './AddEditAddressModal';

interface AddressPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddressId?: string;
  onSelectAddress: (addr: UserAddress) => void;
}

export const AddressPickerSheet: React.FC<AddressPickerSheetProps> = ({
  isOpen,
  onClose,
  selectedAddressId,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const loadAddresses = () => {
    const list = addressService.getAddresses();
    setAddresses(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen]);

  const handleSaved = (addr: UserAddress) => {
    loadAddresses();
    onSelectAddress(addr);
  };

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose} title="Select Delivery Address">
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Saved Addresses</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingAddress(null);
                setIsAddEditOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add New</span>
            </Button>
          </div>

          <div className="divide-y divide-border">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`py-3 px-3 rounded-button flex items-start justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-soft' : 'hover:bg-primary-soft/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text uppercase">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-deal/20 text-stone-900 dark:text-deal px-1.5 py-0.2 rounded font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text font-medium mt-0.5">
                        {addr.houseNumber}, {addr.street}
                      </p>
                      <p className="text-[11px] text-muted">
                        {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(addr);
                        setIsAddEditOpen(true);
                      }}
                      className="p-1.5 text-muted hover:text-text cursor-pointer"
                      aria-label="Edit address"
                    >
                      <Edit2 size={13} />
                    </button>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Sheet>

      <AddEditAddressModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSaved={handleSaved}
        initialData={editingAddress}
      />
    </>
  );
};
