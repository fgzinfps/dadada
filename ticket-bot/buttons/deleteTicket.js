const { MessageFlags } = require('discord.js');
const config = require('../config');
const store = require('../utils/store');
const { isStaff } = require('../utils/permissions');
const { confirmRow } = require('../utils/components');
const { replyEphemeral, getTicketOrReply } = require('../utils/tickets');
const { buildTranscript } = require('../utils/transcript');
const { sendLog } = require('../utils/logs');

// Canais em processo de exclusão (evita confirmações duplicadas).
const deleting = new Set();

async function canDelete(interaction) {
  if (!isStaff(interaction.member)) {
    await replyEphemeral(interaction, 'Apenas a equipe pode apagar tickets.');
    return null;
  }
  const ticket = await getTicketOrReply(interaction);
  if (ticket && deleting.has(ticket.channelId)) {
    await replyEphemeral(interaction, 'Este ticket já está sendo apagado.');
    return null;
  }
  return ticket;
}

const request = {
  customId: 'ticket:delete',

  async execute(interaction) {
    if (!(await canDelete(interaction))) return;
    await interaction.reply({
      content: `${config.emojis.delete} Tem certeza que deseja **apagar permanentemente** este ticket? Essa ação não pode ser desfeita.`,
      components: [confirmRow('ticket:delete:confirm', 'Apagar Ticket')],
      flags: MessageFlags.Ephemeral,
    });
  },
};

const confirm = {
  customId: 'ticket:delete:confirm',

  async execute(interaction) {
    const ticket = await canDelete(interaction);
    if (!ticket) return;

    deleting.add(ticket.channelId);
    const delay = config.ticket.deleteDelaySeconds;
    await interaction.update({ content: `Apagando o ticket em ${delay} segundos...`, components: [] });

    const { channel } = interaction;

    // Se o ticket já foi fechado, o transcript foi enviado no log de fechamento.
    const transcript =
      ticket.status === 'closed'
        ? null
        : await buildTranscript(channel, ticket).catch((err) => {
            console.error('[ticket:delete] Falha ao gerar transcript:', err.message);
            return null;
          });
    await sendLog(interaction.guild, 'delete', ticket, interaction.user, { file: transcript });

    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    try {
      await channel.delete(`Ticket #${ticket.number} apagado por ${interaction.user.tag}`);
      store.remove(ticket.channelId);
    } finally {
      deleting.delete(ticket.channelId);
    }
  },
};

module.exports = [request, confirm];
