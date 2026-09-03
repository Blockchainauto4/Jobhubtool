import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Send, 
  MousePointerClick, 
  QrCode, 
  BarChart2, 
  Share2, 
  ExternalLink,
  Smartphone,
  Eye,
  RefreshCw,
  Gamepad2,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobPosting } from '../types';
import { generateFormattedPost, getFullTrackingUrl } from '../utils/formatter';

interface WhatsAppPreviewProps {
  job: JobPosting;
  onSimulateClick: () => void;
  onOpenAnalytics: () => void;
  onOpenQrCode: () => void;
  isSimulatingClick: boolean;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  job,
  onSimulateClick,
  onOpenAnalytics,
  onOpenQrCode,
  isSimulatingClick
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedText = generateFormattedPost(job);
  const trackingUrl = getFullTrackingUrl(job.slug);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleOpenWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleOpenTrackedLink = () => {
    window.open(trackingUrl, '_blank');
  };

  const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 sticky top-20">
      
      {/* Card Header with Clicks Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            Pré-visualização WhatsApp
          </h2>
        </div>

        {/* Live Click Counter Badge */}
        <button
          id="btn-view-analytics-badge"
          onClick={onOpenAnalytics}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-all cursor-pointer"
          title="Ver análise detalhada de cliques"
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>{job.clicksCount || 0} cliques no link</span>
          <BarChart2 className="w-3 h-3 ml-1 text-emerald-400" />
        </button>
      </div>

      {/* WhatsApp Smartphone Mockup Box */}
      <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-[#0b141a]">
        
        {/* WhatsApp Chat Top Header */}
        <div className="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              👥
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <span>Grupo de Vagas & Diárias SP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-slate-400">
                online • 1.250 participantes
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Simulador</span>
          </div>
        </div>

        {/* Chat Background & Message Bubble */}
        <div className="p-4 bg-[#0b141a] min-h-[300px] max-h-[440px] overflow-y-auto font-sans relative">
          
          {/* WhatsApp Message Bubble */}
          <div className="max-w-[92%] bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tl-none p-3 shadow-md border border-[#005c4b]/50 relative text-[13px] leading-relaxed">
            
            {/* Message Body */}
            <div className="whitespace-pre-wrap font-sans select-text break-words">
              {formattedText}
            </div>

            {/* Message Timestamp & Blue Ticks */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-emerald-200/70">
              <span>{nowTime}</span>
              <span className="text-[#53bdeb]">✓✓</span>
            </div>
          </div>

        </div>

      </div>

      {/* Action Buttons: Copiar, Compartilhar, Testar */}
      <div className="space-y-3">
        
        {/* Main Action: Copiar Texto */}
        <button
          id="btn-copy-formatted-text"
          type="button"
          onClick={handleCopyText}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Mensagem Copiada para a Área de Transferência!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Mensagem Formatada para o WhatsApp</span>
            </>
          )}
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          
          <button
            id="btn-share-whatsapp-direct"
            type="button"
            onClick={handleOpenWhatsAppShare}
            className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            id="btn-open-qr-code"
            type="button"
            onClick={onOpenQrCode}
            className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gerar QR Code</span>
          </button>

        </div>

        {/* Tracking Link Management Box */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Share2 className="w-3 h-3 text-cyan-400" /> Link Rastreável:
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              {job.clicksCount || 0} cliques
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 truncate flex-1 font-mono text-[11px]">
              {trackingUrl}
            </span>
            <button
              id="btn-copy-tracked-link"
              type="button"
              onClick={handleCopyTrackingLink}
              className="text-slate-300 hover:text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Copiar link"
            >
              {copiedLink ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={handleOpenTrackedLink}
              className="text-slate-300 hover:text-cyan-400 px-1 py-0.5 transition-colors"
              title="Abrir link no navegador"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Test Click & Analytics Row */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              id="btn-simulate-click"
              type="button"
              onClick={onSimulateClick}
              disabled={isSimulatingClick}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSimulatingClick ? 'animate-spin' : ''}`} />
              <span>Testar Clique (+1)</span>
            </button>

            <button
              id="btn-open-analytics-modal"
              type="button"
              onClick={onOpenAnalytics}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart2 className="w-3 h-3 text-cyan-400" />
              <span>Painel de Cliques</span>
            </button>
          </div>
        </div>

        {/* Quick Links in Post */}
        {(job.tiktokLink || job.mapsUrl) && (
          <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Links Integrados na Mensagem:
            </span>
            
            {job.tiktokLink && job.includeTiktokLink !== false && (
              <div className="flex items-center justify-between gap-2 text-pink-300 bg-pink-950/20 px-2 py-1 rounded border border-pink-500/20">
                <span className="truncate flex items-center gap-1.5 text-[11px]">
                  <Gamepad2 className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate font-mono">{job.tiktokLink}</span>
                </span>
                <a
                  href={job.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-pink-300 hover:text-pink-100 flex items-center gap-1 shrink-0 font-bold underline"
                >
                  Abrir TikTok <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}

            {job.mapsUrl && (
              <div className="flex items-center justify-between gap-2 text-cyan-300 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-500/20">
                <span className="truncate flex items-center gap-1.5 text-[11px]">
                  <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate font-mono">{job.mapsUrl}</span>
                </span>
                <a
                  href={job.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-300 hover:text-cyan-100 flex items-center gap-1 shrink-0 font-bold underline"
                >
                  Abrir Maps <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
