import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { Button, ErrorText, Spinner } from '../components/ui';
import { play, initSound } from '../lib/sound';
import { popSpring } from '../lib/motion';
import { rememberLastSquad } from '../components/GlobalNav';

// Where a pending invite waits while a logged-out visitor signs in or
// registers. Dashboard picks it up right after login and sends them back
// here — sessionStorage (not localStorage) so a stale invite can't
// resurface in some later, unrelated session.
export const PENDING_JOIN_KEY = 'squadpay_pending_join';

interface Preview { id: string; name: string; emoji: string; memberCount: number; alreadyMember: boolean }

export default function JoinPage() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPreview(null); setError('');
    api<{ squad: Preview }>(`/squads/preview/${encodeURIComponent(code)}`)
      .then((d) => setPreview(d.squad))
      .catch((e) => setError(e.message || 'Invite load nahi hua'));
  }, [user, code]);

  if (loading) return <main className="flex min-h-screen items-center justify-center"><Spinner /></main>;

  if (!user) {
    // Not signed in yet — remember the invite, sign in, and Dashboard
    // brings them straight back to this page afterwards.
    sessionStorage.setItem(PENDING_JOIN_KEY, code);
    return <Navigate to="/login" replace />;
  }

  const join = async () => {
    if (!preview) return;
    initSound(); setBusy(true); setError('');
    try {
      if (!preview.alreadyMember) await api('/squads/join', { method: 'POST', body: JSON.stringify({ code }) });
      play('success');
      rememberLastSquad(preview.id);
      nav(`/app/squad/${preview.id}`, { replace: true });
    } catch (e: any) {
      play('error'); setError(e.message || 'Join nahi ho paya'); setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="rounded-2xl border border-bone/10 bg-ink-900 p-7 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          {!preview && !error && <div className="flex justify-center py-8"><Spinner /></div>}

          {error && !preview && (
            <>
              <p className="text-4xl">🔗</p>
              <h1 className="mt-3 font-display text-lg font-extrabold text-bone">Invite kaam nahi kar raha</h1>
              <div className="mt-3"><ErrorText msg={error} /></div>
              <Link to="/app" className="bbtn mt-5 w-full justify-center">Dashboard par jao</Link>
            </>
          )}

          {preview && (
            <>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, ...popSpring }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-bone/5 text-5xl">
                {preview.emoji}
              </motion.div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-bone/50">
                {preview.alreadyMember ? 'Tum already is squad mein ho' : 'Tumhe invite kiya gaya hai'}
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-bone">{preview.name}</h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-bone/60">
                <Users className="h-4 w-4" /> {preview.memberCount} {preview.memberCount === 1 ? 'member' : 'members'}
              </p>
              {error && <div className="mt-4"><ErrorText msg={error} /></div>}
              <Button onClick={join} disabled={busy} className="mt-6 w-full justify-center py-3">
                {busy ? 'Wait karo...' : preview.alreadyMember ? 'Squad kholo →' : 'Squad Join Karo →'}
              </Button>
              <Link to="/app" className="mt-3 block text-xs font-bold text-bone/40 hover:text-bone/70">Abhi nahi</Link>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
