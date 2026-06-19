# Monitoramento de primeira resposta da MARIA

## O que é medido

```text
Tempo de resposta = horário da primeira mensagem da MARIA
                  - horário da primeira mensagem do cliente
```

O sistema não encerra conversas. Os termos “aguardando” e “tempo calculado” são apenas estados da medição local.

## Fluxo

1. O SM Click envia um `new-chat`.
2. O sistema cria uma medição com o horário da primeira mensagem do cliente.
3. O cronômetro aparece na página **Monitoramento**.
4. Eventos de robôs e de outros atendentes são ignorados.
5. Quando chega a primeira mensagem identificada como enviada por `MARIA`, o tempo é calculado e gravado.
6. Mensagens posteriores não modificam o resultado.

## URL

```text
POST /api/webhook/smclick
```

Compatibilidade:

```text
POST /api/webhook
```

## Resultados exibidos nos logs

| Resultado | Significado |
|---|---|
| `customer_first_message_recorded` | Primeiro horário do cliente registrado |
| `first_maria_message_measured` | Primeira mensagem da MARIA encontrada e tempo calculado |
| `ignored_other_attendant` | Mensagem enviada por outro atendente |
| `ignored_attendant_not_identified` | O payload não informou o nome do atendente |
| `ignored_duplicate_or_existing_chat` | Webhook duplicado ou conversa já registrada |
| `ignored_already_measured` | A medição já possuía a primeira mensagem da MARIA |
| `ignored_no_waiting_measurement` | Chegou mensagem da MARIA sem medição aberta correspondente |
| `ignored_unrelated_event` | Evento não reconhecido como nova conversa ou mensagem |
| `ignored_no_phone` | O payload não continha o telefone do cliente |

## Teste manual do endpoint

Estes payloads servem apenas para testar o comportamento do sistema. Não representam uma garantia do formato exato enviado pelo SM Click.

### 1. Simular a primeira mensagem do cliente

```powershell
$body = @{
  event = "new-chat"
  id = "teste-cliente-001"
  chatId = "conversa-teste-001"
  phone = "5543999999999"
  name = "Cliente Teste"
  text = "Olá, gostaria de informações"
  timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://SEU-SERVICO.onrender.com/api/webhook/smclick" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 2. Simular a primeira mensagem da MARIA

Execute alguns segundos depois:

```powershell
$body = @{
  event = "message-sent"
  id = "teste-maria-001"
  chatId = "conversa-teste-001"
  to = "5543999999999"
  fromMe = $true
  attendant = @{
    name = "MARIA"
  }
  text = "Olá! Como posso ajudar?"
  timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "https://SEU-SERVICO.onrender.com/api/webhook/smclick" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

A página deve mudar de **Aguardando MARIA** para **Tempo calculado**.

## Conferência do payload real

Na página **Monitoramento → Logs do Webhook**, abra **Inspecionar payload**. Confira principalmente:

- tipo do evento;
- telefone do cliente;
- campo que identifica mensagem de saída;
- nome do atendente;
- horário do evento;
- ID da conversa.

Se o log mostrar `ignored_attendant_not_identified`, o payload real não trouxe o nome da atendente em um dos campos já suportados. O JSON bruto fica salvo para permitir o ajuste preciso do parser.
