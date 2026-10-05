const { ChannelType, MessageFlags, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const store = require('../utils/store');
const { padNumber, slug } = require('../utils/format');
const { replyEphemeral, ticketMessagePayload } = require('../utils/tickets');
const { sendLog } = require('../utils/logs');

const P = PermissionFlagsBits;
const MEMBER_PERMS = [P.ViewChannel, P.SendMessages, P.ReadMessageHistory, P.AttachFiles, P.EmbedLinks];

// Evita que cliques repetidos criem dois canais para o mesmo usuário.
const opening = new Set();

module.exports = {
  customId: 'ticket:open',

  async execute(interaction) {
    const { guild, user, client } = interaction;

    const existing = store.findOpenByOwner(guild.id, user.id);
    if (existing) {
      if (guild.channels.cache.has(existing.channelId)) {
        return replyEphemeral(interaction, `Você já possui um ticket aberto: <#${existing.channelId}>`);
      }
      store.remove(existing.channelId); // canal apagado enquanto o bot estava offline
    }

    if (opening.has(user.id)) {
      return replyEphemeral(interaction, 'Seu ticket já está sendo criado, aguarde um instante.');
    }
    opening.add(user.id);

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const number = store.nextNumber();
      const name = config.ticket.naming === 'username' ? `ticket-${slug(user.username)}` : `ticket-${padNumber(number)}`;

      let channel;
      try {
        channel = await guild.channels.create({
          name,
          type: ChannelType.GuildText,
          parent: config.ticketCategoryId,
          topic: `Ticket #${padNumber(number)} • ${user.tag} (${user.id})`,
          permissionOverwrites: [
            { id: guild.roles.everyone.id, deny: [P.ViewChannel] },
            { id: user.id, allow: MEMBER_PERMS },
            ...config.staffRoleIds.map((id) => ({ id, allow: [...MEMBER_PERMS, P.ManageMessages] })),
            { id: client.user.id, allow: [...MEMBER_PERMS, P.ManageChannels, P.ManageMessages] },
          ],
        });
      } catch (err) {
        console.error('[ticket:open] Falha ao criar canal:', err);
        return interaction.editReply(
          'Não consegui criar seu ticket. Avise a equipe: o bot precisa das permissões **Gerenciar Canais** e **Gerenciar Cargos**, e a categoria configurada deve existir.',
        );
      }

      const ticket = store.create({
        number,
        guildId: guild.id,
        channelId: channel.id,
        ownerId: user.id,
        status: 'open',
        claimedBy: null,
        claimedAt: null,
        openedAt: Date.now(),
        closedAt: null,
        closedBy: null,
        lastNotifyAt: 0,
        messageId: null,
      });

      const pingStaff = config.ticket.pingStaffOnOpen && config.staffRoleIds.length > 0;
      const mentions = [`${user}`, ...(pingStaff ? config.staffRoleIds.map((id) => `<@&${id}>`) : [])];

      const message = await channel.send({
        content: mentions.join(' '),
        ...(await ticketMessagePayload(client, ticket)),
        allowedMentions: { users: [user.id], roles: pingStaff ? config.staffRoleIds : [] },
      });
      store.update(channel.id, { messageId: message.id });

      await interaction.editReply(`${config.emojis.ticket} Seu ticket foi criado: ${channel}`);
      await sendLog(guild, 'open', ticket, user);
    } finally {
      opening.delete(user.id);
    }
  },
};
