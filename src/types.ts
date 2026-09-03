export type FormatMode = 'clean_modern' | 'tiktok_formal' | 'exact_plain' | 'whatsapp_styled' | 'minimal';

export interface JobPosting {
  id: string;
  slug: string; // short tracking link slug (e.g. sesc-70)
  greeting?: string; // e.g. "Boa tarde"
  vacanciesCount: string; // e.g. "70 vagas"
  dayOrDate: string; // e.g. "Segunda-feira (31/08)" or "pra segunda feira"
  dateShort?: string; // e.g. "31/08"
  location: string; // e.g. "Sesc Casa Verde"
  address?: string; // e.g. "Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP"
  mapsUrl?: string; // e.g. "https://www.google.com/maps/search/?api=1&query=..."
  role: string; // e.g. "Carregador"
  schedule: string; // e.g. "08:00 às 20:00"
  paymentValue: string; // e.g. "R$ 120,00" or "120 reais"
  paymentTerms: string; // e.g. "3 dias úteis após o término do evento"
  benefits: string; // e.g. "Alimentação fornecida no local"
  rules: string[]; // e.g. ["Proibido chegar bêbado", "Se vim bêbado ou beber no evento não vai receber"]
  observation?: string; // e.g. "Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento)."
  requirements: string; // e.g. "Homens e Mulheres" or "Disponível pra homem e mulher"
  contactPhone: string; // e.g. "5511921254453"
  customWhatsAppMessage?: string; // prefilled message for candidate
  tiktokLink?: string; // e.g. "https://www.tiktok.com/d/1/ZS9BCQTBvxDxD-gsrJP/"
  includeTiktokLink?: boolean;
  includeTrackingLink: boolean;
  includePhoneDirectly: boolean;
  formatStyle: FormatMode;
  clicksCount: number;
  uniqueClicksCount: number;
  clickLogs: ClickLog[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Collaborative & Community Hub Features
  creatorName?: string; // Nome ou apelido de quem compartilhou a vaga (ex: "Carlos (Eventos SP)")
  city?: string; // Cidade / Região (ex: "São Paulo, SP", "Rio de Janeiro, RJ")
  category?: 'eventos' | 'logistica' | 'gastronomia' | 'geral' | 'promocao'; // Categoria para busca colaborativa
  isPublicHub?: boolean; // Se a vaga aparece no mural público colaborativo para qualquer freelancer encontrar renda
  upvotesCount?: number; // Votos da comunidade confirmando a idoneidade da vaga
}

export interface ClickLog {
  id: string;
  timestamp: string;
  userAgent?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  referer?: string;
  ipHash?: string;
}

export interface JobStats {
  totalJobs: number;
  totalClicks: number;
  topJobSlug?: string;
  topJobClicks?: number;
  recentClicks: Array<{
    jobId: string;
    jobRole: string;
    jobLocation: string;
    slug: string;
    timestamp: string;
    deviceType: string;
  }>;
}
