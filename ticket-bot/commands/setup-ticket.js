const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const { panelEmbed } = require('../utils/embeds');
const { panelRow } = require('../utils/components');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription('Envia o painel de abertura de tickets neste canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'Apenas administradores podem usar este comando.', flags: MessageFlags.Ephemeral });
    }

    await interaction.channel.send({ embeds: [panelEmbed(interaction.guild)], components: [panelRow()] });
    await interaction.reply({ content: 'Painel de tickets enviado.', flags: MessageFlags.Ephemeral });
  },
};
