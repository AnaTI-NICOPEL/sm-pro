# Sistema de Envio e Monitoramento SM Click

Aplicação Node.js + Express + React para:

- importar e organizar contatos;
- agendar disparos de mensagens;
- consultar logs de envio;
- monitorar o tempo de primeira resposta da atendente MARIA.

## Regra do monitoramento de leads

O monitoramento **não encerra, fecha, transfere ou altera nenhuma conversa no SM Click**.

Ele somente registra:

1. horário da primeira mensagem do cliente, recebido pelo evento `new-chat` ou por um evento de mensagem de entrada;
2. horário da primeira mensagem de saída identificada como enviada pela atendente `MARIA`;
3. diferença, em segundos, entre os dois horários.

Depois que o tempo é calculado, o registro permanece na página **Monitoramento**. Mensagens posteriores da MARIA não alteram a medição original.

## Webhook

URL de produção:

```text
https://SEU-SERVICO.onrender.com/api/webhook/smclick
```

A rota antiga também continua válida:

```text
https://SEU-SERVICO.onrender.com/api/webhook
```

O endpoint precisa receber o evento `new-chat` e também o evento de mensagem enviada pelo atendente. Um webhook que envie somente o início da conversa não contém o segundo horário necessário para calcular a resposta da MARIA.

## Variáveis de ambiente

```text
DATABASE_URL=postgresql://...
SMCLICK_API_KEY=sua_chave
LEAD_MONITOR_ATTENDANT=MARIA
LEAD_SESSION_WINDOW_HOURS=24
```

As duas primeiras são obrigatórias. As duas últimas são opcionais e já possuem os valores padrão mostrados acima.

## Executar localmente

Na raiz do projeto:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

Endereços locais:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
Health:   http://localhost:3001/health
```

Crie um arquivo `.env` dentro da pasta `backend` com as variáveis necessárias. O arquivo `.env` não deve ser enviado ao GitHub.

## Deploy

Consulte [DEPLOY_RENDER.md](DEPLOY_RENDER.md) e [MONITORAMENTO_LEADS.md](MONITORAMENTO_LEADS.md).
