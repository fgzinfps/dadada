const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config');

const missing = ['token', 'guildId', 'ticketCategoryId'].filter((key) => !config[key]);
if (!config.staffRoleIds.length) missing.push('staffRoleIds');
if (missing.length) {
  console.error(`[config] Variáveis obrigatórias ausentes no .env: ${missing.join(', ')}`);
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // necessário para o transcript ler o texto das mensagens
  ],
});

const loadDir = (dir) =>
  fs
    .readdirSync(path.join(__dirname, dir))
    .filter((file) => file.endsWith('.js'))
    .map((file) => require(path.join(__dirname, dir, file)));

client.commands = new Collection();
for (const command of loadDir('commands')) client.commands.set(command.data.name, command);

// Um arquivo de botão pode exportar um handler ou uma lista (ex.: pedir confirmação + confirmar).
client.buttons = new Collection();
for (const handler of loadDir('buttons').flat()) client.buttons.set(handler.customId, handler);

for (const event of loadDir('events')) {
  const listener = (...args) => event.execute(...args, client);
  if (event.once) client.once(event.name, listener);
  else client.on(event.name, listener);
}

process.on('unhandledRejection', (err) => console.error('[processo] Promise rejeitada:', err));

client.login(config.token).catch((err) => {
  if (err.message?.includes('disallowed intents')) {
    console.error('[login] Ative "Message Content Intent" no Developer Portal (Bot > Privileged Gateway Intents).');
  } else {
    console.error('[login] Falha ao conectar:', err.message);
  }
  process.exit(1);
});
