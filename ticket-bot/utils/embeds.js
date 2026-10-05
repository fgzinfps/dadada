const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { padNumber, timestamp } = require('./format');

const { colors, emojis, texts } = config;

function panelEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(colors.primary)
    .setAuthor({ name: config.systemName, iconURL: guild.iconURL() ?? undefined })
    .setTitle(texts.panelTitle)
    .setDescription(texts.panelDescription)
    .setFooter({ text: `${config.systemName} • Atendimento via ticket` });

  if (config.bannerUrl) embed.setImage(config.bannerUrl);
  return embed;
}

function ticketStatus(ticket) {
  if (ticket.status === 'closed') return { label: `${emojis.closed} Fechado`, color: colors.closed };
  if (ticket.claimedBy) return { label: `${emojis.inProgress} Em atendimento`, color: colors.claimed };
  return { label: `${emojis.waiting} Aguardando atendimento`, color: colors.primary };
}

function ticketEmbed(ticket, owner) {
  const status = ticketStatus(ticket);

  return new EmbedBuilder()
    .setColor(status.color)
    .setAuthor({ name: `${config.systemName} • Ticket #${padNumber(ticket.number)}` })
    .setDescription(`### Ticket de <@${ticket.ownerId}>\n${texts.ticketIntro}`)
    .setThumbnail(owner?.displayAvatarURL() ?? null)
    .addFields(
      { name: 'Status', value: status.label, inline: true },
      { name: 'Autor', value: `<@${ticket.ownerId}>`, inline: true },
      {
        name: 'Responsável',
        value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Nenhum ainda',
        inline: true,
      },
      { name: 'Aberto em', value: `${timestamp(ticket.openedAt)} (${timestamp(ticket.openedAt, 'R')})` },
    )
    .setFooter({ text: texts.ticketFooter });
}

// Mensagem curta exibida dentro do ticket (ex.: "X assumiu o ticket").
function noticeEmbed(text, color = colors.primary) {
  return new EmbedBuilder().setColor(color).setDescription(text);
}

module.exports = { panelEmbed, ticketEmbed, noticeEmbed };
