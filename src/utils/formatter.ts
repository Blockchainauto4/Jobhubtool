import { JobPosting, FormatMode } from '../types';

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneNumber(phone: string): string {
  const digits = cleanPhoneNumber(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 13 && digits.startsWith('55')) {
    // 5511921254453
    const local = digits.slice(2);
    return `+55 (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  return phone;
}

export function getFullTrackingUrl(slug: string, baseUrl?: string): string {
  if (typeof window !== 'undefined') {
    const origin = baseUrl || window.location.origin;
    return `${origin}/r/${slug}`;
  }
  return `https://vagas-tracker.vercel.app/r/${slug}`;
}

export function generateGoogleMapsSearchUrl(addressOrLocation: string): string {
  if (!addressOrLocation) return '';
  const query = encodeURIComponent(addressOrLocation.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function generateDirectWhatsAppUrl(phone: string, message?: string): string {
  const digits = cleanPhoneNumber(phone);
  const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const defaultMsg = message || 'Olá! Tenho interesse na vaga.';
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(defaultMsg)}`;
}

export function extractTikTokUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/(https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s\)]+)/i);
  if (match) {
    return match[1].replace(/[.,;:!?)\]]+$/, '');
  }
  return trimmed;
}

export function generateFormattedPost(
  job: JobPosting,
  options?: {
    mode?: FormatMode;
    baseUrl?: string;
    overrideIncludeLink?: boolean;
    overrideIncludePhone?: boolean;
  }
): string {
  const mode = options?.mode || job.formatStyle || 'clean_modern';
  const includeLink = options?.overrideIncludeLink ?? job.includeTrackingLink;
  const includePhone = options?.overrideIncludePhone ?? job.includePhoneDirectly;
  const trackingUrl = getFullTrackingUrl(job.slug, options?.baseUrl);

  // Clean values
  const role = (job.role || 'Carregador').trim();
  const roleUpper = role.toUpperCase();
  const vacancies = (job.vacanciesCount || '70 vagas').trim();
  const dayOrDate = (job.dayOrDate || 'Segunda-feira (31/08)').trim();
  const dateShort = (job.dateShort || (dayOrDate.match(/\((\d{1,2}\/\d{1,2})\)/)?.[1]) || '').trim();
  const location = (job.location || 'Sesc Casa Verde').trim();
  const address = (job.address || 'Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP').trim();
  const schedule = (job.schedule || '08:00 às 20:00').trim();
  const paymentValue = (job.paymentValue || 'R$ 120,00').trim();
  const paymentTerms = (job.paymentTerms || '3 dias úteis após o término do evento').trim();
  const benefits = (job.benefits || 'Alimentação fornecida no local').trim();
  const requirements = (job.requirements || 'Homens e Mulheres').trim();
  const contactPhone = (job.contactPhone || '5511921254453').trim();
  const customMessage = (job.customWhatsAppMessage || `Olá! Tenho interesse na vaga de ${role.toLowerCase()} no ${location} para segunda.`).trim();
  
  // Maps URL
  const mapsUrl = job.mapsUrl?.trim() || (address ? generateGoogleMapsSearchUrl(address) : (location ? generateGoogleMapsSearchUrl(location) : ''));
  
  // TikTok Link
  const tiktokLink = (job.tiktokLink || 'https://www.tiktok.com/d/1/ZS9Bv6akK8hFc-IaSbu/').trim();
  const includeTiktok = job.includeTiktokLink !== false && tiktokLink.length > 0;

  // Observation / Rules
  const observation = (job.observation || (Array.isArray(job.rules) && job.rules.length > 0 ? job.rules.join(' • ') : 'Proibido consumo de bebidas alcoólicas no local do evento.')).trim();

  // WhatsApp Link (direct wa.me or tracking link)
  const directWaUrl = generateDirectWhatsAppUrl(contactPhone, customMessage);
  const finalWaUrl = (includeLink && job.slug) ? trackingUrl : directWaUrl;

  // ========================================================
  // 1. CLEAN MODERN (LEITURA CLEAN, DIRETA E SEM POLUIÇÃO)
  // ========================================================
  if (mode === 'clean_modern') {
    const lines: string[] = [];

    // Header limpo com destaque
    const headerTitle = dateShort ? `*🚨 VAGA: ${roleUpper} (${dateShort})*` : `*🚨 VAGA: ${roleUpper}*`;
    lines.push(headerTitle);
    lines.push('');

    // Dados principais agrupados de forma fluida
    const funcDetails = [vacancies, requirements].filter(Boolean).join(' • ');
    lines.push(`💼 *Função:* ${role}${funcDetails ? ` (${funcDetails})` : ''}`);

    if (dayOrDate || schedule) {
      const whenParts = [dayOrDate, schedule].filter(Boolean).join(' • ');
      lines.push(`📅 *Data & Horário:* ${whenParts}`);
    }

    if (paymentValue) {
      const payDetails = [paymentTerms, benefits].filter(Boolean).join(' • ');
      lines.push(`💰 *Cachê:* ${paymentValue}${payDetails ? ` (${payDetails})` : ''}`);
    }

    if (location || address) {
      const locText = location && address ? `${location} – ${address}` : (location || address);
      lines.push(`📍 *Local:* ${locText}`);
    }

    if (mapsUrl) {
      lines.push(`🗺️ *Rota Maps:* ${mapsUrl}`);
    }

    if (observation) {
      lines.push('');
      lines.push(`⚠️ *Aviso:* ${observation}`);
    }

    lines.push('');
    lines.push(`📲 *Candidatar-se / Chamar no WhatsApp:*`);
    if (includeTiktok && tiktokLink) {
      lines.push(`🎮 TikTok: ${tiktokLink}`);
    }
    if (finalWaUrl) {
      lines.push(finalWaUrl);
    } else if (includePhone && contactPhone) {
      lines.push(formatPhoneNumber(contactPhone));
    }

    return lines.join('\n');
  }

  // ========================================================
  // 2. TIKTOK FORMAL (MODELO ESTRUTURADO)
  // ========================================================
  if (mode === 'tiktok_formal') {
    const lines: string[] = [];

    const headerTitle = dateShort ? `🚨 VAGAS PARA ${roleUpper} (${dateShort}) 🚨` : `🚨 VAGAS PARA ${roleUpper} 🚨`;
    lines.push(headerTitle);
    lines.push('');

    const funcDetails = [vacancies, requirements].filter(Boolean).join(' | ');
    lines.push(`💼 Função: ${role}${funcDetails ? ` (${funcDetails})` : ''}`);

    if (dayOrDate) {
      lines.push(schedule ? `📅 Data: ${dayOrDate} das ${schedule}` : `📅 Data: ${dayOrDate}`);
    } else if (schedule) {
      lines.push(`⏰ Horário: ${schedule}`);
    }

    if (paymentValue) {
      lines.push(`💰 Cachê: ${paymentValue}${benefits ? ` (${benefits})` : ''}`);
    }

    if (paymentTerms) {
      lines.push(`💳 Pagamento: ${paymentTerms}`);
    }

    if (location || address) {
      const fullLoc = location && address ? `${location} – ${address}` : (location || address);
      lines.push(`📍 Local: ${fullLoc}`);
    }

    if (mapsUrl) {
      lines.push(`🗺️ Traçar rota no Maps: ${mapsUrl}`);
    }

    if (observation) {
      lines.push('');
      lines.push(`⚠️ Observação: ${observation}`);
    }

    lines.push('');
    const linkParts: string[] = [];
    if (includeTiktok && tiktokLink) {
      linkParts.push(tiktokLink);
    }
    if (finalWaUrl) {
      linkParts.push(finalWaUrl);
    }

    lines.push(`📲 Chamar no WhatsApp: ${linkParts.join(' ')}`);

    return lines.join('\n');
  }

  // ========================================================
  // 2. EXACT PLAIN (PADRÃO TEXTO SIMPLES SEM EMOJIS)
  // ========================================================
  if (mode === 'exact_plain') {
    const lines: string[] = [];
    const greeting = (job.greeting || 'Boa tarde').trim();
    
    // Header
    const headerParts = [greeting, vacancies, dayOrDate].filter(Boolean);
    lines.push(headerParts.join(' '));
    
    if (location) lines.push(`Localização ${location}`);
    if (role) lines.push(`Função ${role}`);
    if (schedule) lines.push(`Horário ${schedule}`);
    if (paymentValue) lines.push(paymentValue);
    if (paymentTerms) lines.push(paymentTerms);
    if (benefits) lines.push(benefits);
    
    const rawRules = Array.isArray(job.rules) && job.rules.length > 0 ? job.rules : [
      'Proibido chegar bêbado',
      'Se vim bêbado ou beber no evento não vai receber'
    ];
    rawRules.forEach(rule => lines.push(rule.trim()));
    
    if (requirements || contactPhone) {
      const reqText = requirements || 'Disponível pra homem e mulher';
      if (includePhone) {
        lines.push(`${reqText} a número pra contato`);
        lines.push(cleanPhoneNumber(contactPhone) || contactPhone);
      } else {
        lines.push(reqText);
      }
    }

    if (includeTiktok && tiktokLink) {
      lines.push(`Link TikTok Jogos: ${tiktokLink}`);
    }

    if (includeLink) {
      lines.push('');
      lines.push(`Link para confirmar vaga / candidatar-se:`);
      lines.push(trackingUrl);
    }

    return lines.join('\n');
  }

  // ========================================================
  // 3. WHATSAPP STYLED (COM NEGRITO & MARCADORES)
  // ========================================================
  if (mode === 'whatsapp_styled') {
    const lines: string[] = [];
    const greeting = (job.greeting || 'Boa tarde').trim();
    
    const headerParts = [greeting, vacancies, dayOrDate].filter(Boolean);
    lines.push(`*📢 ${headerParts.join(' ')}*`);
    lines.push('');
    if (location) lines.push(`📍 *Localização:* ${location}${address ? ` (${address})` : ''}`);
    if (role) lines.push(`💼 *Função:* ${role}`);
    if (schedule) lines.push(`⏰ *Horário:* ${schedule}`);
    if (paymentValue) lines.push(`💵 *Diária:* ${paymentValue}`);
    if (paymentTerms) lines.push(`💳 *Pagamento:* ${paymentTerms}`);
    if (benefits) lines.push(`🍽️ *Alimentação/Benefício:* ${benefits}`);
    
    if (observation) {
      lines.push('');
      lines.push(`⚠️ *Observação:* ${observation}`);
    }
    
    lines.push('');
    if (requirements) lines.push(`👥 *Perfil:* ${requirements}`);
    if (includePhone && contactPhone) {
      lines.push(`📲 *Contato:* ${formatPhoneNumber(contactPhone)}`);
    }

    if (includeTiktok && tiktokLink) {
      lines.push(`🎮 *TikTok Jogos:* ${tiktokLink}`);
    }

    if (includeLink) {
      lines.push('');
      lines.push(`👉 *Clique no link para garantir sua vaga:*`);
      lines.push(trackingUrl);
    }

    return lines.join('\n');
  }

  // ========================================================
  // 4. MINIMAL
  // ========================================================
  const lines: string[] = [];
  lines.push(`VAGA: ${role.toUpperCase()} - ${vacancies} (${dayOrDate})`);
  lines.push(`• Local: ${location}${address ? ` - ${address}` : ''}`);
  lines.push(`• Horário: ${schedule}`);
  lines.push(`• Valor: ${paymentValue} (${paymentTerms})`);
  if (benefits) lines.push(`• Benefício: ${benefits}`);
  if (observation) lines.push(`• Obs: ${observation}`);
  if (includeTiktok && tiktokLink) lines.push(`• TikTok: ${tiktokLink}`);
  if (includePhone && contactPhone) lines.push(`• Contato: ${contactPhone}`);
  if (includeLink) lines.push(`• Link: ${trackingUrl}`);

  return lines.join('\n');
}

export function parseRawJobText(rawText: string): Partial<JobPosting> {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const result: Partial<JobPosting> = {
    rules: []
  };

  const remainingRules: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Header check 🚨 VAGAS PARA CARREGADOR (31/08) 🚨
    const headerPattern = line.match(/VAGAS?\s+PARA\s+([^(\n]+?)(?:\s*\(([^)]+)\))?\s*🚨?/i);
    if (headerPattern) {
      result.role = headerPattern[1].trim();
      if (headerPattern[2]) {
        result.dateShort = headerPattern[2].trim();
      }
      continue;
    }

    // TikTok link detection
    if (line.includes('tiktok.com')) {
      const extracted = extractTikTokUrl(line);
      if (extracted) {
        result.tiktokLink = extracted;
        result.includeTiktokLink = true;
      }
    }

    // Google Maps link detection
    if (line.includes('google.com/maps') || line.includes('maps.app.goo.gl') || line.includes('Traçar rota no Maps')) {
      const mapsMatch = line.match(/(https?:\/\/(?:www\.)?(?:google\.com\/maps[^\s]+|maps\.app\.goo\.gl[^\s]+))/i);
      if (mapsMatch) {
        result.mapsUrl = mapsMatch[1];
      }
      continue;
    }

    // WhatsApp URL or call line
    if (line.includes('wa.me/') || line.includes('api.whatsapp.com') || line.includes('Chamar no WhatsApp')) {
      const waMatch = line.match(/wa\.me\/(\d+)(?:\?text=([^&\s]+))?/i);
      if (waMatch) {
        result.contactPhone = waMatch[1];
        if (waMatch[2]) {
          try {
            result.customWhatsAppMessage = decodeURIComponent(waMatch[2]);
          } catch {
            result.customWhatsAppMessage = waMatch[2];
          }
        }
      }
      continue;
    }

    // Função: Carregador (70 vagas | Homens e Mulheres)
    if (lower.startsWith('💼') || lower.startsWith('função:') || lower.startsWith('funcao:') || lower.startsWith('cargo:')) {
      const content = line.replace(/^(💼\s*Função:|💼\s*Funcao:|Função:|Funcao:|Cargo:)\s*/i, '').trim();
      // Extract role and details inside parentheses
      const funcMatch = content.match(/^([^()]+)(?:\(([^)]+)\))?/);
      if (funcMatch) {
        result.role = funcMatch[1].trim();
        if (funcMatch[2]) {
          const parts = funcMatch[2].split('|').map(p => p.trim());
          for (const p of parts) {
            if (/vagas?/i.test(p) || /^\d+/.test(p)) {
              result.vacanciesCount = p;
            } else {
              result.requirements = p;
            }
          }
        }
      } else {
        result.role = content;
      }
      continue;
    }

    // Data: Segunda-feira (31/08) das 08:00 às 20:00
    if (lower.startsWith('📅') || lower.startsWith('data:')) {
      const content = line.replace(/^(📅\s*Data:|Data:)\s*/i, '').trim();
      const dateScheduleMatch = content.match(/^(.+?)\s+das\s+(.+)$/i);
      if (dateScheduleMatch) {
        result.dayOrDate = dateScheduleMatch[1].trim();
        result.schedule = dateScheduleMatch[2].trim();
      } else {
        result.dayOrDate = content;
      }
      continue;
    }

    // Cachê: R$ 120,00 (Alimentação fornecida no local)
    if (lower.startsWith('💰') || lower.startsWith('cachê:') || lower.startsWith('cache:') || lower.startsWith('diária:')) {
      const content = line.replace(/^(💰\s*Cachê:|💰\s*Cache:|Cachê:|Cache:|Diária:)\s*/i, '').trim();
      const cacheMatch = content.match(/^([^()]+)(?:\(([^)]+)\))?/);
      if (cacheMatch) {
        result.paymentValue = cacheMatch[1].trim();
        if (cacheMatch[2]) {
          result.benefits = cacheMatch[2].trim();
        }
      } else {
        result.paymentValue = content;
      }
      continue;
    }

    // Pagamento: 3 dias úteis após o término do evento
    if (lower.startsWith('💳') || lower.startsWith('pagamento:')) {
      result.paymentTerms = line.replace(/^(💳\s*Pagamento:|Pagamento:)\s*/i, '').trim();
      continue;
    }

    // Local: Sesc Casa Verde – Av. Casa Verde, 327 - Jardim São Bento, São Paulo - SP
    if (lower.startsWith('📍') || lower.startsWith('local:') || lower.startsWith('localização:')) {
      const content = line.replace(/^(📍\s*Local:|Local:|Localização:|Localizacao:)\s*/i, '').trim();
      if (content.includes('–') || content.includes(' - ')) {
        const divider = content.includes('–') ? '–' : ' - ';
        const [locPart, ...addrParts] = content.split(divider);
        result.location = locPart.trim();
        result.address = addrParts.join(divider).trim();
      } else {
        result.location = content;
      }
      continue;
    }

    // Observação
    if (lower.startsWith('⚠️') || lower.startsWith('observação:') || lower.startsWith('observacao:') || lower.startsWith('obs:')) {
      result.observation = line.replace(/^(⚠️\s*Observação:|⚠️\s*Observacao:|Observação:|Observacao:|Obs:)\s*/i, '').trim();
      continue;
    }

    // Traditional text header check (e.g. Boa tarde 70 vagas pra segunda feira)
    if (lower.startsWith('boa tarde') || lower.startsWith('bom dia') || lower.startsWith('boa noite') || lower.startsWith('olá') || lower.startsWith('ola')) {
      const parts = line.split(/\s+/);
      const greeting = parts.slice(0, 2).join(' ');
      result.greeting = greeting;
      
      const rest = line.substring(greeting.length).trim();
      const vagaMatch = rest.match(/(\d+\s*vagas?)/i);
      if (vagaMatch) {
        result.vacanciesCount = vagaMatch[1];
        const dayPart = rest.replace(vagaMatch[0], '').trim();
        if (dayPart) result.dayOrDate = dayPart;
      } else {
        result.dayOrDate = rest;
      }
      continue;
    }

    // Horário
    if (lower.startsWith('horário') || lower.startsWith('horario') || lower.startsWith('hora:')) {
      result.schedule = line.replace(/^(horário|horario|hora:)\s*/i, '').trim();
      continue;
    }

    // Valor / Reais
    if (lower.includes('reais') || lower.includes('r$') || /^\d+\s*reais/i.test(lower)) {
      result.paymentValue = line.trim();
      continue;
    }

    // Benefícios
    if (lower.includes('alimentação') || lower.includes('alimentacao') || lower.includes('refeição') || lower.includes('lanche')) {
      result.benefits = line.trim();
      continue;
    }

    // Telefone
    const phoneMatch = line.match(/(?:(?:\+|00)?55\s*)?(?:\(?([1-9][0-9])\)?\s*)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))/);
    if (phoneMatch && cleanPhoneNumber(line).length >= 10) {
      result.contactPhone = cleanPhoneNumber(line);
      continue;
    }

    // Requirements
    if (lower.includes('disponível') || lower.includes('disponivel') || lower.includes('homem') || lower.includes('mulher')) {
      const cleanLine = line.replace(/número\s*pra\s*contato.*/i, '').replace(/contato.*/i, '').trim();
      if (cleanLine) {
        result.requirements = cleanLine;
      }
      continue;
    }

    // Rules / Proibições
    if (lower.includes('proibido') || lower.includes('bêbado') || lower.includes('bebado') || lower.includes('beber') || lower.includes('receber')) {
      remainingRules.push(line);
      continue;
    }
  }

  if (remainingRules.length > 0) {
    result.rules = remainingRules;
    if (!result.observation) {
      result.observation = remainingRules.join(' | ');
    }
  }

  return result;
}
