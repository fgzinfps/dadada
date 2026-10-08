/* ==========================================================================
   VulcanoPay — "banco de dados" da demonstração
   --------------------------------------------------------------------------
   Nesta demo os dados ficam no localStorage do navegador, então o painel
   (admin.html) e a tela do cliente (gateway.html) só conversam entre si se
   forem abertos NO MESMO NAVEGADOR. Em produção isso vira uma tabela no banco
   + 3 endpoints de API (ver README.md).
   ========================================================================== */

const VP = (() => {
  const KEY = 'vulcanopay_demo_v1';

  /* Clientes fictícios. Em produção vêm da tabela de usuários do gateway. */
  const SEED_CLIENTS = [
    { id: 'C-1001', nome: 'Loja do Marcos',      email: 'marcos@lojadomarcos.com', doc: '12.345.678/0001-90' },
    { id: 'C-1002', nome: 'Ana Cosméticos',      email: 'ana@anacosmeticos.com',   doc: '23.456.789/0001-01' },
    { id: 'C-1003', nome: 'TechStore Ltda',      email: 'contato@techstore.com',   doc: '34.567.890/0001-12' },
    { id: 'C-1004', nome: 'João Infoprodutos',   email: 'joao@infojoao.com',       doc: '456.789.012-34' },
    { id: 'C-1005', nome: 'Bella Moda',          email: 'bella@bellamoda.com',     doc: '56.789.012/0001-34' }
  ];

  function defaults() {
    return {
      clients: SEED_CLIENTS,
      notices: [],      // avisos criados no painel
      events: []        // { noticeId, clientId, type: 'view'|'click'|'dismiss', at }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw);
      return { ...defaults(), ...data };
    } catch { return defaults(); }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  function uid() {
    return 'N-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* Substitui {nome}, {id}, {email}, {doc} pelos dados do cliente. */
  function fill(text, client) {
    return String(text || '').replace(/\{(nome|id|email|doc)\}/g, (_, k) => client[k] ?? '');
  }

  /* Só dígitos. WhatsApp exige DDI + DDD + número, ex.: 5511999998888 */
  function cleanPhone(p) { return String(p || '').replace(/\D/g, ''); }

  function whatsappLink(phone, text) {
    return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(text || '')}`;
  }

  /* ----- Regras de exibição: QUAL aviso aparece para QUAL cliente -------- */
  function noticeFor(clientId) {
    const data = load();
    const now = Date.now();

    const candidates = data.notices.filter(n => {
      if (!n.active) return false;
      if (n.expiresAt && new Date(n.expiresAt).getTime() < now) return false;
      if (n.audience === 'selected' && !n.clientIds.includes(clientId)) return false;

      const mine = data.events.filter(e => e.noticeId === n.id && e.clientId === clientId);
      const clicked   = mine.some(e => e.type === 'click');
      const viewed    = mine.some(e => e.type === 'view');
      const dismissed = mine.some(e => e.type === 'dismiss');

      if (clicked) return false;                         // já falou com o suporte → para de mostrar
      if (n.frequency === 'once' && (viewed || dismissed)) return false;
      return true;                                       // 'until_click' → mostra a cada acesso
    });

    // Prioridade: urgente > alerta > info; depois o mais recente.
    const rank = { urgent: 0, warning: 1, info: 2 };
    candidates.sort((a, b) => rank[a.level] - rank[b.level] || b.createdAt.localeCompare(a.createdAt));
    return candidates[0] || null;
  }

  function track(noticeId, clientId, type) {
    const data = load();
    data.events.push({ noticeId, clientId, type, at: new Date().toISOString() });
    save(data);
  }

  function stats(noticeId) {
    const ev = load().events.filter(e => e.noticeId === noticeId);
    const uniq = t => new Set(ev.filter(e => e.type === t).map(e => e.clientId)).size;
    return { views: uniq('view'), clicks: uniq('click'), dismiss: uniq('dismiss') };
  }

  return { load, save, uid, fill, cleanPhone, whatsappLink, noticeFor, track, stats, KEY };
})();
