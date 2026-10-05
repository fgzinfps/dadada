const { Events } = require('discord.js');
const { replyEphemeral } = require('../utils/tickets');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    let handler;
    if (interaction.isChatInputCommand()) handler = interaction.client.commands.get(interaction.commandName);
    else if (interaction.isButton()) handler = interaction.client.buttons.get(interaction.customId);
    if (!handler) return;

    try {
      await handler.execute(interaction);
    } catch (err) {
      console.error(`[interaction] Erro em "${interaction.commandName ?? interaction.customId}":`, err);
      await replyEphemeral(interaction, 'Ocorreu um erro ao processar esta ação. Tente novamente.').catch(() => {});
    }
  },
};
