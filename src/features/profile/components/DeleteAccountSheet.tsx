import React, { useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteAccountSheet: React.FC<DeleteAccountSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Delete Account (O09)">
      <div className="flex flex-col gap-4 pb-4">
        <div className="p-3.5 rounded-card bg-error/10 border border-error/20 flex items-start gap-3 text-error">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block">Permanent Action</span>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              Deleting your account will erase your profile, saved addresses, favorite salons, and all accumulated Glow Points.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text uppercase tracking-wider block mb-1.5">
            Type <span className="font-mono text-error">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full h-11 px-3 rounded-input border border-border bg-bg text-xs font-mono font-bold uppercase focus:border-error outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={confirmText !== 'DELETE'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Permanently Delete
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
