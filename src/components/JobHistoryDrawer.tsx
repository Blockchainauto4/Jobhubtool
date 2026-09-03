import React from 'react';
import { 
  X, 
  History, 
  MousePointerClick, 
  Copy, 
  Trash2, 
  ExternalLink,
  Plus,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { JobPosting } from '../types';
import { generateFormattedPost, getFullTrackingUrl } from '../utils/formatter';

interface JobHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobPosting[];
  currentJobId: string;
  onSelectJob: (job: JobPosting) => void;
  onDeleteJob: (id: string) => void;
  onNewJob: () => void;
}

export const JobHistoryDrawer: React.FC<JobHistoryDrawerProps> = ({
  isOpen,
  onClose,
  jobs,
  currentJobId,
  onSelectJob,
  onDeleteJob,
  onNewJob
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Minhas Vagas & Histórico ({jobs.length})
              </h2>
              <p className="text-[11px] text-slate-400">
                Selecione para carregar no editor ou copiar link
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onNewJob}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Nova Vaga"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma vaga salva ainda. Crie sua primeira postagem!
            </div>
          ) : (
            jobs.map((j) => {
              const isSelected = j.id === currentJobId;
              const formatted = generateFormattedPost(j);
              const trackingUrl = getFullTrackingUrl(j.slug);

              return (
                <div
                  key={j.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md'
                      : 'bg-slate-800/70 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        {j.vacanciesCount} • {j.dayOrDate}
                      </span>
                      <h3 className="text-sm font-bold text-white capitalize">
                        {j.role}
                      </h3>
                    </div>

                    {/* Clicks badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <MousePointerClick className="w-3 h-3" />
                      {j.clicksCount || 0}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{j.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{j.schedule}</span>
                      <span className="text-slate-600">•</span>
                      <DollarSign className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{j.paymentValue}</span>
                    </div>
                  </div>

                  {/* Tracking link mini */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[170px]">
                      /r/{j.slug}
                    </span>

                    <div className="flex items-center gap-1">
                      
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formatted);
                          alert('Texto da vaga copiado!');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                        title="Copiar texto formatado"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                        title="Abrir link rastreado"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectJob(j);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors"
                      >
                        Editar
                      </button>

                      {jobs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Deseja excluir esta vaga?')) {
                              onDeleteJob(j.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total de Cliques Acumulados:
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {jobs.reduce((acc, j) => acc + (j.clicksCount || 0), 0)} cliques
          </span>
        </div>

      </div>
    </div>
  );
};
