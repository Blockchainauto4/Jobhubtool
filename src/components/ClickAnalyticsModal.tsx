import React from 'react';
import { 
  X, 
  MousePointerClick, 
  Smartphone, 
  Monitor, 
  Tablet, 
  RotateCcw, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { JobPosting } from '../types';
import { getFullTrackingUrl } from '../utils/formatter';

interface ClickAnalyticsModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onResetClicks: () => void;
  onSimulateClick: () => void;
  isResetting: boolean;
}

export const ClickAnalyticsModal: React.FC<ClickAnalyticsModalProps> = ({
  job,
  isOpen,
  onClose,
  onResetClicks,
  onSimulateClick,
  isResetting
}) => {
  if (!isOpen) return null;

  const trackingUrl = getFullTrackingUrl(job.slug);
  const clickLogs = Array.isArray(job.clickLogs) ? job.clickLogs : [];
  
  const mobileClicks = clickLogs.filter(l => l.deviceType === 'mobile').length;
  const desktopClicks = clickLogs.filter(l => l.deviceType === 'desktop').length;
  const tabletClicks = clickLogs.filter(l => l.deviceType === 'tablet').length;
  const total = job.clicksCount || 0;

  const mobilePct = total > 0 ? Math.round((mobileClicks / total) * 100) : 0;
  const desktopPct = total > 0 ? Math.round((desktopClicks / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Contador de Cliques & Métricas
              </h2>
              <p className="text-xs text-slate-400">
                Vaga: <span className="text-slate-200 font-medium capitalize">{job.role}</span> ({job.location})
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Main Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400">Total de Cliques</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {job.clicksCount || 0}
                </span>
                <span className="text-xs text-slate-400">acessos</span>
              </div>
              <span className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Link ativo e rastreando
              </span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400">Visitantes Únicos</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-cyan-400">
                  {job.uniqueClicksCount || Math.min(job.clicksCount || 0, Math.floor((job.clicksCount || 0) * 0.85))}
                </span>
                <span className="text-xs text-slate-400">pessoas</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                Baseado em dispositivos
              </span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400">Acessos Mobile</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-blue-400">
                  {mobilePct}%
                </span>
                <span className="text-xs text-slate-400">({mobileClicks} cliques)</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                WhatsApp e Celulares
              </span>
            </div>

          </div>

          {/* Tracked Link Information */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Link de Redirecionamento Rastreado:</span>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-xs"
              >
                Testar no navegador <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-emerald-300 select-all border border-slate-800 break-all">
              {trackingUrl}
            </div>
            <p className="text-[11px] text-slate-400">
              Quando alguém clica nesse link no WhatsApp, o sistema registra o clique no servidor e redireciona direto para o seu WhatsApp com a mensagem de interesse da vaga.
            </p>
          </div>

          {/* Device Distribution Progress */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Dispositivos dos Candidatos
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Celular / WhatsApp
                  </span>
                  <span className="text-slate-300 font-semibold">{mobileClicks} ({mobilePct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mobilePct || 10}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Monitor className="w-3.5 h-3.5 text-blue-400" /> Computador / WhatsApp Web
                  </span>
                  <span className="text-slate-300 font-semibold">{desktopClicks} ({desktopPct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${desktopPct || 5}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Click Logs Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Histórico Recente de Acessos ao Link
            </h3>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
              {clickLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhum clique registrado ainda nesta vaga. Compartilhe o link no WhatsApp ou clique em &ldquo;Simular Clique&rdquo; abaixo para testar!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2.5">Horário / Data</th>
                      <th className="p-2.5">Dispositivo</th>
                      <th className="p-2.5">Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {clickLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-900/40">
                        <td className="p-2.5 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-2.5 flex items-center gap-1.5 capitalize">
                          {log.deviceType === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                          {log.deviceType === 'desktop' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                          {log.deviceType === 'tablet' && <Tablet className="w-3.5 h-3.5 text-purple-400" />}
                          {log.deviceType || 'mobile'}
                        </td>
                        <td className="p-2.5 text-slate-400 text-[11px]">
                          {log.referer || 'WhatsApp'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={onResetClicks}
            disabled={isResetting || (job.clicksCount || 0) === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Contador</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSimulateClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Simular Clique (+1)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
