const { ActivityType, ChannelType, Events } = require('discord.js');
const config = require('../config');

// Avisa no console sobre IDs inválidos antes que algum usuário encontre o erro.
async function validateConfig(guild) {
  const category = await guild.channels.fetch(config.ticketCategoryId).catch(() => null);
  if (category?.type !== ChannelType.GuildCategory) {
    console.warn(`[config] TICKET_CATEGORY_ID (${config.ticketCategoryId}) não é uma categoria válida.`);
  }

  for (const id of config.staffRoleIds) {
    if (!(await guild.roles.fetch(id).catch(() => null))) console.warn(`[config] Cargo de staff ${id} não encontrado.`);
  }

  if (!config.logChannelId) {
    console.warn('[config] LOG_CHANNEL_ID não definido: os logs estão desativados.');
  } else if (!(await guild.channels.fetch(config.logChannelId).catch(() => null))) {
    console.warn(`[config] Canal de logs ${config.logChannelId} não encontrado.`);
  }
}

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    const guild = await client.guilds.fetch(config.guildId).catch(() => null);
    if (!guild) {
      console.error(`[ready] O bot não está no servidor GUILD_ID=${config.guildId}.`);
      return;
    }

    // Comandos registrados no servidor aparecem na hora (globais podem levar até 1h).
    await guild.commands.set(client.commands.map((command) => command.data.toJSON()));
    await validateConfig(guild);

    client.user.setActivity(config.systemName, { type: ActivityType.Watching });
    console.log(`[ready] Online como ${client.user.tag} em "${guild.name}".`);
  },
};
