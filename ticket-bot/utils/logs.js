const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { padNumber, timestamp, duration } = require('./format');

const ACTIONS = {
  open: { title: 'Ticket aberto', emoji: config.emojis.ticket, color: config.colors.primary },
  claim: { title: 'Ticket assumido', emoji: config.emojis.claim, color: config.colors.claimed },
  release: { title: 'Ticket liberado', emoji: config.emojis.release, color: config.colors.primary },
  close: { title: 'Ticket fechado', emoji: config.emojis.close, color: config.colors.closed },
  reopen: { title: 'Ticket reaberto', emoji: config.emojis.reopen, color: config.colors.primary },
  delete: { title: 'Ticket apagado', emoji: config.emojis.delete, color: config.colors.danger },
};

/**
 * Envia um registro no canal de logs. Nunca lança erro: falha de log
 * não deve quebrar o fluxo do ticket.
 */
async function sendLog(guild, action, ticket, actor, { file } = {}) {
  if (!config.logChannelId) return;

  try {
    const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel?.isTextBased()) return;

    const meta = ACTIONS[action];
    const now = Date.now();

    const embed = new EmbedBuilder()
      .setColor(meta.color)
      .setTitle(`${meta.emoji} ${meta.title}`)
      .addFields(
        { name: 'Ticket', value: `#${padNumber(ticket.number)} • <#${ticket.channelId}>`, inline: true },
        { name: 'Aberto por', value: `<@${ticket.ownerId}>`, inline: true },
        { name: 'Ação por', value: actor ? `<@${actor.id}>` : '—', inline: true },
        { name: 'Responsável', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Nenhum', inline: true },
        { name: 'Data', value: timestamp(now), inline: true },
      )
      .setFooter({ text: `${config.systemName} • ID do canal: ${ticket.channelId}` });

    if (action === 'close' || action === 'delete') {
      const end = ticket.closedAt ?? now;
      embed.addFields({ name: 'Duração do atendimento', value: duration(end - ticket.openedAt), inline: true });
      if (ticket.claimedAt) {
        embed.addFields({
          name: 'Tempo até assumir',
          value: duration(ticket.claimedAt - ticket.openedAt),
          inline: true,
        });
      }
    }

    await channel.send({ embeds: [embed], files: file ? [file] : [], allowedMentions: { parse: [] } });
  } catch (err) {
    console.error(`[logs] Falha ao registrar "${action}":`, err.message);
  }
}

module.exports = { sendLog };
