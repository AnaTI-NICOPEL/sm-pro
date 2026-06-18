# Monitoramento de primeira resposta da MARIA

## O que é medido

```text
Tempo de resposta = horário da primeira mensagem da MARIA
                  - horário do new-chat (primeira mensagem do cliente)
```

O sistema não encerra conversas. Os termos "aguardando" e "tempo calculado" são apenas estados da medição local.

## Fluxo

1. O SM Click envia um `new-chat`.
2. O sistema salva o `chat.id` e o horário como início da medição.
3. O cronômetro aparece na página **Monitoramento**.
4. Eventos com `from_me = false` (mensagens do cliente) são ignorados.
5. Eventos com `from_me = true` de outros atendentes são ignorados.
6. Quando chega um `new-chat-message` com `sent_by.name = MARIA` e `from_me = true`, o tempo é calculado e gravado.
7. Mensagens posteriores não modificam o resultado.

## URL do webhook

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
| `new_chat_registered` | Chat registrado e cronômetro iniciado |
| `first_maria_message_measured` | Primeira mensagem da MARIA encontrada e tempo calculado |
| `ignored_client_message` | Mensagem new-chat-message com from_me=false (cliente) |
| `ignored_other_attendant:<nome>` | Mensagem enviada por outro atendente |
| `ignored_attendant_not_identified` | O payload não informou o nome do atendente |
| `ignored_duplicate_or_existing_chat` | Webhook duplicado ou conversa já registrada |
| `ignored_already_measured` | A medição já possuía a primeira mensagem da MARIA |
| `ignored_no_waiting_measurement` | Chegou mensagem da MARIA sem medição aberta correspondente |
| `ignored_no_phone_or_chat_id` | O payload não continha telefone nem chat.id |
| `ignored_unrelated_event` | Evento não reconhecido (não é new-chat nem new-chat-message) |

## Teste manual do endpoint (formato real do SM Click)

> **Importante:** O SM Click envia os dados dentro de `infos.chat` e `infos.message`.
> Os scripts abaixo usam o mesmo formato dos webhooks reais.

### 1. Simular o evento new-chat (entrada do cliente)

```powershell
$body = @{
  event = "new-chat"
  infos = @{
    chat = @{
      id = "conversa-teste-001"
      contact = @{
        name = "Cliente Teste"
        telephone = "5543999999999"
      }
      last_message = @{
        from_me = $false
        content = @{ text = "Ola, gostaria de informacoes" }
      }
    }
  }
  event_time = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://SEU-SERVICO.onrender.com/api/webhook/smclick" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resultado esperado: `new_chat_registered`

---

### 2. Simular mensagem da MARIA (alguns segundos depois)

```powershell
$body = @{
  event = "new-chat-message"
  infos = @{
    chat = @{
      id = "conversa-teste-001"
      contact = @{
        name = "Cliente Teste"
        telephone = "5543999999999"
      }
    }
    message = @{
      from_me = $true
      sent_by = @{
        name  = "Maria"
        email = "maria@nicopel.com.br"
      }
      content = @{
        text          = "*Maria*:`n`noii"
        original_text = "oii"
      }
    }
  }
  event_time = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://SEU-SERVICO.onrender.com/api/webhook/smclick" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resultado esperado: `first_maria_message_measured`

A página deve mudar de **Aguardando MARIA** para **Tempo calculado**.

---

### 3. Simular mensagem de outro atendente (deve ser ignorada)

```powershell
$body = @{
  event = "new-chat-message"
  infos = @{
    chat = @{
      id = "conversa-teste-001"
      contact = @{ telephone = "5543999999999" }
    }
    message = @{
      from_me = $true
      sent_by = @{ name = "Derciel" }
      content = @{ original_text = "Oi!" }
    }
  }
  event_time = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffzzz")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://SEU-SERVICO.onrender.com/api/webhook/smclick" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resultado esperado: `ignored_other_attendant:Derciel`

---

## Conferência do payload real

Na página **Monitoramento → Logs do Webhook**, abra **Inspecionar payload**. Confira principalmente:

- `event` → deve ser `new-chat` ou `new-chat-message`
- `infos.chat.id` → ID único da conversa (usado para cruzar os dois eventos)
- `infos.chat.contact.telephone` → telefone do cliente
- `infos.message.from_me` → `true` = enviado pela empresa
- `infos.message.sent_by.name` → nome do atendente
- `event_time` → horário do evento

Se o log mostrar `ignored_attendant_not_identified`, o campo `infos.message.sent_by.name` está vazio no payload real.
Se o log mostrar `ignored_no_waiting_measurement`, o evento `new-chat` deste chat não foi recebido antes.

## Checklist de troubleshooting

- [ ] O Render foi redeployado após o último commit?
- [ ] O webhook está configurado no SM Click para `https://SEU-SERVICO.onrender.com/api/webhook/smclick`?
- [ ] A variável `LEAD_MONITOR_ATTENDANT=MARIA` está configurada no Render?
- [ ] O serviço Render está acordado? (free tier dorme após 15 min de inatividade)
- [ ] Os logs do webhook mostram algum resultado nos eventos recebidos?
