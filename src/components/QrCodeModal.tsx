import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import QRCode from 'qrcode';
import { JobPosting } from '../types';
import { getFullTrackingUrl } from '../utils/formatter';

interface QrCodeModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const trackingUrl = getFullTrackingUrl(job.slug);

  useEffect(() => {
    if (isOpen && trackingUrl) {
      QRCode.toDataURL(trackingUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('QR Code error:', err));
    }
  }, [isOpen, trackingUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-vaga-${job.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-center">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">QR Code da Vaga</h2>
              <p className="text-[10px] text-slate-400">Rastreável para panfletos e stories</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="bg-white p-3.5 rounded-2xl shadow-xl border-4 border-slate-700">
            {dataUrl ? (
              <img 
                src={dataUrl} 
                alt={`QR Code para ${job.role}`} 
                className="w-56 h-56 rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Gerando QR Code...
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white capitalize">{job.role}</h3>
            <p className="text-xs text-slate-400">{job.location} • {job.vacanciesCount}</p>
          </div>

          {/* Link box */}
          <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 truncate text-[11px]">
              {trackingUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-slate-400 hover:text-white ml-2 shrink-0 p-1"
              title="Copiar link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Imagem PNG</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
