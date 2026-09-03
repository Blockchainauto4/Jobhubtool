import { JobPosting } from '../types';

export const USER_PROMPT_TEMPLATE: JobPosting = {
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
      id: 'log-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      deviceType: 'mobile',
      referer: 'WhatsApp Android'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      deviceType: 'mobile',
      referer: 'WhatsApp iOS'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      deviceType: 'mobile',
      referer: 'WhatsApp Web'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

export const COMMON_TIKTOK_LINKS = [
  {
    label: 'HD | Rebeca (Gol de Prêmios R$ 130) ⭐ Novo',
    url: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/'
  },
  {
    label: 'Campanha Anterior (ZS9BCQTBvxDxD)',
    url: 'https://www.tiktok.com/d/1/ZS9BCQTBvxDxD-gsrJP/'
  },
  {
    label: 'TikTok Campanha 02',
    url: 'https://www.tiktok.com/d/1/ZS9BExample2/'
  },
  {
    label: 'TikTok Campanha 03',
    url: 'https://www.tiktok.com/d/1/ZS9BExample3/'
  }
];

export const PRESET_TEMPLATES: Partial<JobPosting>[] = [
  {
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
    observation: 'Proibido chegar bêbado ou consumir bebida alcoólica no evento (sujeito a perda do pagamento).',
    tiktokLink: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/',
    includeTiktokLink: true,
    contactPhone: '5511921254453',
    customWhatsAppMessage: 'Olá! Tenho interesse na vaga de carregador no Sesc Casa Verde para segunda.',
    formatStyle: 'tiktok_formal'
  },
  {
    role: 'Garçom / Garçonete',
    dateShort: '14/09',
    vacanciesCount: '25 vagas',
    requirements: 'Homens e Mulheres',
    dayOrDate: 'Sábado (14/09)',
    schedule: '16:00 às 01:00',
    paymentValue: 'R$ 150,00',
    benefits: 'Jantar no local e uniforme fornecido',
    paymentTerms: 'Pagamento via PIX no encerramento',
    location: 'Espaço Jardim América',
    address: 'Rua Oscar Freire, 1100 - Cerqueira César, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Oscar+Freire,+1100+-+Cerqueira+Cesar,+Sao+Paulo+-+SP',
    observation: 'Obrigatório camisa social branca e calça preta. Proibido uso de celular durante atendimento.',
    tiktokLink: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/',
    includeTiktokLink: true,
    contactPhone: '5511987654321',
    customWhatsAppMessage: 'Olá! Tenho interesse na vaga de garçom para sábado.',
    formatStyle: 'tiktok_formal'
  },
  {
    role: 'Auxiliar de Limpeza',
    dateShort: '05/09',
    vacanciesCount: '15 vagas',
    requirements: 'Homens e Mulheres',
    dayOrDate: 'Quinta-feira (05/09)',
    schedule: '07:00 às 17:00',
    paymentValue: 'R$ 130,00',
    benefits: 'Alimentação no local e VT',
    paymentTerms: '24h após o término via PIX',
    location: 'Centro de Convenções Anhembi',
    address: 'Av. Olavo Fontoura, 1209 - Santana, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Olavo+Fontoura,+1209+-+Santana,+Sao+Paulo+-+SP',
    observation: 'Obrigatório calçado fechado e calça escura. Levar documento original.',
    tiktokLink: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/',
    includeTiktokLink: true,
    contactPhone: '5511976543210',
    customWhatsAppMessage: 'Olá! Tenho interesse na vaga de limpeza no Anhembi.',
    formatStyle: 'tiktok_formal'
  },
  {
    role: 'Montador de Estrutura',
    dateShort: '20/09',
    vacanciesCount: '40 vagas',
    requirements: 'Homens e Mulheres (maiores de 18 anos)',
    dayOrDate: 'Domingo (20/09)',
    schedule: '22:00 às 06:00',
    paymentValue: 'R$ 180,00',
    benefits: 'Ceia noturna e café da manhã',
    paymentTerms: '2 dias úteis após o término',
    location: 'Autódromo de Interlagos',
    address: 'Av. Sen. Teotônio Vilela, 261 - Interlagos, São Paulo - SP',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.+Sen.+Teotonio+Vilela,+261+-+Interlagos,+Sao+Paulo+-+SP',
    observation: 'Obrigatório bota de segurança com biqueira e luva. Tolerância zero para álcool.',
    tiktokLink: 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/',
    includeTiktokLink: true,
    contactPhone: '5511965432109',
    customWhatsAppMessage: 'Olá! Tenho interesse na vaga de montagem no Autódromo.',
    formatStyle: 'tiktok_formal'
  }
];
