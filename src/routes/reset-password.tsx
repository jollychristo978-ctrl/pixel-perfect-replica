import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';

export const Route = createFileRoute('/reset-password')({ head: () => meta('Choose a new password', 'Securely choose a new password for your Paalam account.'), component: ResetPassword });
function ResetPassword() {
  const { t } = usePaalam();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const recovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (recovery) sessionStorage.setItem('paalam-recovery', 'true');
    void supabase.auth.getUser().then(({ data }) => {
      setReady(Boolean(data.user) && sessionStorage.getItem('paalam-recovery') === 'true');
      setChecked(true);
    });
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password !== confirm) { setError(t('Passwords do not match.', 'கடவுச்சொற்கள் பொருந்தவில்லை.')); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      sessionStorage.removeItem('paalam-recovery'); setDone(true);
    } catch (error) { setError(error instanceof Error ? error.message : t('Please try again.', 'மீண்டும் முயலுங்கள்.')); }
    finally { setBusy(false); }
  }
  return <main className="form-page"><div className="auth-panel"><h1>{t('Choose a new password', 'புதிய கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்')}</h1>{done ? <><p role="status" className="notice">{t('Your password has been updated.', 'உங்கள் கடவுச்சொல் புதுப்பிக்கப்பட்டது.')}</p><Button asChild><Link to="/dashboard">{t('Continue', 'தொடரவும்')}</Link></Button></> : !checked ? <p role="status">{t('Checking your reset link…', 'மீட்டமைப்பு இணைப்பைச் சரிபார்க்கிறது…')}</p> : !ready ? <><p role="alert" className="error-message">{t('This reset link is missing or expired.', 'இந்த மீட்டமைப்பு இணைப்பு இல்லை அல்லது காலாவதியானது.')}</p><Button asChild><Link to="/forgot-password">{t('Request a new link', 'புதிய இணைப்பைக் கோரவும்')}</Link></Button></> : <form onSubmit={submit} className="flex flex-col gap-5 mt-7"><label className="field">{t('New password', 'புதிய கடவுச்சொல்')}<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /></label><label className="field">{t('Confirm password', 'கடவுச்சொல்லை உறுதிப்படுத்தவும்')}<input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /></label>{error && <p role="alert" className="error-message">{error}</p>}<Button type="submit" disabled={busy}>{busy ? t('Saving…', 'சேமிக்கிறது…') : t('Save password', 'கடவுச்சொல்லைச் சேமி')}</Button></form>}</div></main>;
}