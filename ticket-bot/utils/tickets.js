const { MessageFlags } = require('discord.js');
const store = require('./store');
const { ticketEmbed } = require('./embeds');
const { ticketRows } = require('./components');

/** Resposta efêmera padrão (visível só para quem clicou). */
function replyEphemeral(interaction, content) {
  if (interaction.deferred && !interaction.replied) {
    return interaction.editReply({ content, embeds: [], components: [] });
  }
  const payload = { content, embeds: [], components: [], flags: MessageFlags.Ephemeral };
  return interaction.replied ? interaction.followUp(payload) : interaction.reply(payload);
}

/** Busca o ticket do canal atual ou responde com erro. */
async function getTicketOrReply(interaction) {
  const ticket = store.get(interaction.channelId);
  if (!ticket) {
    await replyEphemeral(interaction, 'Este canal não está registrado como ticket.');
    return null;
  }
  return ticket;
}

/** Monta o payload da mensagem principal do ticket (embed + botões). */
async function ticketMessagePayload(client, ticket) {
  const owner = await client.users.fetch(ticket.ownerId).catch(() => null);
  return { embeds: [ticketEmbed(ticket, owner)], components: ticketRows(ticket) };
}

/** Atualiza a mensagem principal do ticket a partir de qualquer interação. */
async function refreshTicketMessage(channel, ticket) {
  if (!ticket.messageId) return;
  const message = await channel.messages.fetch(ticket.messageId).catch(() => null);
  if (!message) return;
  await message.edit(await ticketMessagePayload(channel.client, ticket));
}

module.exports = { replyEphemeral, getTicketOrReply, ticketMessagePayload, refreshTicketMessage };
