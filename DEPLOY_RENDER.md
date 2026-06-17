# Deploy no Render

## 1. Tipo de serviço

Crie um **Web Service** com runtime **Docker**.

Configuração:

```text
Repository: AnaTI-NICOPEL/sistema-msg-atualizado
Branch: main
Root Directory: vazio
Dockerfile Path: ./Dockerfile
Docker Build Context: .
Health Check Path: /health
```

O frontend React fica em `frontend/` e é servido pelo backend Express em produção.

## 2. Variáveis de ambiente

Em **Environment**, configure:

```text
DATABASE_URL=string de conexão PostgreSQL/Neon
SMCLICK_API_KEY=chave da API do SM Click
LEAD_MONITOR_ATTENDANT=MARIA
LEAD_SESSION_WINDOW_HOURS=24
```

Não crie a variável `PORT`. O Render fornece essa variável automaticamente.

## 3. Banco SQLite

O sistema ainda usa SQLite nos módulos de agendamentos e logs de disparos. Para manter esses dados entre reinicializações, use um Persistent Disk montado em:

```text
/data
```

Os dados do monitoramento de leads ficam no PostgreSQL definido em `DATABASE_URL`.

## 4. Webhook no SM Click

Depois que o serviço estiver `Live`, use:

```text
https://SEU-SERVICO.onrender.com/api/webhook/smclick
```

O evento `new-chat` registra o primeiro horário. O endpoint também precisa receber os eventos de mensagens enviadas, pois é neles que o sistema procura a primeira mensagem da MARIA.

## 5. Publicação após atualizar o GitHub

No Render:

```text
Manual Deploy
→ Clear build cache & deploy
```

O uso de **Clear build cache** é importante porque o módulo nativo `sqlite3` é compilado dentro da imagem Debian usada pelo sistema.

## 6. Testes

Abra:

```text
https://SEU-SERVICO.onrender.com/health
```

Resultado esperado:

```json
{"status":"ok"}
```

Depois abra o domínio principal e entre em **Monitoramento**.
