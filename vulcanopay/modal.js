/* Monta o modal do aviso. Usado na tela do cliente e no preview do painel.
   Todo texto entra via textContent (nunca innerHTML) → sem risco de XSS. */
function buildNoticeModal(notice, client, { onClick, onDismiss } = {}) {
  const LABEL = { info: 'Informação', warning: 'Atenção', urgent: 'Urgente' };

  const modal = document.createElement('div');
  modal.className = 'modal ' + notice.level;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const stripe = document.createElement('div');
  stripe.className = 'stripe';

  const body = document.createElement('div');
  body.className = 'body';

  if (!notice.mandatory) {
    const x = document.createElement('button');
    x.className = 'close-x';
    x.setAttribute('aria-label', 'Fechar');
    x.textContent = '×';
    x.onclick = () => onDismiss && onDismiss();
    body.appendChild(x);
  }

  const badge = document.createElement('span');
  badge.className = 'badge ' + notice.level;
  badge.textContent = LABEL[notice.level];

  const h = document.createElement('h3');
  h.textContent = VP.fill(notice.title, client);

  const p = document.createElement('p');
  p.textContent = VP.fill(notice.message, client);

  body.append(badge, h, p);

  const foot = document.createElement('div');
  foot.className = 'foot';

  const cta = document.createElement('a');
  cta.className = 'btn btn-wa';
  cta.target = '_blank';
  cta.rel = 'noopener';
  cta.href = VP.whatsappLink(notice.phone, VP.fill(notice.waText, client));
  cta.textContent = '💬 ' + (notice.buttonText || 'Falar com o suporte');
  cta.onclick = () => onClick && onClick();
  foot.appendChild(cta);

  if (!notice.mandatory) {
    const later = document.createElement('button');
    later.className = 'btn';
    later.textContent = 'Agora não';
    later.onclick = () => onDismiss && onDismiss();
    foot.appendChild(later);
  }

  modal.append(stripe, body, foot);
  return modal;
}
