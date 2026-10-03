import React from 'react';
import { Sheet } from '../../../components/Sheet';
import { Button } from '../../../components/Button';
import { LogOut } from 'lucide-react';

interface LogoutConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmSheet: React.FC<LogoutConfirmSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Log Out (O08)">
      <div className="flex flex-col gap-4 pb-4 text-center items-center">
        <div className="w-12 h-12 rounded-full bg-error/15 text-error flex items-center justify-center">
          <LogOut size={24} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-text">Are you sure you want to log out?</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-xs">
            You will need to verify your phone number again with an OTP to access your bookings and points.
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
