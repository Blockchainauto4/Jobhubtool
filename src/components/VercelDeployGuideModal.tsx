import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Check, 
  Copy, 
  Terminal, 
  Zap, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const vercelJsonExample = `{
  "version": 2,
  "rewrites": [
    {
      "source": "/r/:slug",
      "destination": "/api/redirect?slug=:slug"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const vercelServerlessExample = `// api/redirect.ts (Vercel Serverless Function)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv'; // ou Upstash Redis

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  if (!slug) return res.status(400).send('Slug obrigatório');

  // 1. Incrementa o contador de cliques no Vercel KV
  const clicks = await kv.incr(\`job:\${slug}:clicks\`);

  // 2. Busca os dados da vaga
  const job = await kv.get(\`job:\${slug}\`);
  const phone = job?.contactPhone || '5511921254453';
  const role = job?.role || 'Vaga';

  // 3. Redireciona para o WhatsApp
  const waUrl = \`https://wa.me/\${phone}?text=\${encodeURIComponent(\`Olá! Vi a vaga de \${role} e quero me candidatar.\`)}\`;
  return res.redirect(302, waUrl);
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Como Subir o Frila Hub para o Vercel
              </h2>
              <p className="text-xs text-slate-400">
                Passo a passo rápido para hospedar a plataforma colaborativa com IA e links rastreáveis no Vercel.
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <strong className="text-white block text-sm mb-0.5">
                Contador de Cliques Já 100% Funcional no App!
              </strong>
              Seu backend Node/Express já está operando com a rota <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">/r/:slug</code> que registra acessos, identifica aparelhos (celular/PC) e redireciona os candidatos instantaneamente para o WhatsApp.
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Opção 1: Deploy Direto no Vercel (Recomendado)
            </h3>
            <p className="text-slate-400">
              Este projeto já possui o arquivo <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">vercel.json</code> configurado para rotear todas as páginas e links rastreados:
            </p>

            <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => handleCopy(vercelJsonExample, 'vercelJson')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
              >
                {copiedCode === 'vercelJson' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'vercelJson' ? 'Copiado' : 'Copiar'}
              </button>
              <pre className="overflow-x-auto">{vercelJsonExample}</pre>
            </div>
          </div>

          {/* Step 2: Vercel KV integration */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Opção 2: Serverless Function com Vercel KV (Persistência Global)
            </h3>
            <p className="text-slate-400">
              Se você preferir usar o banco Redis integrado do Vercel (Vercel KV), basta criar a função serverless <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">api/redirect.ts</code>:
            </p>

            <div className="relative bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => handleCopy(vercelServerlessExample, 'vercelKV')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
              >
                {copiedCode === 'vercelKV' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === 'vercelKV' ? 'Copiado' : 'Copiar'}
              </button>
              <pre className="overflow-x-auto">{vercelServerlessExample}</pre>
            </div>
          </div>

          {/* Step 3: Commands */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-white block">Como publicar via Terminal:</span>
            <div className="bg-slate-950 p-2 rounded text-emerald-300 font-mono text-[11px]">
              npm i -g vercel && vercel deploy --prod
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            Acessar painel do Vercel <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
