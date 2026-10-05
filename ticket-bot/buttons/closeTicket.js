const { MessageFlags, OverwriteType } = require('discord.js');
const config = require('../config');
const store = require('../utils/store');
const { isStaff } = require('../utils/permissions');
const { noticeEmbed } = require('../utils/embeds');
const { confirmRow } = require('../utils/components');
const { replyEphemeral, getTicketOrReply, refreshTicketMessage } = require('../utils/tickets');
const { buildTranscript } = require('../utils/transcript');
const { sendLog } = require('../utils/logs');

async function canClose(interaction) {
  const ticket = await getTicketOrReply(interaction);
  if (!ticket) return null;
  if (ticket.status === 'closed') {
    await replyEphemeral(interaction, 'Este ticket já está fechado.');
    return null;
  }
  if (ticket.ownerId !== interaction.user.id && !isStaff(interaction.member)) {
    await replyEphemeral(interaction, 'Apenas o autor do ticket ou a equipe pode fechá-lo.');
    return null;
  }
  return ticket;
}

// Passo 1: pede confirmação (mensagem efêmera).
const request = {
  customId: 'ticket:close',

  async execute(interaction) {
    if (!(await canClose(interaction))) return;
    await interaction.reply({
      content: `${config.emojis.close} Tem certeza que deseja **fechar** este ticket? O autor não poderá mais enviar mensagens.`,
      components: [confirmRow('ticket:close:confirm', 'Fechar Ticket')],
      flags: MessageFlags.Ephemeral,
    });
  },
};

// Passo 2: fecha de fato.
const confirm = {
  customId: 'ticket:close:confirm',

  async execute(interaction) {
    const ticket = await canClose(interaction);
    if (!ticket) return;

    store.update(ticket.channelId, { status: 'closed', closedAt: Date.now(), closedBy: interaction.user.id });
    await interaction.update({ content: 'Fechando ticket...', components: [] });

    const { channel } = interaction;

    // Mantém o histórico visível para o autor, mas bloqueia novas mensagens.
    await channel.permissionOverwrites
      .edit(ticket.ownerId, { SendMessages: false, AddReactions: false }, { type: OverwriteType.Member })
      .catch((err) => console.error('[ticket:close] Falha ao bloquear o autor:', err.message));

    await refreshTicketMessage(channel, ticket);
    await channel.send({
      embeds: [
        noticeEmbed(
          `${config.emojis.close} Ticket fechado por ${interaction.user}. A equipe pode reabri-lo ou apagá-lo.`,
          config.colors.closed,
        ),
      ],
    });

    const transcript = await buildTranscript(channel, ticket).catch((err) => {
      console.error('[ticket:close] Falha ao gerar transcript:', err.message);
      return null;
    });
    await sendLog(interaction.guild, 'close', ticket, interaction.user, { file: transcript });
    await interaction.editReply({ content: 'Ticket fechado.' });
  },
};

module.exports = [request, confirm];
