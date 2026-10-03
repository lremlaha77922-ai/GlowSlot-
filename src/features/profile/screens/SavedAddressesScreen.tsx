import React, { useState, useEffect } from 'react';
import { UserAddress } from '../../../types';
import { addressService } from '../../athome/services/addressService';
import { AddEditAddressModal } from '../../athome/components/AddEditAddressModal';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';

interface SavedAddressesScreenProps {
  onBack: () => void;
}

export const SavedAddressesScreen: React.FC<SavedAddressesScreenProps> = ({ onBack }) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const loadAddresses = async () => {
    const list = await addressService.getAddresses(user?.id);
    setAddresses(list);
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleDelete = async (id: string, label: string) => {
    await addressService.deleteAddress(id, user?.id);
    await loadAddresses();
    showToast(`Removed ${label} address.`);
  };

  const handleSaved = async () => {
    await loadAddresses();
    showToast('Address saved successfully.');
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-text">Saved Addresses (S24)</h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1"
        >
          <Plus size={14} />
          <span>Add New</span>
        </Button>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full">
        {addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin size={32} />}
            title="No saved addresses"
            helperText="Add your home, office or other delivery addresses for doorstep grooming services."
            actionLabel="Add Address"
            onAction={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3.5 flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                    <MapPin size={16} />
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
                    <p className="text-xs text-text font-medium mt-1">
                      {addr.houseNumber}, {addr.street}
                    </p>
                    <p className="text-[11px] text-muted">
                      {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <span className="text-[10px] text-muted block mt-0.5">
                        Landmark: {addr.landmark}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingAddress(addr);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-muted hover:text-text cursor-pointer"
                    aria-label="Edit address"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id, addr.label)}
                    className="p-1.5 text-muted hover:text-error cursor-pointer"
                    aria-label="Delete address"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* S07 Add/Edit Modal */}
      <AddEditAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialData={editingAddress}
      />
    </div>
  );
};
