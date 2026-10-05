const { MessageFlags } = require('discord.js');
const config = require('../config');
const store = require('../utils/store');
const { isStaff } = require('../utils/permissions');
const { noticeEmbed } = require('../utils/embeds');
const { replyEphemeral, getTicketOrReply } = require('../utils/tickets');
const { timestamp } = require('../utils/format');

module.exports = {
  customId: 'ticket:notify',

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return replyEphemeral(interaction, 'Apenas a equipe pode notificar o usuário.');
    }

    const ticket = await getTicketOrReply(interaction);
    if (!ticket) return;
    if (ticket.status === 'closed') return replyEphemeral(interaction, 'Este ticket está fechado.');

    const cooldownMs = config.ticket.notifyCooldownSeconds * 1000;
    const availableAt = (ticket.lastNotifyAt ?? 0) + cooldownMs;
    if (Date.now() < availableAt) {
      return replyEphemeral(interaction, `Aguarde para notificar novamente: disponível ${timestamp(availableAt, 'R')}.`);
    }

    store.update(ticket.channelId, { lastNotifyAt: Date.now() });
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await interaction.channel.send({
      content: `<@${ticket.ownerId}>`,
      embeds: [noticeEmbed(`${config.emojis.notify} ${interaction.user} está aguardando sua resposta neste ticket.`)],
      allowedMentions: { users: [ticket.ownerId] },
    });

    let dmSent = false;
    if (config.ticket.notifyViaDM) {
      const owner = await interaction.client.users.fetch(ticket.ownerId).catch(() => null);
      dmSent = await owner
        ?.send({
          embeds: [
            noticeEmbed(
              `${config.emojis.notify} A equipe de **${interaction.guild.name}** está aguardando sua resposta no ticket ${interaction.channel}.`,
            ),
          ],
        })
        .then(() => true)
        .catch(() => false); // DMs fechadas: a menção no canal já basta.
    }

    await replyEphemeral(interaction, `Usuário notificado${dmSent ? ' no canal e por DM' : ' no canal'}.`);
  },
};
