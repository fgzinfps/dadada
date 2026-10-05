const padNumber = (n) => String(n).padStart(4, '0');

const timestamp = (ms, style = 'f') => `<t:${Math.floor(ms / 1000)}:${style}>`;

function duration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return 'menos de 1 min';
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}min`]
    .filter(Boolean)
    .join(' ');
}

function slug(text) {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20) || 'usuario'
  );
}

module.exports = { padNumber, timestamp, duration, slug };
