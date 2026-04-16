'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from '@/lib/toast';

interface Props {
  contractId: string;
}

export function QRModal({ contractId }: Props) {
  const [open, setOpen]   = useState(false);
  const [nfc, setNfc]     = useState<boolean | null>(null);
  const [writing, setWriting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.fairchain.io'}/verify/${contractId}`;

  // Check NFC availability
  useEffect(() => {
    setNfc(typeof window !== 'undefined' && 'NDEFReader' in window);
  }, []);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(verifyUrl);
    toast.success('Link copied to clipboard!');
  }, [verifyUrl]);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) { toast.error('Canvas not ready'); return; }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairchain-${contractId.slice(0, 8)}.png`;
    a.click();
    toast.success('QR code downloaded!');
  }, [contractId]);

  const writeNfc = useCallback(async () => {
    if (!('NDEFReader' in window)) { toast.warning('NFC not supported on this device'); return; }
    setWriting(true);
    try {
      // @ts-expect-error — Web NFC API types not yet in lib.dom
      const ndef = new NDEFReader();
      await ndef.write({ records: [{ recordType: 'url', data: verifyUrl }] });
      toast.success('Written to NFC tag!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'NFC write failed';
      toast.error(msg);
    } finally {
      setWriting(false);
    }
  }, [verifyUrl]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost w-full justify-center gap-2"
        id="btn-generate-qr"
        aria-label="Generate QR code for product verification"
      >
        <span>⊡</span> Generate QR Code
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="QR Code modal"
        >
          <div className="glass p-8 rounded-2xl w-full max-w-sm space-y-5 text-center">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-lg">Verification QR</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl" aria-label="Close QR modal">✕</button>
            </div>

            {/* QR Code */}
            <div ref={canvasRef} className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeCanvas
                value={verifyUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/icon-192.png',
                  height: 32,
                  width:  32,
                  excavate: true,
                }}
              />
            </div>

            {/* URL */}
            <div className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.07]">
              <p className="text-xs text-slate-400 font-mono break-all">{verifyUrl}</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={copyLink}    className="btn-ghost text-sm justify-center" aria-label="Copy verification link">📋 Copy Link</button>
              <button onClick={downloadPNG} className="btn-ghost text-sm justify-center" aria-label="Download QR as PNG">⬇ Download</button>
            </div>

            {/* NFC */}
            {nfc === true && (
              <button
                onClick={writeNfc}
                disabled={writing}
                className="btn-primary w-full justify-center text-sm"
                aria-label="Write to NFC tag"
              >
                {writing ? '⏳ Writing…' : '📡 Write to NFC Tag (NTAG213)'}
              </button>
            )}
            {nfc === false && (
              <p className="text-xs text-slate-600">NFC not supported on this device/browser</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
