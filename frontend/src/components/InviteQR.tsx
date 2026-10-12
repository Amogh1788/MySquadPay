import { useEffect, useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Modal } from './ui';
import { play } from '../lib/sound';

// The QR encodes a normal link (/join/CODE), not the raw code — so it works
// with ANY phone's built-in camera app: scan -> link opens -> join page.
// No in-app scanner, camera permission prompt, or extra library needed on
// the scanning side.
export const joinLink = (code: string) => `${window.location.origin}/join/${code}`;

export default function InviteQR({ open, onClose, code, squadName }: {
  open: boolean; onClose: () => void; code: string; squadName: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = joinLink(code);

  // The QR library only loads when someone actually opens this modal,
  // keeping it out of every page's initial download.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDataUrl(null); setFailed(false);
    import('qrcode')
      .then((mod) => {
        const QR = (mod as any).default ?? mod;
        // Dark modules on a white field regardless of app theme — QR
        // scanners need that contrast, a dark-mode inverted code often
        // won't scan at all.
        return QR.toDataURL(link, { width: 512, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0e0c0a', light: '#ffffff' } });
      })
      .then((url: string) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, link]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true); play('tap');
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the link is still visible below to copy by hand */ }
  };

  const share = () => {
    navigator.share?.({ title: `Join ${squadName} on SquadPay`, text: `Join my squad "${squadName}" on SquadPay`, url: link }).catch(() => {});
  };

  return (
    <Modal open={open} onClose={onClose} title="Squad Invite QR">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-60 w-60 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR code to join ${squadName}`} className="h-full w-full" />
          ) : failed ? (
            <p className="px-4 text-center text-xs font-bold text-ink-950/60">QR generate nahi hua — neeche ka link share karo</p>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-950/20 border-t-ink-950" />
          )}
        </div>

        <p className="text-center text-xs text-bone/60">
          Camera se scan karo — seedha <span className="font-bold text-bone">{squadName}</span> ka join page khulega
        </p>

        <div className="w-full rounded-xl bg-bone/5 px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-bone/40">Invite code</p>
          <p className="font-mono text-lg font-extrabold tracking-widest text-marigold">{code}</p>
        </div>

        <div className="flex w-full gap-2">
          <button onClick={copy} className="bbtn bbtn-ghost flex-1 justify-center gap-1.5 py-2.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button onClick={share} className="bbtn flex-1 justify-center gap-1.5 py-2.5 text-xs">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
