# VulcanoPay — Avisos para clientes (demo)

Você escolhe **a mensagem**, **para quem aparece** e **qual WhatsApp** recebe o contato.
Quando o cliente entra no gateway, aparece um aviso na tela dele com um botão
"Falar com o suporte". Esse botão abre o WhatsApp **com uma mensagem já escrita
contendo o nome, o ID e o e-mail dele**. Assim você sabe quem está chamando sem
precisar ter o número dele.

## Como testar (2 minutos)

1. Abra `admin.html` no navegador, monte o aviso e clique em **Publicar aviso**.
2. Clique em **Abrir tela do cliente ↗** (`gateway.html`) e troque de cliente no seletor do topo.
3. Quem foi selecionado vê o aviso. Os outros, não.
4. Volte no painel: lá aparece quantos **viram**, **clicaram** e **fecharam**.

> Na demo, os dados ficam no `localStorage`. Os dois arquivos só se enxergam se estiverem
> abertos **no mesmo navegador**. Para funcionar com clientes reais, implemente o backend abaixo.

## O que dá para configurar

| Campo | O que faz |
|---|---|
| Título / Mensagem | Texto do aviso. Aceita `{nome}`, `{id}`, `{email}` e `{doc}` |
| Tipo | Informação, Atenção ou Urgente (muda a cor e a prioridade) |
| WhatsApp de destino | O seu número ou o do suporte |
| Mensagem do WhatsApp | Texto que já vem escrito para o cliente enviar a você |
| Para quem | Todos os clientes ou só os selecionados |
| Frequência | Uma vez só, ou toda vez que entrar até clicar no botão |
| Pode fechar? | Se for "não", o cliente só sai do aviso clicando no botão |
| Expira em | Depois dessa data, o aviso some sozinho |

## Levando para produção (para o dev do gateway)

### Tabelas

```sql
CREATE TABLE notices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  level        TEXT NOT NULL CHECK (level IN ('info','warning','urgent')),
  button_text  TEXT NOT NULL DEFAULT 'Falar com o suporte',
  phone        TEXT NOT NULL,                 -- só dígitos, ex.: 5511999998888
  wa_text      TEXT,
  audience     TEXT NOT NULL CHECK (audience IN ('all','selected')),
  frequency    TEXT NOT NULL CHECK (frequency IN ('once','until_click')),
  mandatory    BOOLEAN NOT NULL DEFAULT false,
  active       BOOLEAN NOT NULL DEFAULT true,
  expires_at   TIMESTAMPTZ,
  created_by   UUID NOT NULL,                 -- admin que criou (auditoria)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notice_targets (               -- usado quando audience = 'selected'
  notice_id  UUID REFERENCES notices(id) ON DELETE CASCADE,
  client_id  UUID NOT NULL,
  PRIMARY KEY (notice_id, client_id)
);

CREATE TABLE notice_events (
  id         BIGSERIAL PRIMARY KEY,
  notice_id  UUID REFERENCES notices(id) ON DELETE CASCADE,
  client_id  UUID NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('view','click','dismiss')),
  at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON notice_events (notice_id, client_id);
```

### Endpoints

| Método | Rota | Quem chama | O que faz |
|---|---|---|---|
| `GET`  | `/api/me/notice` | Gateway do cliente, ao logar | Devolve o aviso de maior prioridade para o cliente logado, ou `204`. A lógica está em `noticeFor()` no `store.js` |
| `POST` | `/api/me/notice/:id/event` | Gateway do cliente | Registra `view`, `click` ou `dismiss` |
| `CRUD` | `/api/admin/notices` | Painel admin | Cria, edita, pausa e exclui avisos, e devolve as estatísticas |

### Regras que não podem faltar

- **O `client_id` sai da sessão/token do servidor, nunca da URL.** Se vier da URL, qualquer
  pessoa consegue ver os avisos de outro cliente.
- O endpoint `/api/admin/*` só pode ser acessado por um admin autenticado. Registre quem criou cada aviso.
- Renderize os textos como **texto**, nunca como HTML (o `modal.js` já usa `textContent`).
  Se não fizer isso, quem tiver acesso ao painel consegue injetar script na conta dos clientes.
- O número de WhatsApp deve ser oficial da empresa e aparecer também no site. Um aviso
  "urgente, fale neste número" que o cliente não consegue conferir em lugar nenhum tem cara de golpe.
