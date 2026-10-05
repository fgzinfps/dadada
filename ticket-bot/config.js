require('dotenv').config();

const env = (key, fallback = '') => (process.env[key] ?? fallback).trim();
const list = (key) => env(key).split(',').map((s) => s.trim()).filter(Boolean);
const hex = (value, fallback) => {
  const n = parseInt(String(value).replace('#', ''), 16);
  return Number.isNaN(n) ? fallback : n;
};

module.exports = {
  // ── Credenciais e IDs (.env) ────────────────────────────────────────────
  token: env('DISCORD_TOKEN'),
  guildId: env('GUILD_ID'),
  ticketCategoryId: env('TICKET_CATEGORY_ID'),
  // Aceita um ou mais cargos separados por vírgula: 111,222
  staffRoleIds: list('STAFF_ROLE_ID'),
  logChannelId: env('LOG_CHANNEL_ID'),

  // ── Identidade visual ───────────────────────────────────────────────────
  systemName: env('SYSTEM_NAME', 'Suporte'),
  bannerUrl: env('BANNER_URL'),
  colors: {
    primary: hex(env('EMBED_COLOR', '#F2F2F2'), 0xf2f2f2), // aguardando atendimento / painel
    claimed: 0x3ba55d, // em atendimento
    closed: 0x4f545c, // fechado
    danger: 0xed4245, // exclusão
  },
  emojis: {
    ticket: '🎫',
    claim: '📌',
    release: '🔓',
    notify: '🔔',
    close: '🔒',
    reopen: '🔁',
    delete: '🗑️',
    waiting: '🕓',
    inProgress: '🟢',
    closed: '⚫',
  },

  // ── Comportamento ───────────────────────────────────────────────────────
  ticket: {
    // 'number' => ticket-0001 | 'username' => ticket-nomeusuario
    naming: env('TICKET_NAMING', 'number'),
    pingStaffOnOpen: env('PING_STAFF_ON_OPEN', 'true') === 'true',
    notifyCooldownSeconds: Number(env('NOTIFY_COOLDOWN_SECONDS', '300')),
    notifyViaDM: true,
    deleteDelaySeconds: 5,
    transcriptMessageLimit: 2000,
    timezone: env('TIMEZONE', 'America/Sao_Paulo'),
  },

  // ── Textos ──────────────────────────────────────────────────────────────
  texts: {
    panelTitle: 'Suporte',
    panelDescription: [
      'Precisa de ajuda? Abra um ticket clicando no botão abaixo.',
      'Um canal privado será criado e nossa equipe irá te atender por lá.',
      '',
      '**Antes de abrir**',
      '• Tenha em mãos as informações do seu problema',
      '• Evite abrir mais de um ticket para o mesmo assunto',
    ].join('\n'),
    ticketIntro:
      'Em breve um membro da equipe irá te atender. Enquanto isso, descreva o motivo do seu contato abaixo.',
    ticketFooter: 'Descreva o motivo do ticket de forma clara para agilizar o atendimento.',
  },
};
