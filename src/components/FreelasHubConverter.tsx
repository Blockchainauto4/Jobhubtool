import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  RotateCcw, 
  MousePointerClick, 
  Clipboard, 
  Trash2, 
  Smartphone, 
  Share2, 
  Gamepad2, 
  Phone, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Wand2,
  Users,
  Calendar,
  Eye,
  FileText,
  Navigation,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobPosting } from '../types';
import { generateFormattedPost, parseRawJobText, extractTikTokUrl } from '../utils/formatter';
import { COMMON_TIKTOK_LINKS } from '../data/defaultTemplates';
import { JobBannerModal } from './JobBannerModal';

interface FreelasHubConverterProps {
  job: JobPosting;
  onChange: (updated: Partial<JobPosting>) => void;
  onSave: () => void;
  isSaving: boolean;
  onSimulateClick: () => void;
  onResetClicks: () => void;
  isSimulatingClick: boolean;
}

const DEFAULT_RAW_TEXT = `Boa tarde 70 vagas pra segunda feira
Sesc casa verde
Carregador
8 as 20
120 reais
Fornecemos a alimentação
Pagamento no término do evento 3 dias úteis pra frente
Proibido chegar bêbado
Se vim bêbado ou beber no evento não vai receber
Disponível pra homem e mulher
Número pra contato: 11921254453`;

export const FreelasHubConverter: React.FC<FreelasHubConverterProps> = ({
  job,
  onChange,
  onSave,
  isSaving,
  onSimulateClick,
  onResetClicks,
  isSimulatingClick
}) => {
  const [rawInput, setRawInput] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isProcessingGemini, setIsProcessingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [aiHeadline, setAiHeadline] = useState<string>('');
  const [aiAdCopy, setAiAdCopy] = useState<string>('');
  const [isProcessed, setIsProcessed] = useState(false);
  const [justProcessedAlert, setJustProcessedAlert] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [outputViewMode, setOutputViewMode] = useState<'clean_card' | 'whatsapp_text'>('clean_card');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://freelashub.app';
  const trackingUrl = `${baseUrl}/r/${job.slug}`;

  // Generate the formatted output string
  const formattedOutput = generateFormattedPost(job, {
    baseUrl,
    overrideIncludeLink: job.includeTrackingLink
  });

  // Handle local text parsing
  const handleProcessMessage = () => {
    if (!rawInput.trim()) {
      return;
    }

    const parsed = parseRawJobText(rawInput);
    onChange({
      ...parsed,
      // preserve tiktokLink unless a new one was found in text
      tiktokLink: parsed.tiktokLink || job.tiktokLink,
      contactPhone: parsed.contactPhone || job.contactPhone
    });

    setIsProcessed(true);
    setJustProcessedAlert(true);
    setTimeout(() => setJustProcessedAlert(false), 2500);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Save state
    setTimeout(() => {
      onSave();
    }, 100);
  };

  // Handle Gemini Multimodal Processing (Image or Text)
  const handleProcessWithGemini = async () => {
    if (!selectedImageBase64 && !rawInput.trim()) {
      return;
    }

    setIsProcessingGemini(true);
    setGeminiError(null);

    try {
      const response = await fetch('/api/gemini/process-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImageBase64 || undefined,
          mimeType: selectedImageMime || 'image/jpeg',
          rawText: rawInput.trim() || undefined
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Não foi possível processar os dados com o Gemini.');
      }

      const d = result.data;

      // Update parent job model
      onChange({
        role: d.role || job.role,
        vacanciesCount: d.vacanciesCount || job.vacanciesCount,
        dayOrDate: d.dayOrDate || job.dayOrDate,
        dateShort: d.dateShort || job.dateShort,
        schedule: d.schedule || job.schedule,
        paymentValue: d.paymentValue || job.paymentValue,
        benefits: d.benefits || job.benefits,
        paymentTerms: d.paymentTerms || job.paymentTerms,
        location: d.location || job.location,
        address: d.address || job.address,
        requirements: d.requirements || job.requirements,
        observation: d.observation || job.observation,
        rules: Array.isArray(d.rules) && d.rules.length > 0 ? d.rules : job.rules,
        contactPhone: d.contactPhone || job.contactPhone,
        tiktokLink: d.tiktokLink || job.tiktokLink
      });

      if (d.headline) setAiHeadline(d.headline);
      if (d.socialAdCopy) setAiAdCopy(d.socialAdCopy);

      // If user provided only an image without text, show brief extracted transcript in Field 1
      if (!rawInput.trim() && selectedImageBase64) {
        setRawInput(
          `[Dados extraídos do print com Gemini AI]\nCargo: ${d.role || ''}\nVagas: ${d.vacanciesCount || ''}\nData: ${d.dayOrDate || ''}\nHorário: ${d.schedule || ''}\nCachê: ${d.paymentValue || ''}\nLocal: ${d.location || ''}\nBenefícios: ${d.benefits || ''}`
        );
      }

      setIsProcessed(true);
      setJustProcessedAlert(true);
      setTimeout(() => setJustProcessedAlert(false), 3000);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onSave();
      }, 100);
    } catch (err: any) {
      setGeminiError(err.message || 'Erro ao processar com Gemini.');
    } finally {
      setIsProcessingGemini(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setSelectedImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageBase64(event.target?.result as string);
      setGeminiError(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          setImageFileName(file.name || 'print-whatsapp.png');
          setSelectedImageMime(file.type);
          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedImageBase64(event.target?.result as string);
            setGeminiError(null);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageBase64(null);
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawInput(text);
      }
    } catch {
      // ignore
    }
  };

  const handleCopyFormattedText = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopiedMessage(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(formattedOutput);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleClearRaw = () => {
    setRawInput('');
    setIsProcessed(false);
  };

  const handleLoadSample = () => {
    setRawInput(DEFAULT_RAW_TEXT);
  };

  return (
    <div className="space-y-6">
      
      {/* 🔢 DESTAQUE PRINCIPAL: CONTADOR DE ACESSOS AO LINK */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 p-5 rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Contador de Acessos FreelasHub
              </h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {job.clicksCount || 0}
              </span>
              <span className="text-sm font-medium text-slate-300">
                {(job.clicksCount || 0) === 1 ? 'acesso registrado' : 'vezes que o link foi acessado'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cada candidato que clica no link é contabilizado e encaminhado direto para o WhatsApp da vaga.
            </p>
          </div>

          {/* Action buttons & link display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Tracking link pill */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-400 truncate max-w-[170px] sm:max-w-[210px] font-mono">
                /r/<span className="text-emerald-300 font-bold">{job.slug}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyTrackingLink}
                className="ml-2 text-slate-300 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Copiar link rastreável"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>

            {/* Test click button (+1) */}
            <button
              type="button"
              onClick={onSimulateClick}
              disabled={isSimulatingClick}
              className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Testar clique no link e registrar acesso no contador"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              {isSimulatingClick ? 'Registrando...' : 'Testar Acesso (+1)'}
            </button>

            {/* Reset button */}
            <button
              type="button"
              onClick={onResetClicks}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Zerar contador desta vaga"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>

      {/* 🚀 CONFIGURAÇÃO RÁPIDA: LINK DOS JOGOS DO TIKTOK & CONTATO */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                Link dos Jogos do TikTok
              </h3>
              <p className="text-[11px] text-slate-400">
                Altere aqui o link da campanha ou jogo que vai na linha do WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">WhatsApp Destino:</span>
            <input
              type="text"
              value={job.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="11921254453"
              className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Input do TikTok */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={job.tiktokLink || ''}
              onChange={(e) => {
                const val = e.target.value;
                const cleaned = val.includes('tiktok.com') ? extractTikTokUrl(val) : val;
                onChange({ tiktokLink: cleaned, includeTiktokLink: true });
              }}
              placeholder="https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/"
              className="w-full bg-slate-950/80 border border-pink-500/30 rounded-xl px-3 py-2 text-xs text-pink-200 font-mono focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {job.tiktokLink && (
              <a
                href={job.tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-semibold text-pink-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Testar Link
              </a>
            )}
          </div>
        </div>

        {/* Presets rápidos do TikTok */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500">Modelos de Link:</span>
          {COMMON_TIKTOK_LINKS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange({ tiktokLink: preset.url, includeTiktokLink: true })}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                job.tiktokLink === preset.url
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📝 OS DOIS CAMPOS PRINCIPAIS (ENTRADA & FORMATAÇÃO FREELASHUB) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CAMPO 1: JOGAR A MENSAGEM INTEIRA / PRINT (ENTRADA) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col shadow-xl">
          
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center border border-slate-700">
                  1
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Texto ou Print da Vaga
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Gemini AI Multimodal
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cole o texto bruto OU anexe/cole um print do WhatsApp da vaga.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                title="Fazer upload de print do WhatsApp ou cartaz"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anexar Print</span>
              </button>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                title="Colar texto da área de transferência"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                Colar
              </button>

              {(rawInput || selectedImageBase64) && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearRaw();
                    handleRemoveImage();
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Limpar tudo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnail preview if image attached */}
          {selectedImageBase64 && (
            <div className="mb-3 p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={selectedImageBase64}
                  alt="Print da vaga"
                  className="w-12 h-12 object-cover rounded-lg border border-emerald-500/40 shadow-sm"
                />
                <div className="text-xs truncate">
                  <div className="text-emerald-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Print da vaga carregado
                  </div>
                  <div className="text-slate-400 truncate text-[11px]">
                    {imageFileName || 'Pronto para leitura com o modelo Gemini 3.8 Flash'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2 py-1 text-slate-400 hover:text-rose-400 text-xs rounded hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-1"
                title="Remover imagem"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remover</span>
              </button>
            </div>
          )}

          <div className="flex-1 relative min-h-[300px]">
            <textarea
              ref={textareaRef}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              onPaste={handlePasteEvent}
              placeholder="Cole aqui o texto da vaga OU pressione Ctrl+V para colar um print diretamente...

Exemplo de texto:
Boa tarde 70 vagas pra segunda feira
Sesc casa verde
Carregador
8 as 20
120 reais
Fornecemos a alimentação
Pagamento 3 dias úteis..."
              className="w-full h-full min-h-[300px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Feedback & Error */}
          {geminiError && (
            <div className="mt-2 p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{geminiError}</span>
            </div>
          )}

          {isProcessingGemini && (
            <div className="mt-2 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />
              <span>
                {selectedImageBase64
                  ? 'O Gemini 3.8 Flash está analisando o print e extraindo os dados da vaga...'
                  : 'O Gemini está aprimorando e estruturando os dados da vaga...'}
              </span>
            </div>
          )}

          {/* ⚡ BOTÕES DE PROCESSAMENTO (GEMINI IA & RÁPIDO) */}
          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={handleProcessWithGemini}
              disabled={isProcessingGemini || (!rawInput.trim() && !selectedImageBase64)}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                selectedImageBase64 || rawInput.trim()
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/20 ring-1 ring-emerald-300/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-75'
              }`}
            >
              {isProcessingGemini ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Processando com Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>
                    {selectedImageBase64
                      ? '✨ Ler Imagem & Criar Mensagem com Gemini AI (Grátis)'
                      : rawInput.trim()
                        ? '✨ Processar & Otimizar com Gemini AI (Grátis)'
                        : 'Anexe um print ou cole o texto acima'}
                  </span>
                </>
              )}
            </button>

            {/* Local offline process button (optional quick fallback) */}
            {rawInput.trim() && (
              <button
                type="button"
                onClick={handleProcessMessage}
                disabled={isProcessingGemini}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Ou usar Processamento Rápido Local (sem IA)</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
              <span>
                {selectedImageBase64
                  ? '📷 1 print anexado (suporta PNG, JPG e WEBP)'
                  : rawInput
                    ? `${rawInput.split('\n').filter(Boolean).length} linhas • ${rawInput.length} caracteres`
                    : 'Suporte a Ctrl+V com imagem copiada'}
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-amber-400/90 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                Exemplo de teste
              </button>
            </div>
          </div>

        </div>

        {/* CAMPO 2: FORMATAÇÃO PARA O FREELASHUB (SAÍDA) */}
        <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-5 flex flex-col shadow-xl shadow-emerald-950/20">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/40">
                  2
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Visualização da Vaga
                  {isProcessed ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Organizada
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                      Aguardando
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Leitura clean, direta e pronta para divulgação rápida no WhatsApp.
              </p>
            </div>

            {/* View Switcher & Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOutputViewMode('clean_card')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    outputViewMode === 'clean_card'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Leitura Clean</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutputViewMode('whatsapp_text')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    outputViewMode === 'whatsapp_text'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Texto WhatsApp</span>
                </button>
              </div>

              {isProcessed && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBannerModal(true)}
                    className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Gerar Flyer / Imagem da Vaga"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Flyer HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="px-2.5 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-xs font-semibold rounded-lg border border-green-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Abrir no WhatsApp Web"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sub-header Format pills when in WhatsApp Text mode */}
          {outputViewMode === 'whatsapp_text' && isProcessed && (
            <div className="mb-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Estilo do Texto:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'clean_modern', label: '✨ Clean (Recomendado)' },
                  { id: 'tiktok_formal', label: '📋 Formal' },
                  { id: 'minimal', label: '⚡ Direto' },
                  { id: 'exact_plain', label: '📄 Sem Emojis' },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => onChange({ formatStyle: fmt.id as any })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      (job.formatStyle || 'clean_modern') === fmt.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 relative min-h-[320px] flex flex-col">
            {isProcessed ? (
              outputViewMode === 'clean_card' ? (
                /* ============================================================ */
                /* LEITURA CLEAN - CARD MODERNO, RESPONSIVO E AGRADÁVEL         */
                /* ============================================================ */
                <div className="flex-1 bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-inner">
                  {/* Cabeçalho da Vaga */}
                  <div className="space-y-2 pb-3 border-b border-slate-800/90">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {job.vacanciesCount || 'Vagas Abertas'}
                      </span>
                      {job.requirements && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          👥 {job.requirements}
                        </span>
                      )}
                      {(job.city || job.category) && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
                          📍 {job.city || 'São Paulo'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {job.role || 'Oportunidade de Freela'}
                    </h2>
                  </div>

                  {/* 4 Blocos de Informação Essenciais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Cachê & Pagamento */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Cachê / Diária</div>
                        <div className="text-base font-black text-emerald-400 truncate">
                          {job.paymentValue || 'A combinar'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          💳 {job.paymentTerms || 'Pagamento padrão'}
                        </div>
                      </div>
                    </div>

                    {/* 2. Agenda & Horário */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Data & Horário</div>
                        <div className="text-sm font-bold text-white truncate">
                          {job.dayOrDate || 'A definir'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          ⏰ {job.schedule || 'Horário a combinar'}
                        </div>
                      </div>
                    </div>

                    {/* 3. Localização */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Local do Evento</div>
                        <div className="text-sm font-bold text-white truncate">
                          {job.location || 'Local a confirmar'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {job.address || 'Endereço será informado'}
                        </div>
                        {(job.mapsUrl || job.address || job.location) && (
                          <a
                            href={job.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address || job.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline mt-1"
                          >
                            <Navigation className="w-3 h-3" /> Traçar Rota no Maps ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 4. Benefícios */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Benefícios & Extras</div>
                        <div className="text-sm font-bold text-slate-200">
                          {job.benefits || 'Alimentação inclusa no local'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Incluso para o profissional
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aviso & Regras (se houver) */}
                  {job.observation && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Aviso importante:</strong> {job.observation}
                      </div>
                    </div>
                  )}

                  {/* Link Rastreável Ativo */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Link Inteligente WhatsApp</div>
                        <div className="text-xs font-mono text-emerald-300 truncate">
                          {trackingUrl}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={handleCopyTrackingLink}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={onSimulateClick}
                        disabled={isSimulatingClick}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Simular clique no rastreador"
                      >
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span>{job.clicksCount || 0} cliques</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ============================================================ */
                /* TEXTO WHATSAPP MONOSPACE COM CÓPIA RÁPIDA                    */
                /* ============================================================ */
                <textarea
                  readOnly
                  value={formattedOutput}
                  className="w-full flex-1 min-h-[300px] bg-slate-950/90 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-100 font-mono leading-relaxed resize-y focus:outline-none selection:bg-emerald-600 selection:text-white"
                />
              )
            ) : (
              <div className="w-full flex-1 min-h-[300px] bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Aguardando Processamento
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-3">
                  Cole a mensagem ou anexe o print no <strong>Campo 1</strong> e clique em <strong>"Processar com Gemini AI"</strong> para gerar a visualização clean e o flyer.
                </p>
                <div className="text-[11px] text-slate-500 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                  ⚡ O FreelasHub organiza automaticamente horário, local, cachê e links
                </div>
              </div>
            )}
          </div>

          {/* AI Headline & Suggestions if generated */}
          {aiHeadline && isProcessed && (
            <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Chamada sugerida pelo Gemini para o Flyer:
              </div>
              <div className="text-slate-200 font-semibold">{aiHeadline}</div>
              {aiAdCopy && <div className="text-[11px] text-slate-400">{aiAdCopy}</div>}
            </div>
          )}

          <div className="pt-3 space-y-2">
            {/* Action Buttons */}
            {isProcessed ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCopyFormattedText}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>Mensagem WhatsApp Copiada com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copiar Mensagem Formatada para WhatsApp</span>
                    </>
                  )}
                </button>

                {/* Generate Image Button */}
                <button
                  type="button"
                  onClick={() => setShowBannerModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/40 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>🖼️ Gerar Flyer / Imagem da Vaga para WhatsApp</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
                    PNG HD
                  </span>
                </button>
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl text-center text-xs text-slate-500 bg-slate-950/60 border border-slate-800/80">
                A mensagem formatada e os botões de imagem serão liberados após processar
              </div>
            )}

            {isProcessed && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>{formattedOutput.length} caracteres no WhatsApp</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.includeTrackingLink !== false}
                    onChange={(e) => onChange({ includeTrackingLink: e.target.checked })}
                    className="w-3.5 h-3.5 text-emerald-500 rounded bg-slate-800 border-slate-700"
                  />
                  <span>Incluir link rastreador de cliques</span>
                </label>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL DO GERADOR DE IMAGEM / FLYER DA VAGA */}
      <JobBannerModal
        job={job}
        trackingUrl={trackingUrl}
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
      />

      {/* DETALHES ADICIONAIS / CAMPOS AVANÇADOS ORGANIZADOS */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowAdvancedFields(!showAdvancedFields)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Editar e Ajustar Informações da Vaga</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Formulário Simplificado
            </span>
          </div>
          {showAdvancedFields ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvancedFields && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/50 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* BLOCO 1: O TRABALHO & REMUNERAÇÃO */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <DollarSign className="w-4 h-4" />
                  1. O Trabalho & Remuneração
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Cargo / Função Principal
                  </label>
                  <input
                    type="text"
                    value={job.role}
                    onChange={(e) => onChange({ role: e.target.value })}
                    placeholder="Ex: Carregador"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">
                      Vagas Abertas
                    </label>
                    <input
                      type="text"
                      value={job.vacanciesCount || ''}
                      onChange={(e) => onChange({ vacanciesCount: e.target.value })}
                      placeholder="Ex: 70 vagas"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">
                      Perfil Aceito
                    </label>
                    <input
                      type="text"
                      value={job.requirements || ''}
                      onChange={(e) => onChange({ requirements: e.target.value })}
                      placeholder="Ex: Homens e Mulheres"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Cachê / Diária
                  </label>
                  <input
                    type="text"
                    value={job.paymentValue}
                    onChange={(e) => onChange({ paymentValue: e.target.value })}
                    placeholder="Ex: R$ 120,00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Prazo de Pagamento
                  </label>
                  <input
                    type="text"
                    value={job.paymentTerms || ''}
                    onChange={(e) => onChange({ paymentTerms: e.target.value })}
                    placeholder="Ex: 3 dias úteis"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Benefícios & Extras
                  </label>
                  <input
                    type="text"
                    value={job.benefits || ''}
                    onChange={(e) => onChange({ benefits: e.target.value })}
                    placeholder="Ex: Alimentação no local"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* BLOCO 2: DATA & LOCALIZAÇÃO */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <MapPin className="w-4 h-4" />
                  2. Agenda & Localização
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Data do Evento
                  </label>
                  <input
                    type="text"
                    value={job.dayOrDate}
                    onChange={(e) => onChange({ dayOrDate: e.target.value })}
                    placeholder="Ex: Segunda-feira (31/08)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Horário de Trabalho
                  </label>
                  <input
                    type="text"
                    value={job.schedule}
                    onChange={(e) => onChange({ schedule: e.target.value })}
                    placeholder="Ex: 08:00 às 20:00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Local / Estabelecimento
                  </label>
                  <input
                    type="text"
                    value={job.location}
                    onChange={(e) => onChange({ location: e.target.value })}
                    placeholder="Ex: Sesc Casa Verde"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Endereço Completo (Para o Maps)
                  </label>
                  <input
                    type="text"
                    value={job.address || ''}
                    onChange={(e) => onChange({ address: e.target.value })}
                    placeholder="Ex: Av. Casa Verde, 327 - São Paulo, SP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Link Personalizado do Maps (Opcional)
                  </label>
                  <input
                    type="text"
                    value={job.mapsUrl || ''}
                    onChange={(e) => onChange({ mapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* BLOCO 3: CONTATO, REGRAS & MURAL */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <Phone className="w-4 h-4" />
                  3. Contato, Regras & Mural
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    WhatsApp de Contato (DDD + Número)
                  </label>
                  <input
                    type="text"
                    value={job.contactPhone || ''}
                    onChange={(e) => onChange({ contactPhone: e.target.value })}
                    placeholder="Ex: 5511999998888"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Avisos / Regras do Evento
                  </label>
                  <input
                    type="text"
                    value={job.observation || ''}
                    onChange={(e) => onChange({ observation: e.target.value })}
                    placeholder="Ex: Proibido consumo de álcool no evento."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Mural Colaborativo */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Mural Colaborativo Frila Hub
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Seu Nome / Grupo
                      </label>
                      <input
                        type="text"
                        value={job.creatorName || ''}
                        onChange={(e) => onChange({ creatorName: e.target.value })}
                        placeholder="Ex: Staff SP"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Cidade / Região
                      </label>
                      <input
                        type="text"
                        value={job.city || ''}
                        onChange={(e) => onChange({ city: e.target.value })}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Categoria
                    </label>
                    <select
                      value={job.category || 'eventos'}
                      onChange={(e) => onChange({ category: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="eventos">🎉 Eventos & Shows</option>
                      <option value="logistica">📦 Carga & Logística</option>
                      <option value="gastronomia">🍽️ Bar, Buffet & Garçom</option>
                      <option value="promocao">📢 Promoção & Recepção</option>
                      <option value="geral">⚙️ Serviços Gerais</option>
                    </select>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk-public-hub"
                      checked={job.isPublicHub !== false}
                      onChange={(e) => onChange({ isPublicHub: e.target.checked })}
                      className="w-3.5 h-3.5 text-emerald-500 rounded bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="chk-public-hub" className="text-[11px] text-slate-300 cursor-pointer">
                      Compartilhar no <strong>Mural Comunitário</strong>
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};
