import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PIN_KEY = 'drinkmix_admin_pin_v1';
const SESSION_KEY = 'drinkmix_admin_session_v1';

function getPin(): string {
  return localStorage.getItem(PIN_KEY) ?? '1234';
}

function setSessionActive(active: boolean) {
  if (active) localStorage.setItem(SESSION_KEY, '1');
  else localStorage.removeItem(SESSION_KEY);
}

function isSessionActive(): boolean {
  return localStorage.getItem(SESSION_KEY) === '1';
}

export function AdminPinGate({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const alreadyAuthed = useMemo(() => isSessionActive(), []);
  if (alreadyAuthed) {
    onSuccess();
    return null;
  }

  const submit = () => {
    if (pin.trim() === getPin()) {
      setSessionActive(true);
      onSuccess();
      return;
    }
    setErr('Incorrect PIN.');
    setPin('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Enter PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="h-12 text-lg"
              placeholder="••••"
            />
            {err && <div className="text-sm text-destructive">{err}</div>}
            <div className="text-xs text-muted-foreground">
              Default PIN is <span className="font-medium">1234</span>.
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={submit} className="flex-1">
              Unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
