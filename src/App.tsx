import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FreelasHubConverter } from './components/FreelasHubConverter';
import { ClickAnalyticsModal } from './components/ClickAnalyticsModal';
import { SmartPasteModal } from './components/SmartPasteModal';
import { JobHistoryDrawer } from './components/JobHistoryDrawer';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { QrCodeModal } from './components/QrCodeModal';
import { CommunityHubModal } from './components/CommunityHubModal';
import { JobPosting } from './types';
import { USER_PROMPT_TEMPLATE } from './data/defaultTemplates';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([USER_PROMPT_TEMPLATE]);
  const [currentJob, setCurrentJob] = useState<JobPosting>(USER_PROMPT_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulatingClick, setIsSimulatingClick] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSmartPasteModal, setShowSmartPasteModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showVercelGuideModal, setShowVercelGuideModal] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [showCommunityHubModal, setShowCommunityHubModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch jobs from server
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs);
          // If currentJob exists in data, update it with fresh clicks
          setCurrentJob((prev) => {
            const found = data.jobs.find((j: JobPosting) => j.id === prev.id);
            return found || prev;
          });
        }
      }
    } catch (err) {
      console.warn('Using local job state:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Poll stats every 10s to keep click counters live
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Handle updates to the form fields
  const handleJobChange = (updates: Partial<JobPosting>) => {
    setCurrentJob((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // Save current job to backend
  const handleSaveJob = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentJob)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setCurrentJob(data.job);
          await fetchJobs();
          showToast('Vaga salva e link rastreável atualizado com sucesso!');
        }
      } else {
        showToast('Vaga salva localmente!');
      }
    } catch (err) {
      console.error('Error saving job:', err);
      showToast('Salvo no navegador!');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new blank job
  const handleNewJob = () => {
    const newId = `vaga-${Date.now()}`;
    const newJob: JobPosting = {
      id: newId,
      slug: `vaga-${Math.random().toString(36).substring(2, 6)}`,
      greeting: 'Boa tarde',
      vacanciesCount: '30 vagas',
      dayOrDate: 'pra amanhã',
      location: 'Centro de São Paulo',
      role: 'auxiliar geral',
      schedule: '08:00 às 17:00',
      paymentValue: '130 reais',
      paymentTerms: 'Pagamento via PIX no término do evento',
      benefits: 'Fornecemos a alimentação',
      rules: [
        'Proibido chegar bêbado',
        'Se vim bêbado ou beber no evento não vai receber'
      ],
      requirements: 'Disponível pra homem e mulher',
      contactPhone: '11921254453',
      customWhatsAppMessage: 'Olá! Vi a vaga no grupo e gostaria de confirmar meu nome.',
      includeTrackingLink: true,
      includePhoneDirectly: true,
      formatStyle: 'exact_plain',
      clicksCount: 0,
      uniqueClicksCount: 0,
      clickLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    setCurrentJob(newJob);
    showToast('Novo formulário pronto!');
  };

  // Apply preset template
  const handleApplyPreset = (preset: Partial<JobPosting>) => {
    setCurrentJob((prev) => ({
      ...prev,
      ...preset,
      slug: prev.slug || `vaga-${Math.random().toString(36).substring(2, 6)}`
    }));
    showToast(`Modelo de "${preset.role}" aplicado!`);
  };

  // Apply smart parsed data from modal
  const handleApplyParsedData = (data: Partial<JobPosting>) => {
    setCurrentJob((prev) => ({
      ...prev,
      ...data,
      rules: data.rules && data.rules.length > 0 ? data.rules : prev.rules
    }));
    showToast('Dados extraídos e preenchidos no padrão!');
  };

  // Simulate click for testing
  const handleSimulateClick = async () => {
    setIsSimulatingClick(true);
    try {
      const res = await fetch(`/api/jobs/${currentJob.id}/simulate-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: 'mobile', referer: 'Simulador WhatsApp Web' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setCurrentJob(data.job);
          await fetchJobs();
          showToast(`+1 Clique registrado no link! Total: ${data.job.clicksCount}`);
        }
      } else {
        // Fallback local increment
        setCurrentJob((prev) => ({
          ...prev,
          clicksCount: (prev.clicksCount || 0) + 1,
          uniqueClicksCount: (prev.uniqueClicksCount || 0) + 1
        }));
        showToast('+1 Clique simulado!');
      }
    } catch (err) {
      console.warn('Simulation fallback:', err);
      setCurrentJob((prev) => ({
        ...prev,
        clicksCount: (prev.clicksCount || 0) + 1
      }));
    } finally {
      setIsSimulatingClick(false);
    }
  };

  // Reset clicks
  const handleResetClicks = async () => {
    if (!confirm('Deseja zerar o contador de cliques desta vaga?')) return;
    try {
      const res = await fetch(`/api/jobs/${currentJob.id}/reset`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setCurrentJob(data.job);
          await fetchJobs();
          showToast('Contador de cliques zerado com sucesso!');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a job
  const handleDeleteJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const remaining = jobs.filter((j) => j.id !== id);
      setJobs(remaining);
      if (currentJob.id === id && remaining.length > 0) {
        setCurrentJob(remaining[0]);
      }
      showToast('Vaga excluída com sucesso');
    } catch (err) {
      console.error(err);
    }
  };

  const totalClicks = jobs.reduce((acc, j) => acc + (j.clicksCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        currentJob={currentJob}
        totalClicks={totalClicks}
        totalJobs={jobs.length}
        onNewJob={handleNewJob}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenSmartPaste={() => setShowSmartPasteModal(true)}
        onOpenVercelGuide={() => setShowVercelGuideModal(true)}
        onOpenCommunityHub={() => setShowCommunityHubModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Banner notification / Tip */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Padrão Ativo:</span>
            <span>
              Formatando no padrão oficial de grupos de WhatsApp com link de rastreamento de cliques integrado.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Link de rastreio: <code className="text-emerald-300 font-mono">/r/{currentJob.slug}</code></span>
          </div>
        </div>

        {/* FreelasHub 2-Fields Converter with Access Counter */}
        <FreelasHubConverter
          job={currentJob}
          onChange={handleJobChange}
          onSave={handleSaveJob}
          isSaving={isSaving}
          onSimulateClick={handleSimulateClick}
          onResetClicks={handleResetClicks}
          isSimulatingClick={isSimulatingClick}
        />

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-400/30">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ClickAnalyticsModal
        job={currentJob}
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        onResetClicks={handleResetClicks}
        onSimulateClick={handleSimulateClick}
        isResetting={false}
      />

      <SmartPasteModal
        isOpen={showSmartPasteModal}
        onClose={() => setShowSmartPasteModal(false)}
        onApplyParsedData={handleApplyParsedData}
      />

      <JobHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        jobs={jobs}
        currentJobId={currentJob.id}
        onSelectJob={(j) => setCurrentJob(j)}
        onDeleteJob={handleDeleteJob}
        onNewJob={() => {
          handleNewJob();
          setShowHistoryDrawer(false);
        }}
      />

      <VercelDeployGuideModal
        isOpen={showVercelGuideModal}
        onClose={() => setShowVercelGuideModal(false)}
      />

      <QrCodeModal
        job={currentJob}
        isOpen={showQrCodeModal}
        onClose={() => setShowQrCodeModal(false)}
      />

      <CommunityHubModal
        jobs={jobs}
        isOpen={showCommunityHubModal}
        onClose={() => setShowCommunityHubModal(false)}
        onSelectJob={(j) => {
          setCurrentJob(j);
          showToast(`Vaga de ${j.role} carregada no editor!`);
        }}
        onRefreshJobs={fetchJobs}
      />

    </div>
  );
}
