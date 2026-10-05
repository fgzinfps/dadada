const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emojis } = require('../config');

const button = (customId, label, emoji, style = ButtonStyle.Secondary) =>
  new ButtonBuilder().setCustomId(customId).setLabel(label).setEmoji(emoji).setStyle(style);

function panelRow() {
  return new ActionRowBuilder().addComponents(button('ticket:open', 'Abrir Ticket', emojis.ticket));
}

function ticketRows(ticket) {
  if (ticket.status === 'closed') {
    return [
      new ActionRowBuilder().addComponents(
        button('ticket:reopen', 'Reabrir Ticket', emojis.reopen),
        button('ticket:delete', 'Apagar Ticket', emojis.delete, ButtonStyle.Danger),
      ),
    ];
  }

  const claimButton = ticket.claimedBy
    ? button('ticket:release', 'Liberar Ticket', emojis.release)
    : button('ticket:claim', 'Assumir Ticket', emojis.claim, ButtonStyle.Success);

  return [
    new ActionRowBuilder().addComponents(
      claimButton,
      button('ticket:notify', 'Notificar Usuário', emojis.notify),
      button('ticket:close', 'Fechar Ticket', emojis.close),
      button('ticket:delete', 'Apagar Ticket', emojis.delete, ButtonStyle.Danger),
    ),
  ];
}

function confirmRow(confirmId, confirmLabel) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket:cancel').setLabel('Cancelar').setStyle(ButtonStyle.Secondary),
  );
}

module.exports = { panelRow, ticketRows, confirmRow };
