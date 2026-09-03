import React, { useState } from 'react';
import { JobPosting } from '../types';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  ThumbsUp, 
  Share2, 
  Search, 
  Filter, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface CommunityHubModalProps {
  jobs: JobPosting[];
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (job: JobPosting) => void;
  onRefreshJobs: () => void;
}

export const CommunityHubModal: React.FC<CommunityHubModalProps> = ({
  jobs,
  isOpen,
  onClose,
  onSelectJob,
  onRefreshJobs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpvote = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds[jobId]) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}/upvote`, { method: 'POST' });
      if (res.ok) {
        setUpvotedIds(prev => ({ ...prev, [jobId]: true }));
        onRefreshJobs();
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleShareLink = (job: JobPosting, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/r/${job.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.paymentValue || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'todos' || 
      (job.category || 'eventos') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalOpportunities = filteredJobs.length;
  const totalSlotsEstimated = filteredJobs.reduce((acc, j) => {
    const num = parseInt(j.vacanciesCount?.replace(/\D/g, '') || '1', 10);
    return acc + (isNaN(num) ? 1 : num);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Mural Colaborativo Frila Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Renda Coletiva
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Oportunidades de freelancers compartilhadas pela comunidade. Qualquer pessoa pode divulgar e se candidatar.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span><strong>{totalOpportunities}</strong> vagas abertas</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">~{totalSlotsEstimated} postos de renda</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por função, local (ex: Sesc, Allianz), cachê ou cidade..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'eventos', label: '🎉 Eventos' },
              { id: 'logistica', label: '📦 Logística & Carga' },
              { id: 'gastronomia', label: '🍽️ Bar & Garçom' },
              { id: 'promocao', label: '📢 Promoção' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Jobs */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-slate-950/40">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Nenhuma vaga encontrada com esses filtros</p>
              <p className="text-xs text-slate-500 mt-1">Experimente limpar a busca ou seja o primeiro a postar uma nova vaga!</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const hasUpvoted = !!upvotedIds[job.id];
              const upvotes = (job.upvotesCount || 0) + (hasUpvoted ? 1 : 0);

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {job.vacanciesCount || 'Vagas abertas'}
                      </span>
                      <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                        {job.role}
                      </h3>
                      {job.city && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {job.city}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <strong>{job.location}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {job.dayOrDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.schedule}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="text-emerald-400/90 font-medium">
                        Por: {job.creatorName || 'Comunidade Frila Hub'}
                      </span>
                      {job.benefits && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 truncate max-w-xs">🎁 {job.benefits}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side: Payment, Upvote & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Cachê / Diária</div>
                      <div className="text-base sm:text-lg font-black text-emerald-400">
                        {job.paymentValue}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Community confirmation/upvote */}
                      <button
                        type="button"
                        onClick={(e) => handleUpvote(job.id, e)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                          hasUpvoted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-emerald-400 border-slate-700 hover:border-slate-600'
                        }`}
                        title="Confirmar que a vaga é real e confiável"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{upvotes}</span>
                      </button>

                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={(e) => handleShareLink(job, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors cursor-pointer"
                        title="Copiar link rastreável de candidatura"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform pl-1">
                        <span>Ver</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Mural aberto: cada vaga compartilhada ajuda um freelancer a conseguir renda.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fechar Mural
          </button>
        </div>

      </div>
    </div>
  );
};
