'use client';

import { useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
  contractId: string;
  productName: string;
  baseUrl?: string;
}

export function QRCodeCard({ contractId, productName, baseUrl }: QRCodeCardProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const verifyUrl = `${baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')}/verify/${contractId}`;

  const downloadPNG = useCallback(() => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas  = document.createElement('canvas');
    const size    = 512;
    canvas.width  = size;
    canvas.height = size;

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 16, 16, size - 32, size - 32);

      const link    = document.createElement('a');
      link.download = `fairchain-${contractId.slice(0, 8)}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [contractId]);

  return (
    <div className="glass rounded-2xl p-6 space-y-4 text-center">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Product QR</p>
        <p className="text-white font-semibold text-sm truncate">{productName}</p>
      </div>

      {/* QR Code */}
      <div
        ref={svgRef}
        className="mx-auto w-48 h-48 bg-white rounded-xl p-3 flex items-center justify-center"
        aria-label={`QR code for ${productName}`}
      >
        <QRCodeSVG
          value={verifyUrl}
          size={168}
          level="H"
          bgColor="#ffffff"
          fgColor="#0f172a"
          includeMargin={false}
        />
      </div>

      {/* URL hint */}
      <p className="text-[10px] text-slate-600 font-mono break-all">{verifyUrl}</p>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <button
          id={`btn-download-qr-${contractId.slice(0, 8)}`}
          onClick={downloadPNG}
          className="btn-primary text-xs px-4 py-2 gap-1.5"
          aria-label="Download QR code as PNG"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PNG
        </button>

        <button
          id={`btn-copy-link-${contractId.slice(0, 8)}`}
          onClick={() => { void navigator.clipboard.writeText(verifyUrl); }}
          className="btn-ghost text-xs px-4 py-2 gap-1.5"
          aria-label="Copy verification link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  );
}
