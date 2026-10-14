import React, { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { studioflowService } from './studioflowService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: () => void;
}

/**
 * One booking account shared between GlowSlot and the salon websites.
 * Signing in here is the same as signing in on the website, so bookings appear in both.
 */
export const StudioflowAccountSheet: React.FC<Props> = ({ isOpen, onClose, onSignedIn }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') await studioflowService.signUp(email, password, name);
      else await studioflowService.signIn(email, password);
      onSignedIn();
    } catch (e: any) {
      setError(e?.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Booking account">
      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-muted">
          This salon takes bookings through its website platform. Use one account for both the website and this app.
        </p>
        {mode === 'signup' && <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button fullWidth disabled={busy || !email || password.length < 6 || (mode === 'signup' && !name.trim())} onClick={submit}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account & continue' : 'Sign in & continue'}
        </Button>
        <button type="button" className="text-sm text-primary underline" onClick={() => { setError(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}>
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </Sheet>
  );
};
