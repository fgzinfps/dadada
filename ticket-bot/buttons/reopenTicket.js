const { OverwriteType } = require('discord.js');
const config = require('../config');
const store = require('../utils/store');
const { isStaff } = require('../utils/permissions');
const { noticeEmbed } = require('../utils/embeds');
const { replyEphemeral, getTicketOrReply, ticketMessagePayload } = require('../utils/tickets');
const { sendLog } = require('../utils/logs');

module.exports = {
  customId: 'ticket:reopen',

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return replyEphemeral(interaction, 'Apenas a equipe pode reabrir tickets.');
    }

    const ticket = await getTicketOrReply(interaction);
    if (!ticket) return;
    if (ticket.status !== 'closed') return replyEphemeral(interaction, 'Este ticket já está aberto.');

    store.update(ticket.channelId, { status: 'open', closedAt: null, closedBy: null });

    await interaction.update(await ticketMessagePayload(interaction.client, ticket));
    await interaction.channel.permissionOverwrites
      .edit(ticket.ownerId, { SendMessages: true, AddReactions: true }, { type: OverwriteType.Member })
      .catch((err) => console.error('[ticket:reopen] Falha ao liberar o autor:', err.message));

    await interaction.channel.send({
      content: `<@${ticket.ownerId}>`,
      embeds: [noticeEmbed(`${config.emojis.reopen} Ticket reaberto por ${interaction.user}.`)],
      allowedMentions: { users: [ticket.ownerId] },
    });
    await sendLog(interaction.guild, 'reopen', ticket, interaction.user);
  },
};
