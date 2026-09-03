import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Utensils, 
  AlertTriangle, 
  Phone, 
  Link as LinkIcon, 
  Calendar,
  Layers,
  Sparkles,
  Check,
  Globe,
  ExternalLink,
  Clipboard,
  RotateCcw,
  Navigation,
  Gamepad2,
  Share2
} from 'lucide-react';
import { JobPosting, FormatMode } from '../types';
import { PRESET_TEMPLATES, COMMON_TIKTOK_LINKS } from '../data/defaultTemplates';
import { generateGoogleMapsSearchUrl, extractTikTokUrl } from '../utils/formatter';

interface JobFormProps {
  job: JobPosting;
  onChange: (updated: Partial<JobPosting>) => void;
  onSave: () => void;
  isSaving: boolean;
  onApplyPreset: (preset: Partial<JobPosting>) => void;
}

export const JobForm: React.FC<JobFormProps> = ({
  job,
  onChange,
  onSave,
  isSaving,
  onApplyPreset
}) => {
  const [copiedLinkFeedback, setCopiedLinkFeedback] = useState(false);

  const handlePasteTikTokLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = extractTikTokUrl(text);
        onChange({ tiktokLink: cleaned, includeTiktokLink: true });
      }
    } catch {
      // ignore
    }
  };

  const handleAutoGenerateMapsUrl = () => {
    const query = job.address || job.location;
    if (query) {
      const url = generateGoogleMapsSearchUrl(query);
      onChange({ mapsUrl: url });
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkFeedback(true);
      setTimeout(() => setCopiedLinkFeedback(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      
      {/* Top Presets bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Estruturador de Postagem de Vagas
          </h2>
          <p className="text-xs text-slate-400">
            Configure os links do TikTok, Maps, endereço e dados para gerar a mensagem padrão do WhatsApp.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Modelos:
          </span>
          {PRESET_TEMPLATES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/80 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 border border-slate-600/60 transition-colors cursor-pointer capitalize"
            >
              {preset.role}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 DESTAQUE PRINCIPAL: LINK DOS JOGOS DO TIKTOK */}
      <div className="bg-gradient-to-r from-pink-950/40 via-slate-900/80 to-purple-950/40 p-4 rounded-xl border border-pink-500/30 shadow-lg shadow-pink-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                Link de Jogos do TikTok (Alteração Rápida)
              </h3>
              <p className="text-[11px] text-slate-400">
                Altere aqui o link da campanha ou jogo do TikTok que vai na mensagem antes do WhatsApp.
              </p>
            </div>
          </div>

          {/* Toggle include TikTok */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/70 shrink-0">
            <input
              type="checkbox"
              checked={job.includeTiktokLink !== false}
              onChange={(e) => onChange({ includeTiktokLink: e.target.checked })}
              className="w-4 h-4 text-pink-500 rounded bg-slate-900 border-slate-700 focus:ring-pink-500"
            />
            <span className="text-xs text-slate-200 font-medium">
              Incluir no WhatsApp
            </span>
          </label>
        </div>

        {/* TikTok URL Input & Action Buttons */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-tiktok-link"
                type="text"
                value={job.tiktokLink || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleaned = val.includes('tiktok.com') ? extractTikTokUrl(val) : val;
                  onChange({ tiktokLink: cleaned, includeTiktokLink: true });
                }}
                placeholder="https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/"
                className="w-full bg-slate-900/90 border border-pink-500/40 rounded-lg pl-3 pr-24 py-2.5 text-sm text-pink-200 font-mono focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
              />
              {job.tiktokLink && (
                <button
                  type="button"
                  onClick={() => onChange({ tiktokLink: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded bg-slate-800"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePasteTikTokLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Colar link da área de transferência (aceita mensagem completa de convite)"
              >
                <Clipboard className="w-3.5 h-3.5 text-pink-400" />
                Colar
              </button>

              {job.tiktokLink && (
                <a
                  href={job.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-semibold text-pink-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Testar link no TikTok"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Testar
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 <em>Dica: Pode colar a mensagem inteira do convite (ex: "Link tik tok *HD | Rebeca..."). O link é extraído sozinho!</em></span>
          </div>

          {/* Quick presets for TikTok links */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Links rápidos:</span>
            {COMMON_TIKTOK_LINKS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange({ tiktokLink: preset.url, includeTiktokLink: true })}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  job.tiktokLink === preset.url
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 font-bold ring-1 ring-pink-500/40'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Format Style Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Estilo de Formatação da Mensagem
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          
          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'tiktok_formal' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              job.formatStyle === 'tiktok_formal'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                🚨 Novo Modelo Oficial
              </span>
              {job.formatStyle === 'tiktok_formal' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Com TikTok, Maps, Cachê e Observações estruturadas
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'whatsapp_styled' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              job.formatStyle === 'whatsapp_styled'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">WhatsApp Formatado</span>
              {job.formatStyle === 'whatsapp_styled' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Negrito `*...*`, Emojis e marcadores detalhados
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'exact_plain' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              job.formatStyle === 'exact_plain'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Padrão Simples</span>
              {job.formatStyle === 'exact_plain' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Texto direto sem emojis, padrão clássico
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'minimal' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              job.formatStyle === 'minimal'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Compacto / Resumido</span>
              {job.formatStyle === 'minimal' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Lista curta em tópicos rápidos
            </span>
          </button>

        </div>
      </div>

      {/* SECTION 1: Função, Data e Horário */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          1. Cargo, Data e Vagas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Função / Cargo
            </label>
            <input
              id="input-role"
              type="text"
              value={job.role}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="Ex: Carregador, Garçom, Limpeza"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data do Evento (Texto)
            </label>
            <input
              id="input-day"
              type="text"
              value={job.dayOrDate}
              onChange={(e) => {
                const val = e.target.value;
                const match = val.match(/\((\d{1,2}\/\d{1,2})\)/);
                onChange({ 
                  dayOrDate: val,
                  ...(match ? { dateShort: match[1] } : {})
                });
              }}
              placeholder="Ex: Segunda-feira (31/08)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data Curta no Título
            </label>
            <input
              id="input-date-short"
              type="text"
              value={job.dateShort || ''}
              onChange={(e) => onChange({ dateShort: e.target.value })}
              placeholder="Ex: 31/08"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quantidade de Vagas
            </label>
            <input
              id="input-vacancies"
              type="text"
              value={job.vacanciesCount}
              onChange={(e) => onChange({ vacanciesCount: e.target.value })}
              placeholder="Ex: 70 vagas, 15 vagas"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Perfil / Requisitos
            </label>
            <input
              id="input-requirements"
              type="text"
              value={job.requirements}
              onChange={(e) => onChange({ requirements: e.target.value })}
              placeholder="Ex: Homens e Mulheres"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Horário do Turno
            </label>
            <input
              id="input-schedule"
              type="text"
              value={job.schedule}
              onChange={(e) => onChange({ schedule: e.target.value })}
              placeholder="Ex: 08:00 às 20:00, 8 as 20"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

        </div>
      </div>

      {/* SECTION 2: Cachê e Pagamento */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          2. Cachê, Benefícios e Pagamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Cachê / Diária
            </label>
            <input
              id="input-payment-value"
              type="text"
              value={job.paymentValue}
              onChange={(e) => onChange({ paymentValue: e.target.value })}
              placeholder="Ex: R$ 120,00, 120 reais"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-orange-400" />
              Alimentação / Benefícios
            </label>
            <input
              id="input-benefits"
              type="text"
              value={job.benefits}
              onChange={(e) => onChange({ benefits: e.target.value })}
              placeholder="Ex: Alimentação fornecida no local"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              Prazo e Forma de Pagamento
            </label>
            <input
              id="input-payment-terms"
              type="text"
              value={job.paymentTerms}
              onChange={(e) => onChange({ paymentTerms: e.target.value })}
              placeholder="Ex: 3 dias úteis após o término do evento"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

        </div>
      </div>

      {/* SECTION 3: Localização e Google Maps */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            3. Local e Rota no Google Maps
          </h3>
          <button
            type="button"
            onClick={handleAutoGenerateMapsUrl}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
            title="Gerar link do Google Maps automaticamente pelo endereço"
          >
            <Navigation className="w-3 h-3" />
            Auto-gerar link Maps
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome do Local
            </label>
            <input
              id="input-location"
              type="text"
              value={job.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Ex: Sesc Casa Verde"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Endereço Completo
            </label>
            <input
              id="input-address"
              type="text"
              value={job.address || ''}
              onChange={(e) => {
                const addr = e.target.value;
                onChange({ 
                  address: addr,
                  mapsUrl: generateGoogleMapsSearchUrl(addr || job.location)
                });
              }}
              placeholder="Ex: Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* Maps URL with test button */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              Link do Google Maps (`🗺️ Traçar rota no Maps:`)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              id="input-maps-url"
              type="url"
              value={job.mapsUrl || (job.address ? generateGoogleMapsSearchUrl(job.address) : '')}
              onChange={(e) => onChange({ mapsUrl: e.target.value })}
              placeholder="https://www.google.com/maps/search/?api=1&query=..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            {job.mapsUrl && (
              <a
                href={job.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 rounded-lg flex items-center gap-1 shrink-0"
                title="Abrir no Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: Observação e Regras */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          4. Observação / Proibições
        </h3>

        <div>
          <textarea
            id="input-observation"
            rows={2}
            value={job.observation || ''}
            onChange={(e) => onChange({ observation: e.target.value })}
            placeholder="Ex: Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento)."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* SECTION 5: Contato e WhatsApp Link */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          5. Contato e WhatsApp com Contador de Cliques
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              WhatsApp para Contato (DDD + Número)
            </label>
            <input
              id="input-contact-phone"
              type="text"
              value={job.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="Ex: 5511921254453 ou 11921254453"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              Slug do Link Rastreador (/r/:slug)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">/r/</span>
              <input
                id="input-slug"
                type="text"
                value={job.slug}
                onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                placeholder="Ex: sesc-70"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mensagem Pré-configurada ao Clicar no WhatsApp
            </label>
            <input
              id="input-custom-msg"
              type="text"
              value={job.customWhatsAppMessage || ''}
              onChange={(e) => onChange({ customWhatsAppMessage: e.target.value })}
              placeholder="Ex: Olá! Tenho interesse na vaga de carregador no Sesc Casa Verde para segunda."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        {/* Toggles */}
        <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-slate-800">
          
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={job.includeTrackingLink}
              onChange={(e) => onChange({ includeTrackingLink: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-cyan-400" />
              Contabilizar cliques no link da vaga (/r/{job.slug})
            </span>
          </label>

        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          id="btn-save-job"
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando Vaga...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Salvar Alterações e Atualizar
            </>
          )}
        </button>
      </div>

    </div>
  );
};
