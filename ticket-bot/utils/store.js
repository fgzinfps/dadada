const fs = require('node:fs');
const path = require('node:path');

// Persistência simples em JSON. Suficiente para um único servidor/instância.
const DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DIR, 'tickets.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return { counter: 0, tickets: {} };
    // Não sobrescreve um arquivo corrompido: melhor parar do que perder dados.
    throw new Error(`Falha ao ler ${FILE}: ${err.message}`);
  }
}

const state = load();

function save() {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

module.exports = {
  nextNumber() {
    state.counter += 1;
    save();
    return state.counter;
  },

  get(channelId) {
    return state.tickets[channelId] ?? null;
  },

  create(ticket) {
    state.tickets[ticket.channelId] = ticket;
    save();
    return ticket;
  },

  update(channelId, patch) {
    const ticket = state.tickets[channelId];
    if (!ticket) return null;
    Object.assign(ticket, patch);
    save();
    return ticket;
  },

  remove(channelId) {
    if (!state.tickets[channelId]) return;
    delete state.tickets[channelId];
    save();
  },

  findOpenByOwner(guildId, ownerId) {
    return (
      Object.values(state.tickets).find(
        (t) => t.guildId === guildId && t.ownerId === ownerId && t.status === 'open',
      ) ?? null
    );
  },
};
