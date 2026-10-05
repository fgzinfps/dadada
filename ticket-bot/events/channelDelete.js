const { Events } = require('discord.js');
const store = require('../utils/store');

// Remove do registro tickets cujo canal foi apagado manualmente.
module.exports = {
  name: Events.ChannelDelete,

  execute(channel) {
    store.remove(channel.id);
  },
};
