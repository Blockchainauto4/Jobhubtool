import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { JobPosting, ClickLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Data storage path
const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

// Initialize default sample data (from user prompt)
const INITIAL_JOB: JobPosting = {
  id: 'sesc-carregador-01',
  slug: 'sesc-70',
  greeting: 'Boa tarde',
  role: 'Carregador',
  dateShort: '31/08',
  vacanciesCount: '70 vagas',
  requirements: 'Homens e Mulheres',
  dayOrDate: 'Segunda-feira (31/08)',
  schedule: '08:00 às 20:00',
  paymentValue: 'R$ 120,00',
  benefits: 'Alimentação fornecida no local',
  paymentTerms: '3 dias úteis após o término do evento',
  location: 'Sesc Casa Verde',
  address: 'Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Casa+Verde,+327+-+Jardim+Sao+Bento,+Sao+Paulo+-+SP',
  rules: [
    'Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).'
  ],
  observation: 'Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).',
  tiktokLink: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/',
  includeTiktokLink: true,
  contactPhone: '5511921254453',
  customWhatsAppMessage: 'Olá! Tenho interesse na vaga de carregador no Sesc Casa Verde para segunda.',
  includeTrackingLink: true,
  includePhoneDirectly: true,
  formatStyle: 'tiktok_formal',
  clicksCount: 42,
  uniqueClicksCount: 33,
  clickLogs: [
    {
      id: 'log-seed-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      deviceType: 'mobile',
      referer: 'WhatsApp Android'
    },
    {
      id: 'log-seed-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      deviceType: 'mobile',
      referer: 'WhatsApp iOS'
    },
    {
      id: 'log-seed-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      deviceType: 'desktop',
      referer: 'WhatsApp Web'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

let jobsStore: JobPosting[] = [INITIAL_JOB];

function loadJobs(): JobPosting[] {
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        jobsStore = parsed;
        return jobsStore;
      }
    } else {
      const tmpFile = path.join('/tmp', 'freelashub-data', 'jobs.json');
      if (fs.existsSync(tmpFile)) {
        const data = fs.readFileSync(tmpFile, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          jobsStore = parsed;
          return jobsStore;
        }
      }
    }
  } catch (err) {
    console.warn('Could not read jobs file, using in-memory store:', err);
  }
  return jobsStore;
}

function saveJobs(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobsStore, null, 2), 'utf-8');
  } catch (err) {
    // Vercel serverless environment fallback (writable /tmp)
    try {
      const tmpDir = path.join('/tmp', 'freelashub-data');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(path.join(tmpDir, 'jobs.json'), JSON.stringify(jobsStore, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Could not write jobs file in storage:', tmpErr);
    }
  }
}

// Initial load
loadJobs();

// Upgrade default job's tiktok link if it was still the previous link
jobsStore.forEach((j) => {
  if (j.id === 'sesc-carregador-01' && (j.tiktokLink === 'https://www.tiktok.com/d/1/ZS9BCQTBvxDxD-gsrJP/' || !j.tiktokLink)) {
    j.tiktokLink = 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/';
    j.includeTiktokLink = true;
  }
});
saveJobs();

function detectDevice(userAgent: string = ''): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  if (ua.length > 0) {
    return 'desktop';
  }
  return 'unknown';
}

function generateSlug(text: string): string {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return clean ? `${clean.slice(0, 18)}-${randomSuffix}` : `vaga-${randomSuffix}`;
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', totalJobs: jobsStore.length, uptime: process.uptime() });
});

// GET all jobs
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json({ jobs: jobsStore });
});

// GET single job by ID or slug
app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.find(j => j.id === id || j.slug === id);
  if (!job) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }
  res.json({ job });
});

// POST create or update job
app.post('/api/jobs', (req: Request, res: Response) => {
  const payload = req.body as Partial<JobPosting>;
  
  if (!payload.role || !payload.contactPhone) {
    return res.status(400).json({ error: 'Função e Telefone são obrigatórios' });
  }

  const existingIndex = payload.id ? jobsStore.findIndex(j => j.id === payload.id) : -1;
  const now = new Date().toISOString();

  let slug = (payload.slug || '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  if (!slug) {
    slug = generateSlug(payload.role || 'vaga');
  }

  // Ensure unique slug if different job has it
  const slugConflict = jobsStore.find(j => j.slug === slug && j.id !== payload.id);
  if (slugConflict) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
  }

  if (existingIndex >= 0) {
    // Update existing
    const existing = jobsStore[existingIndex];
    const updated: JobPosting = {
      ...existing,
      ...payload,
      slug,
      updatedAt: now,
      rules: Array.isArray(payload.rules) ? payload.rules : existing.rules,
      clicksCount: existing.clicksCount,
      uniqueClicksCount: existing.uniqueClicksCount,
      clickLogs: existing.clickLogs,
      creatorName: payload.creatorName || existing.creatorName || 'Comunidade Frila Hub',
      city: payload.city || existing.city || 'São Paulo, SP',
      category: payload.category || existing.category || 'eventos',
      isPublicHub: payload.isPublicHub ?? existing.isPublicHub ?? true,
      upvotesCount: existing.upvotesCount ?? 0
    };
    jobsStore[existingIndex] = updated;
    saveJobs();
    return res.json({ job: updated, message: 'Vaga atualizada com sucesso!' });
  } else {
    // Create new
    const newJob: JobPosting = {
      id: payload.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug,
      greeting: payload.greeting || 'Boa tarde',
      role: payload.role || 'Carregador',
      dateShort: payload.dateShort || '31/08',
      vacanciesCount: payload.vacanciesCount || '70 vagas',
      requirements: payload.requirements || 'Homens e Mulheres',
      dayOrDate: payload.dayOrDate || 'Segunda-feira (31/08)',
      schedule: payload.schedule || '08:00 às 20:00',
      paymentValue: payload.paymentValue || 'R$ 120,00',
      benefits: payload.benefits || 'Alimentação fornecida no local',
      paymentTerms: payload.paymentTerms || '3 dias úteis após o término do evento',
      location: payload.location || 'Sesc Casa Verde',
      address: payload.address || 'Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP',
      mapsUrl: payload.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Av.+Casa+Verde,+327+-+Jardim+Sao+Bento,+Sao+Paulo+-+SP',
      rules: Array.isArray(payload.rules) && payload.rules.length > 0 ? payload.rules : [
        'Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).'
      ],
      observation: payload.observation || 'Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).',
      tiktokLink: payload.tiktokLink || 'https://www.tiktok.com/d/1/ZS9BCQTBvxDxD-gsrJP/',
      includeTiktokLink: payload.includeTiktokLink ?? true,
      contactPhone: payload.contactPhone || '5511921254453',
      customWhatsAppMessage: payload.customWhatsAppMessage || `Olá! Tenho interesse na vaga de ${payload.role || 'carregador'} no Sesc Casa Verde para segunda.`,
      includeTrackingLink: payload.includeTrackingLink ?? true,
      includePhoneDirectly: payload.includePhoneDirectly ?? true,
      formatStyle: payload.formatStyle || 'tiktok_formal',
      clicksCount: 0,
      uniqueClicksCount: 0,
      clickLogs: [],
      createdAt: now,
      updatedAt: now,
      isActive: payload.isActive ?? true,
      creatorName: payload.creatorName || 'Comunidade Frila Hub',
      city: payload.city || 'São Paulo, SP',
      category: payload.category || 'eventos',
      isPublicHub: payload.isPublicHub ?? true,
      upvotesCount: 0
    };
    jobsStore.unshift(newJob);
    saveJobs();
    return res.status(201).json({ job: newJob, message: 'Vaga criada e adicionada ao Frila Hub!' });
  }
});

// UPVOTE / CONFIRM JOB (Collaborative Community)
app.post('/api/jobs/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.find(j => j.id === id || j.slug === id);
  if (!job) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }
  job.upvotesCount = (job.upvotesCount || 0) + 1;
  job.updatedAt = new Date().toISOString();
  saveJobs();
  res.json({ job, message: 'Vaga confirmada pela comunidade (+1 voto)' });
});

// DELETE job
app.delete('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = jobsStore.length;
  jobsStore = jobsStore.filter(j => j.id !== id && j.slug !== id);
  if (jobsStore.length === initialLength) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }
  saveJobs();
  res.json({ message: 'Vaga removida com sucesso' });
});

// Reset clicks
app.post('/api/jobs/:id/reset', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.find(j => j.id === id || j.slug === id);
  if (!job) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }
  job.clicksCount = 0;
  job.uniqueClicksCount = 0;
  job.clickLogs = [];
  job.updatedAt = new Date().toISOString();
  saveJobs();
  res.json({ job, message: 'Contador de cliques zerado!' });
});

// Simulate click (for testing in dashboard)
app.post('/api/jobs/:id/simulate-click', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobsStore.find(j => j.id === id || j.slug === id);
  if (!job) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }

  const device = req.body.device || 'mobile';
  const referer = req.body.referer || 'Simulador do Painel';

  const newLog: ClickLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    deviceType: device,
    referer
  };

  job.clicksCount = (job.clicksCount || 0) + 1;
  job.uniqueClicksCount = (job.uniqueClicksCount || 0) + 1;
  job.clickLogs = [newLog, ...(job.clickLogs || [])].slice(0, 100);
  job.updatedAt = new Date().toISOString();
  saveJobs();

  res.json({ job, message: 'Clique contabilizado com sucesso!' });
});

// Global stats overview
app.get('/api/stats/overview', (req: Request, res: Response) => {
  const totalJobs = jobsStore.length;
  const totalClicks = jobsStore.reduce((acc, j) => acc + (j.clicksCount || 0), 0);
  
  let topJob = jobsStore[0];
  for (const j of jobsStore) {
    if ((j.clicksCount || 0) > (topJob?.clicksCount || 0)) {
      topJob = j;
    }
  }

  const allLogs = jobsStore.flatMap(j => 
    (j.clickLogs || []).map(l => ({
      jobId: j.id,
      jobRole: j.role,
      jobLocation: j.location,
      slug: j.slug,
      timestamp: l.timestamp,
      deviceType: l.deviceType
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

  res.json({
    totalJobs,
    totalClicks,
    topJobSlug: topJob?.slug,
    topJobClicks: topJob?.clicksCount || 0,
    recentClicks: allLogs
  });
});

// ==========================================
// 🤖 GEMINI API (FREE TIER): PROCESS TEXT & IMAGE
// ==========================================
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada. Defina a chave no painel de Secrets.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

app.post('/api/gemini/process-job', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', rawText = '' } = req.body;

    if (!imageBase64 && !rawText.trim()) {
      return res.status(400).json({ error: 'Envie uma imagem (print/foto) ou um texto para o Gemini processar.' });
    }

    const ai = getGemini();
    const parts: any[] = [];

    // If image is provided, prepare inlineData
    if (imageBase64) {
      const cleanBase64 = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;

      const cleanMime = imageBase64.includes('data:')
        ? imageBase64.substring(5, imageBase64.indexOf(';'))
        : mimeType;

      parts.push({
        inlineData: {
          mimeType: cleanMime || 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const systemInstructionPrompt = `Você é o assistente oficial de processamento de vagas do FreelasHub.
Sua missão é extrair com precisão cirúrgica todos os dados de vagas para freelancers e eventos a partir da imagem fornecida (como prints de WhatsApp, panfletos, cartazes de vagas) e/ou texto bruto.

Diretrizes:
- 'role': Função principal em português (ex: Carregador, Garçom, Montador de Estruturas, Recepcionista, Limpeza, etc.).
- 'vacanciesCount': Quantidade de vagas (ex: '70 vagas', '10 vagas'). Se não constar, infira 'Vagas abertas'.
- 'dayOrDate': Dia da semana e data do evento (ex: 'Segunda-feira (31/08)').
- 'dateShort': Apenas a data reduzida se disponível (ex: '31/08').
- 'schedule': Horário de expediente (ex: '08:00 às 20:00' ou '8 as 20').
- 'paymentValue': Cachê / diária no formato R$ (ex: 'R$ 120,00' ou '120 reais').
- 'benefits': Benefícios inclusos (ex: 'Alimentação fornecida no local', 'VT').
- 'paymentTerms': Condições de pagamento (ex: '3 dias úteis após o evento', 'Pagamento no final do evento').
- 'location': Nome do estabelecimento / local (ex: 'Sesc Casa Verde', 'Expo Center Norte', 'Allianz Parque').
- 'address': Endereço ou referência geográfica.
- 'requirements': Para quem é a vaga (ex: 'Homens e Mulheres', 'Acima de 18 anos').
- 'rules': Lista com regras, proibições de álcool/atrasos ou vestimentas exigidas (ex: Proibido chegar bêbado, calça preta).
- 'observation': Resumo das regras e observações.
- 'contactPhone': Apenas os números com DDD do WhatsApp se houver (ex: '11921254453').
- 'tiktokLink': Manter vazio ou preencher se houver algum link específico.
- 'headline': Chamada impactante para o banner visual da vaga (ex: '🚨 URGENTE: 70 VAGAS PARA CARREGADOR - R$ 120/DIA').
- 'socialAdCopy': Mensagem adicional persuasiva e engajadora para grupos de WhatsApp.

Texto adicional do usuário: "${rawText || 'Nenhum texto adicional fornecido, analise os dados presentes na imagem.'}"`;

    parts.push({ text: systemInstructionPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            vacanciesCount: { type: Type.STRING },
            dayOrDate: { type: Type.STRING },
            dateShort: { type: Type.STRING },
            schedule: { type: Type.STRING },
            paymentValue: { type: Type.STRING },
            benefits: { type: Type.STRING },
            paymentTerms: { type: Type.STRING },
            location: { type: Type.STRING },
            address: { type: Type.STRING },
            requirements: { type: Type.STRING },
            rules: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            observation: { type: Type.STRING },
            contactPhone: { type: Type.STRING },
            tiktokLink: { type: Type.STRING },
            headline: { type: Type.STRING },
            socialAdCopy: { type: Type.STRING }
          },
          required: ['role', 'dayOrDate', 'schedule', 'paymentValue', 'location']
        }
      }
    });

    const outputText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      parsedData = { rawOutput: outputText };
    }

    return res.json({
      success: true,
      data: parsedData,
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error('Erro na API do Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar imagem ou texto com a API do Gemini.'
    });
  }
});

// ==========================================
// 🚀 TRACKING REDIRECT ROUTE: /r/:slug
// ==========================================
app.get('/r/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const job = jobsStore.find(j => j.slug === slug || j.id === slug);

  if (!job) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vaga não encontrada</title>
        <style>
          body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 420px; border: 1px solid #334155; }
          h1 { color: #f87171; margin-top: 0; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Vaga não encontrada</h1>
          <p>Este link de vaga expirou ou não está mais disponível.</p>
          <a href="/">← Voltar para o Painel</a>
        </div>
      </body>
      </html>
    `);
  }

  // Register Click
  const userAgent = req.headers['user-agent'] || '';
  const deviceType = detectDevice(userAgent);
  const referer = req.headers['referer'] || (userAgent.includes('WhatsApp') ? 'WhatsApp' : 'Link Direto');
  
  const newLog: ClickLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userAgent: userAgent.slice(0, 150),
    deviceType,
    referer: typeof referer === 'string' ? referer.slice(0, 100) : 'Direto'
  };

  job.clicksCount = (job.clicksCount || 0) + 1;
  job.uniqueClicksCount = (job.uniqueClicksCount || 0) + 1;
  job.clickLogs = [newLog, ...(job.clickLogs || [])].slice(0, 100);
  saveJobs();

  // Format WhatsApp Target URL
  const cleanPhone = (job.contactPhone || '').replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  const defaultText = job.customWhatsAppMessage || `Olá! Tenho interesse na vaga de ${job.role} no ${job.location} (${job.vacanciesCount}). Gostaria de confirmar meu nome na lista.`;
  const encodedText = encodeURIComponent(defaultText);
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedText}`;

  // If query ?direct=true or pure API request, 302 redirect directly
  if (req.query.direct === 'true') {
    return res.redirect(whatsappUrl);
  }

  // Beautiful branded candidate redirect splash page
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FreelasHub - Redirecionando para Vaga: ${job.role}</title>
      <meta property="og:title" content="FreelasHub - Vaga: ${job.role} (${job.vacanciesCount})">
      <meta property="og:description" content="Local: ${job.location} | Diária: ${job.paymentValue} | Horário: ${job.schedule}">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          background: linear-gradient(135deg, #0b1329 0%, #0f172a 100%);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
        }
        .container {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 1.25rem;
          padding: 2.25rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(16, 185, 129, 0.2);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1.5rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }
        .sub {
          color: #94a3b8;
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .job-summary {
          background: #0f172a;
          border-radius: 0.875rem;
          padding: 1.25rem;
          text-align: left;
          font-size: 0.875rem;
          color: #cbd5e1;
          margin-bottom: 1.75rem;
          border: 1px solid #1e293b;
        }
        .job-item {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid #1e293b;
        }
        .job-item:last-child {
          border-bottom: none;
        }
        .job-label {
          color: #64748b;
          font-weight: 500;
        }
        .job-val {
          color: #f1f5f9;
          font-weight: 600;
        }
        .btn-wa {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: #22c55e;
          color: #ffffff;
          text-decoration: none;
          padding: 0.875rem 1.75rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          width: 100%;
          transition: background 0.2s;
        }
        .btn-wa:hover {
          background: #16a34a;
        }
        .counter-pill {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <div class="badge">✓ Link de Vaga Verificado</div>
        <h1>${job.role}</h1>
        <p class="sub">Redirecionando você diretamente para o WhatsApp do recrutador...</p>
        
        <div class="job-summary">
          <div class="job-item">
            <span class="job-label">Vagas:</span>
            <span class="job-val">${job.vacanciesCount} (${job.dayOrDate})</span>
          </div>
          <div class="job-item">
            <span class="job-label">Local:</span>
            <span class="job-val">${job.location}</span>
          </div>
          <div class="job-item">
            <span class="job-label">Horário:</span>
            <span class="job-val">${job.schedule}</span>
          </div>
          <div class="job-item">
            <span class="job-label">Diária:</span>
            <span class="job-val">${job.paymentValue}</span>
          </div>
          <div class="job-item">
            <span class="job-label">Benefício:</span>
            <span class="job-val">${job.benefits}</span>
          </div>
        </div>

        <a href="${whatsappUrl}" class="btn-wa" id="waBtn">
          <span>Abrir WhatsApp Agora</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.05 1.018 1.554.733.649 1.353.85 1.545.945.193.095.305.08.419-.052.114-.132.49-.571.62-.767.13-.196.26-.164.434-.099.174.065 1.1.519 1.288.613.188.094.313.141.359.22.046.079.046.458-.098.863z"/></svg>
        </a>

        <div class="counter-pill">
          Clique registrado com sucesso • Redirecionando automaticamente...
        </div>
      </div>

      <script>
        // Automatic redirect after 900ms to allow candidate to see confirmation
        setTimeout(function() {
          window.location.href = "${whatsappUrl}";
        }, 900);
      </script>
    </body>
    </html>
  `);
});

// Setup Vite for development / static for production
async function startServer() {
  if (process.env.VERCEL) {
    // In Vercel serverless functions, the platform handles the HTTP wrapper around app
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
