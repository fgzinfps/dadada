module.exports = {
  customId: 'ticket:cancel',

  async execute(interaction) {
    await interaction.update({ content: 'Ação cancelada.', components: [] });
  },
};
