# Ticket Bot

Bot de suporte via tickets para Discord (Node.js + discord.js v14).

## Recursos

- `/setup-ticket` envia o painel com o botão **Abrir Ticket** no canal atual (somente administradores).
- Cada ticket é um canal privado (`ticket-0001` ou `ticket-nomeusuario`), visível só para o autor, a staff e o bot.
- Um ticket aberto por usuário: um segundo clique leva ao ticket existente.
- Botões dentro do ticket:
  - **Assumir / Liberar**: somente um responsável por vez. Só quem assumiu (ou um admin) pode liberar.
  - **Notificar Usuário**: menciona o autor no canal e tenta enviar DM. Tem cooldown.
  - **Fechar Ticket**: pede confirmação, bloqueia novas mensagens do autor e gera o transcript.
  - **Reabrir Ticket**: aparece depois de fechar (somente staff).
  - **Apagar Ticket**: pede confirmação e exclui o canal (somente staff).
- Logs (abertura, assumido, liberado, fechado, reaberto, apagado) com data, autor, responsável e duração.
- Transcript `.txt` anexado ao log ao fechar (ou ao apagar um ticket que não foi fechado antes).

## Estrutura

```
index.js            carrega comandos, botões e eventos
config.js           IDs, cores, emojis e textos
commands/           comandos de barra
buttons/            um arquivo por ação de botão
events/             ready, interactionCreate, channelDelete
utils/              embeds, botões, logs, transcript, permissões, armazenamento
data/tickets.json   estado dos tickets (criado automaticamente)
```

## Instalação

1. Node.js 18 ou superior.
2. No [Developer Portal](https://discord.com/developers/applications): crie o bot, copie o token e ative
   **Message Content Intent** (Bot > Privileged Gateway Intents). Sem ele, o transcript sai sem o texto das mensagens.
3. Convide o bot com os escopos `bot` e `applications.commands` e as permissões:
   Ver Canais, Gerenciar Canais, Gerenciar Cargos, Enviar Mensagens, Inserir Links, Anexar Arquivos,
   Ler Histórico de Mensagens, Gerenciar Mensagens e Mencionar Todos (para mencionar o cargo da staff).
   O cargo do bot deve ficar **acima** do cargo da staff.
4. Configure:
   ```bash
   cp .env.example .env   # preencha os IDs (ative o Modo Desenvolvedor no Discord para copiá-los)
   npm install
   npm start
   ```
5. No canal de suporte, use `/setup-ticket`.

Os comandos são registrados no servidor `GUILD_ID` ao iniciar, então aparecem na hora.

## Personalização

- Cor de destaque, nome e banner: `.env` (`EMBED_COLOR`, `SYSTEM_NAME`, `BANNER_URL`).
- Textos do painel e do ticket, emojis, cores de status, tempo para apagar e limite do transcript: `config.js`.

## Limitações conhecidas

- O estado fica em `data/tickets.json`. Em hospedagens com disco efêmero, os tickets abertos perdem o
  registro a cada deploy. Use um volume persistente ou troque `utils/store.js` por um banco de dados.
- Pensado para **um servidor e uma instância** do bot.
- Uma categoria do Discord comporta no máximo 50 canais.
- Links de anexos no transcript são da CDN do Discord e expiram depois de algum tempo.
