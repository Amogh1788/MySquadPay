import { useEffect, useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Modal } from './ui';
import { play } from '../lib/sound';

export const joinLink = (code: string) =>
  `${window.location.origin}/join/${code}`;

export default function InviteQR({
  open,
  onClose,
  code,
  squadName,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
  squadName: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = joinLink(code);

  const shareMessage =
    `Join my squad "${squadName}" on SquadPay using the QR Code or follow this link: ${link}`;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    setDataUrl(null);
    setFailed(false);

    import('qrcode')
      .then((mod) => {
        const QR = (mod as any).default ?? mod;

        return QR.toDataURL(link, {
          width: 512,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#F9A825',
            light: '#171310',
          },
        });
      })
      .then((url: string) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((error: unknown) => {
        console.error('QR generation failed:', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, link]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);

      setCopied(true);
      play('tap');

      setTimeout(() => setCopied(false), 1800);
    } catch {
      // The invite link remains visible in the modal.
    }
  };

  const share = async () => {
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const qrFile = new File(
        [blob],
        `squad-${code}-qr.png`,
        { type: 'image/png' },
      );

      const shareData: ShareData = {
        title: `Join ${squadName} on SquadPay`,
        text: shareMessage,
        files: [qrFile],
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [qrFile] })
      ) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareMessage);

      const imageUrl = URL.createObjectURL(qrFile);
      const anchor = document.createElement('a');

      anchor.href = imageUrl;
      anchor.download = qrFile.name;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);

      alert(
        'QR image downloaded and invite message copied. Attach the image and paste the message into WhatsApp.',
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Could not share QR invite:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Squad Invite QR">
      <div className="flex flex-col items-center gap-4">
        {/* QR preview with a thin, rounded gold-brown border */}
        <div
          className="flex h-60 w-60 items-center justify-center rounded-[18px] p-[5px] shadow-lg"
          style={{
            backgroundColor: '#171310',
            border: '2px solid #765522',
          }}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR code to join ${squadName}`}
              className="h-full w-full rounded-[12px]"
            />
          ) : failed ? (
            <p className="px-4 text-center text-xs font-bold text-bone/60">
              QR generate nahi hua — neeche ka link share karo
            </p>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-bone/20 border-t-marigold" />
          )}
        </div>

        <p className="text-center text-xs text-bone/60">
          Camera se scan karo — seedha{' '}
          <span className="font-bold text-bone">{squadName}</span>
          {' '}ka join page khulega
        </p>

        {/* Invite code */}
        <div className="w-full rounded-xl bg-bone/5 px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-bone/40">
            Invite code
          </p>

          <p className="font-mono text-lg font-extrabold tracking-widest text-marigold">
            {code}
          </p>
        </div>

        {/* Copy and share buttons */}
        <div className="flex w-full gap-2">
          <button
            onClick={copy}
            className="bbtn bbtn-ghost flex-1 justify-center gap-1.5 py-2.5 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-mint" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}

            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={share}
              disabled={!dataUrl}
              className="bbtn flex-1 justify-center gap-1.5 py-2.5 text-xs disabled:opacity-50"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

