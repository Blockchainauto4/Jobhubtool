import React from 'react';
import { 
  MessageSquare, 
  MousePointerClick, 
  PlusCircle, 
  History, 
  Sparkles, 
  Cloud,
  CheckCircle2,
  Users
} from 'lucide-react';
import { JobPosting } from '../types';

interface HeaderProps {
  currentJob: JobPosting;
  totalClicks: number;
  totalJobs: number;
  onNewJob: () => void;
  onOpenHistory: () => void;
  onOpenSmartPaste: () => void;
  onOpenVercelGuide: () => void;
  onOpenCommunityHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentJob,
  totalClicks,
  totalJobs,
  onNewJob,
  onOpenHistory,
  onOpenSmartPaste,
  onOpenVercelGuide,
  onOpenCommunityHub
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
              FH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  Frila Hub
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Comunidade & Renda Aberta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma colaborativa para conectar vagas de eventos, freelas e renda rápida com links rastreáveis
              </p>
            </div>
          </div>

          {/* Quick Stats & Navigation Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            
            {/* Click Counter Pill */}
            <div 
              id="header-clicks-stat"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium"
              title="Cliques totais registrados nos links de vagas"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-sm font-bold text-emerald-400">{totalClicks}</span>
              </div>
              <span className="text-slate-400">cliques totais</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-semibold">{totalJobs}</span>
              <span className="text-slate-400">vagas</span>
            </div>

            {/* Mural Colaborativo Button */}
            <button
              id="btn-community-hub"
              onClick={onOpenCommunityHub}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer shadow-sm"
              title="Explorar o mural comunitário de vagas compartilhadas"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mural Colaborativo</span>
            </button>

            {/* Action Buttons */}
            <button
              id="btn-smart-paste"
              onClick={onOpenSmartPaste}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              title="Colar texto desformatado e extrair campos automaticamente"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto Preencher</span>
            </button>

            <button
              id="btn-history"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              title="Ver todas as vagas criadas e histórico de cliques"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Minhas Vagas ({totalJobs})</span>
            </button>

            <button
              id="btn-vercel-guide"
              onClick={onOpenVercelGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              title="Instruções para subir no Vercel com 1 clique"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deploy Vercel</span>
            </button>

            <button
              id="btn-new-job"
              onClick={onNewJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova Vaga</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

