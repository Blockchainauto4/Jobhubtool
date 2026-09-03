import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  FileText,
  Check
} from 'lucide-react';
import { parseRawJobText } from '../utils/formatter';
import { JobPosting } from '../types';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: Partial<JobPosting>) => void;
}

export const SmartPasteModal: React.FC<SmartPasteModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData
}) => {
  const [rawText, setRawText] = useState(
`Boa tarde 70 vagas pra segunda feira
Localização Sesc casa verde 
Função carregador 
Horário 8 as 20 
120 reais 
Pagamento no término do evento 3 dias úteis pra frente 
Fornecemos a alimentação 
Proibido chegar bêbado 
Se vim bêbado ou beber no evento não vai receber 
Disponível pra homem e mulher a número pra contato 
11921254453`
  );

  const [previewData, setPreviewData] = useState<Partial<JobPosting> | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    const parsed = parseRawJobText(rawText);
    setPreviewData(parsed);
  };

  const handleConfirm = () => {
    const parsed = previewData || parseRawJobText(rawText);
    onApplyParsedData(parsed);
    onClose();
  };

  const loadNewTikTokPromptExample = () => {
    setRawText(
`🚨 VAGAS PARA CARREGADOR (31/08) 🚨

💼 Função: Carregador (70 vagas | Homens e Mulheres)

📅 Data: Segunda-feira (31/08) das 08:00 às 20:00
💰 Cachê: R$ 120,00 (Alimentação fornecida no local)

💳 Pagamento: 3 dias úteis após o término do evento

📍 Local: Sesc Casa Verde – Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP

🗺️ Traçar rota no Maps: https://www.google.com/maps/search/?api=1&query=Av.+Casa+Verde,+327+-+Jardim+Sao+Bento,+Sao+Paulo+-+SP

⚠️ Observação: Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).

📲 Chamar no WhatsApp: https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/ https://wa.me/5511921254453?text=Olá!%20Tenho%20interesse%20na%20vaga%20de%20carregador%20no%20Sesc%20Casa%20Verde%20para%20segunda.`
    );
    setPreviewData(null);
  };

  const loadPromptExample = () => {
    setRawText(
`Boa tarde 70 vagas pra segunda feira
Localização Sesc casa verde 
Função carregador 
Horário 8 as 20 
120 reais 
Pagamento no término do evento 3 dias úteis pra frente 
Fornecemos a alimentação 
Proibido chegar bêbado 
Se vim bêbado ou beber no evento não vai receber 
Disponível pra homem e mulher a número pra contato 
11921254453`
    );
    setPreviewData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Auto Preenchimento & Extrator Inteligente
              </h2>
              <p className="text-xs text-slate-400">
                Cole o texto bruto de qualquer anúncio ou áudio transcrito para formalizar no padrão.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Cole seu texto bruto abaixo:
            </label>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadNewTikTokPromptExample}
                className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1 font-medium"
              >
                🚨 Exemplo Novo (TikTok + Maps)
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={loadPromptExample}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
              >
                Exemplo Texto Puro
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setPreviewData(null);
            }}
            rows={8}
            placeholder="Cole aqui o texto da vaga..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
          />

          {/* Quick extract button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleParse}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Analisar Campos Detectados</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Detecta cabeçalho, local, função, valor, regras e telefone
            </span>
          </div>

          {/* Preview extracted card */}
          {previewData && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Campos Identificados com Sucesso:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                <div><strong className="text-slate-400">Função/Data:</strong> {previewData.role} {previewData.dateShort ? `(${previewData.dateShort})` : ''}</div>
                <div><strong className="text-slate-400">Vagas / Perfil:</strong> {previewData.vacanciesCount} | {previewData.requirements}</div>
                <div><strong className="text-slate-400">Data / Horário:</strong> {previewData.dayOrDate} das {previewData.schedule}</div>
                <div><strong className="text-slate-400">Cachê / Benefício:</strong> {previewData.paymentValue} ({previewData.benefits})</div>
                <div><strong className="text-slate-400">Pagamento:</strong> {previewData.paymentTerms}</div>
                <div><strong className="text-slate-400">Local / Endereço:</strong> {previewData.location} {previewData.address ? `– ${previewData.address}` : ''}</div>
                <div><strong className="text-slate-400">WhatsApp:</strong> {previewData.contactPhone}</div>
                {previewData.tiktokLink && (
                  <div className="sm:col-span-2 text-pink-300 truncate">
                    <strong className="text-pink-400">TikTok Jogos:</strong> {previewData.tiktokLink}
                  </div>
                )}
                {previewData.mapsUrl && (
                  <div className="sm:col-span-2 text-cyan-300 truncate">
                    <strong className="text-cyan-400">Maps:</strong> {previewData.mapsUrl}
                  </div>
                )}
                {previewData.observation && (
                  <div className="sm:col-span-2 text-amber-300">
                    <strong className="text-amber-400">Observação:</strong> {previewData.observation}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <span>Preencher Formulário Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
