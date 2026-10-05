const config = require('../config');
const store = require('../utils/store');
const { isAdmin } = require('../utils/permissions');
const { noticeEmbed } = require('../utils/embeds');
const { replyEphemeral, getTicketOrReply, ticketMessagePayload } = require('../utils/tickets');
const { sendLog } = require('../utils/logs');

module.exports = {
  customId: 'ticket:release',

  async execute(interaction) {
    const ticket = await getTicketOrReply(interaction);
    if (!ticket) return;
    if (!ticket.claimedBy) return replyEphemeral(interaction, 'Este ticket não possui responsável.');

    if (ticket.claimedBy !== interaction.user.id && !isAdmin(interaction.member)) {
      return replyEphemeral(interaction, 'Apenas o responsável atual ou um administrador pode liberar o ticket.');
    }

    store.update(ticket.channelId, { claimedBy: null, claimedAt: null });

    await interaction.update(await ticketMessagePayload(interaction.client, ticket));
    await interaction.channel.send({
      embeds: [noticeEmbed(`${config.emojis.release} ${interaction.user} liberou este ticket. Outro membro da equipe poderá assumir.`)],
    });
    await sendLog(interaction.guild, 'release', ticket, interaction.user);
  },
};
