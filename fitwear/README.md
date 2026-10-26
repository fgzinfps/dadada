# LookFit — loja

Site estático (HTML/CSS/JS, sem build). Pedidos finalizados pelo WhatsApp.

## Publicar na Netlify
1. Acesse https://app.netlify.com/drop
2. Arraste esta pasta inteira (a que tem o `index.html`).
3. Pronto: a Netlify gera o link. Para atualizar depois, arraste a pasta de novo em
   Site > Deploys.

## Onde mexer
- `js/config.js`: nome, WhatsApp, Instagram, pedido mínimo e cores padrão.
- `js/produtos.js`: uma peça por linha — `preco`, `estoque` (0 = esgotado), `tamanhos`
  e, se quiser, `cores` próprias. Não apague vírgulas nem aspas.
- `privacidade.html`: política de privacidade (exigida pelo Pixel da Meta / LGPD).
- `logo/`: arquivos da logo para Instagram e gráfica.
