const config = require('../config');
const store = require('../utils/store');
const { isStaff } = require('../utils/permissions');
const { noticeEmbed } = require('../utils/embeds');
const { replyEphemeral, getTicketOrReply, ticketMessagePayload } = require('../utils/tickets');
const { sendLog } = require('../utils/logs');

module.exports = {
  customId: 'ticket:claim',

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return replyEphemeral(interaction, 'Apenas a equipe pode assumir tickets.');
    }

    const ticket = await getTicketOrReply(interaction);
    if (!ticket) return;
    if (ticket.status === 'closed') return replyEphemeral(interaction, 'Este ticket está fechado.');
    if (ticket.claimedBy === interaction.user.id) {
      return replyEphemeral(interaction, 'Você já é o responsável por este ticket.');
    }
    if (ticket.claimedBy) {
      return replyEphemeral(
        interaction,
        `Este ticket já está sendo atendido por <@${ticket.claimedBy}>. O responsável precisa liberá-lo antes.`,
      );
    }

    // Atualização síncrona antes de qualquer await: dois cliques simultâneos não geram dois responsáveis.
    store.update(ticket.channelId, { claimedBy: interaction.user.id, claimedAt: Date.now() });

    await interaction.update(await ticketMessagePayload(interaction.client, ticket));
    await interaction.channel.send({
      embeds: [
        noticeEmbed(
          `${config.emojis.claim} ${interaction.user} assumiu este ticket e irá te atender.`,
          config.colors.claimed,
        ),
      ],
    });
    await sendLog(interaction.guild, 'claim', ticket, interaction.user);
  },
};
