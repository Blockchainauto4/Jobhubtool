import React, { useRef, useEffect, useState } from 'react';
import { JobPosting } from '../types';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon, Share2 } from 'lucide-react';

interface JobBannerModalProps {
  job: JobPosting;
  trackingUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const JobBannerModal: React.FC<JobBannerModalProps> = ({
  job,
  trackingUrl,
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [bannerFormat, setBannerFormat] = useState<'feed' | 'story'>('feed'); // feed: 1080x1080, story: 1080x1350

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function drawBanner() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1080;
      const height = bannerFormat === 'story' ? 1350 : 1080;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#091322');
      gradient.addColorStop(0.4, '#0f291e');
      gradient.addColorStop(1, '#061c14');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle accent glow circles
      const glow1 = ctx.createRadialGradient(200, 150, 10, 200, 150, 450);
      glow1.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      glow1.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(900, 900, 10, 900, 900, 500);
      glow2.addColorStop(0, 'rgba(20, 184, 166, 0.2)');
      glow2.addColorStop(1, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Outer border frame
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // 2. Header Bar / Logo
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(70, 70, 240, 50, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ FREELASHUB', 190, 104);

      // Status pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width - 340, 70, 270, 50, 25);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(width - 310, 95, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('VAGA ABERTA', width - 290, 102);

      // 3. Job Title & Vacancies
      ctx.textAlign = 'left';
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 26px "Segoe UI", sans-serif';
      ctx.fillText('OPORTUNIDADE DE FREELANCER', 70, 185);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px "Segoe UI", sans-serif';
      const roleText = (job.role || 'CARREGADOR').toUpperCase();
      ctx.fillText(roleText.slice(0, 24), 70, 255);

      // Vacancies badge
      const vacanciesText = `🔥 ${job.vacanciesCount || '70 VAGAS DISPONÍVEIS'}`.toUpperCase();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(70, 285, 340, 46, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillText(vacanciesText, 85, 316);

      // 4. BIG CACHÊ / PAYMENT CARD
      const cacheCardY = 360;
      const cacheGrad = ctx.createLinearGradient(70, cacheCardY, width - 70, cacheCardY + 140);
      cacheGrad.addColorStop(0, 'rgba(6, 78, 59, 0.85)');
      cacheGrad.addColorStop(1, 'rgba(4, 47, 46, 0.9)');
      ctx.fillStyle = cacheGrad;
      ctx.beginPath();
      ctx.roundRect(70, cacheCardY, width - 140, 130, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillText('DIÁRIA / CACHÊ LÍQUIDO', 105, cacheCardY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 56px "Segoe UI", sans-serif';
      ctx.fillText(job.paymentValue || 'R$ 120,00', 105, cacheCardY + 105);

      // Payment Terms note
      ctx.fillStyle = '#d1fae5';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`💵 ${job.paymentTerms || 'Pagamento em 3 dias úteis'}`, width - 105, cacheCardY + 75);
      ctx.textAlign = 'left';

      // 5. SPECIFICATION INFO CARDS (Grid)
      const specY = 520;
      const cardW = 450;
      const cardH = 95;

      const specs = [
        { label: 'DATA DO EVENTO', val: job.dayOrDate || 'Segunda-feira (31/08)', icon: '📅' },
        { label: 'HORÁRIO', val: job.schedule || '08:00 às 20:00', icon: '⏰' },
        { label: 'LOCAL', val: job.location || 'Sesc Casa Verde', icon: '📍' },
        { label: 'BENEFÍCIO', val: job.benefits || 'Alimentação fornecida no local', icon: '🍽️' },
      ];

      specs.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 70 + col * (cardW + 40);
        const y = specY + row * (cardH + 20);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '28px "Segoe UI", sans-serif';
        ctx.fillText(item.icon, x + 20, y + 56);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.fillText(item.label, x + 65, y + 36);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 22px "Segoe UI", sans-serif';
        ctx.fillText(item.val.slice(0, 26), x + 65, y + 68);
      });

      // 6. QR CODE & APPLICATION SECTION
      const qrSectionY = height === 1350 ? 770 : 750;
      const qrSectionH = height === 1350 ? 430 : 250;

      ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
      ctx.beginPath();
      ctx.roundRect(70, qrSectionY, width - 140, qrSectionH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Generate QR Code as DataURL
      const qrSize = height === 1350 ? 240 : 190;
      try {
        const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
          margin: 1,
          width: qrSize,
          color: {
            dark: '#064e3b',
            light: '#ffffff'
          }
        });

        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
        });

        // Draw white frame for QR Code
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(100, qrSectionY + (qrSectionH - qrSize) / 2, qrSize, qrSize, 12);
        ctx.fill();

        ctx.drawImage(qrImg, 100, qrSectionY + (qrSectionH - qrSize) / 2, qrSize, qrSize);
      } catch (err) {
        console.warn('Could not generate QR code:', err);
      }

      // Text next to QR Code
      const qrTextX = 100 + qrSize + 40;
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 24px "Segoe UI", sans-serif';
      ctx.fillText('COMO SE CANDIDATAR:', qrTextX, qrSectionY + 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Segoe UI", sans-serif';
      ctx.fillText('APONTE A CÂMERA DO CELULAR', qrTextX, qrSectionY + 110);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px "Segoe UI", sans-serif';
      ctx.fillText('Ou clique no link do WhatsApp compartilhado!', qrTextX, qrSectionY + 150);

      if (height === 1350) {
        // Additional rules & tiktok on story format
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.roundRect(qrTextX, qrSectionY + 180, width - qrTextX - 100, 90, 10);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillText('⚠️ ATENÇÃO:', qrTextX + 15, qrSectionY + 215);

        ctx.fillStyle = '#ffffff';
        ctx.font = '19px "Segoe UI", sans-serif';
        const ruleSnippet = (job.observation || 'Proibido álcool no evento').slice(0, 50);
        ctx.fillText(ruleSnippet, qrTextX + 15, qrSectionY + 248);

        // TikTok banner note
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillText('🎮 Baixe o TikTok pelos links e concorra a prêmios!', qrTextX, qrSectionY + 310);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px "Segoe UI", sans-serif';
        ctx.fillText('⚡ Redirecionamento oficial direto para o WhatsApp', qrTextX, qrSectionY + 190);
      }

      // Footer brand
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText('FreelasHub • Plataforma de Vagas Rápidas & Conexão de Freelancers', width / 2, height - 42);

      if (isMounted) {
        setBannerUrl(canvas.toDataURL('image/png'));
      }
    }

    drawBanner();

    return () => {
      isMounted = false;
    };
  }, [isOpen, job, trackingUrl, bannerFormat]);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `freelashub-${(job.role || 'vaga').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setTimeout(() => setDownloading(false), 800);
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Flyer / Imagem da Vaga para WhatsApp
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Alta Resolução
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Poste esta imagem no grupo ou status junto com a mensagem de texto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format toggle */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setBannerFormat('feed')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  bannerFormat === 'feed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quadrado (1:1)
              </button>
              <button
                type="button"
                onClick={() => setBannerFormat('story')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  bannerFormat === 'story'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Status/Story (4:5)
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-950/40">
          
          {/* Canvas Display */}
          <div className="flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full">
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/50 group w-full">
              <canvas
                ref={canvasRef}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Gerado com QR Code real direcionado para o link rastreável do FreelasHub
            </p>
          </div>

          {/* Controls & Instructions */}
          <div className="w-full md:w-80 space-y-4">
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Como usar no WhatsApp
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Clique em <strong>"Copiar Imagem"</strong> ou <strong>"Baixar PNG"</strong>.<br/>
                2. No WhatsApp, anexe a foto da vaga no grupo.<br/>
                3. Cole a mensagem de texto gerada pelo FreelasHub na legenda.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyImage}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Imagem Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Imagem</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Baixando...' : 'Baixar Imagem PNG'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <span className="text-white font-semibold block mb-0.5">Dica de Conversão:</span>
              Grupos de WhatsApp com imagem do cartaz recebem até <strong>3x mais cliques</strong> e respostas mais rápidas dos candidatos.
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Resolução do flyer: {bannerFormat === 'story' ? '1080 x 1350px' : '1080 x 1080px'}</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
