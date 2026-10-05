const { AttachmentBuilder } = require('discord.js');
const config = require('../config');
const { padNumber } = require('./format');

async function fetchAllMessages(channel, limit) {
  const messages = [];
  let before;

  while (messages.length < limit) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (batch.size === 0) break;
    messages.push(...batch.values());
    before = batch.last().id;
    if (batch.size < 100) break;
  }

  return messages.slice(0, limit).reverse();
}

function formatDate(date) {
  return date.toLocaleString('pt-BR', { timeZone: config.ticket.timezone });
}

function formatMessage(message) {
  const lines = [`[${formatDate(message.createdAt)}] ${message.author.tag}${message.author.bot ? ' (bot)' : ''}`];

  if (message.content) lines.push(message.content);
  for (const embed of message.embeds) {
    const parts = [embed.title, embed.description].filter(Boolean).join(' — ');
    if (parts) lines.push(`[embed] ${parts}`);
  }
  for (const attachment of message.attachments.values()) {
    lines.push(`[anexo] ${attachment.name}: ${attachment.url}`);
  }

  return lines.join('\n');
}

/** Gera um .txt com todas as mensagens do ticket, pronto para anexar. */
async function buildTranscript(channel, ticket) {
  const messages = await fetchAllMessages(channel, config.ticket.transcriptMessageLimit);

  const header = [
    `${config.systemName} — Transcript do ticket #${padNumber(ticket.number)}`,
    `Canal: #${channel.name} (${channel.id})`,
    `Aberto por: ${ticket.ownerId}`,
    `Responsável: ${ticket.claimedBy ?? 'Nenhum'}`,
    `Aberto em: ${formatDate(new Date(ticket.openedAt))}`,
    `Gerado em: ${formatDate(new Date())}`,
    `Mensagens: ${messages.length}`,
    '='.repeat(60),
    '',
  ].join('\n');

  const body = messages.map(formatMessage).join('\n\n');

  return new AttachmentBuilder(Buffer.from(header + body, 'utf8'), {
    name: `transcript-${padNumber(ticket.number)}.txt`,
  });
}

module.exports = { buildTranscript };
