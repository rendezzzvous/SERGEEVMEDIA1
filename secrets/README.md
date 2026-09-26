# secrets/

Рантайм-секреты для `compose.yaml`. **Сами файлы в git не попадают** (`.gitignore`), лежат только на VPS.

```bash
printf '%s' '123456:ABC-DEF…' > secrets/telegram_bot_token   # токен от @BotFather
printf '%s' '-1001234567890'  > secrets/telegram_chat_id     # id чата/канала, куда слать заявки
chmod 0444 secrets/*
```

- `printf '%s'` — без перевода строки в конце (приложение всё равно делает `trim()`).
- `chmod 0444` обязателен: compose монтирует file-secret как bind mount и **не применяет** `uid/gid/mode`,
  а контейнер работает от пользователя `node` (uid 1000) — без права чтения получите `EACCES` и 503 на форме.
- Как узнать chat id: напишите боту что-нибудь (или добавьте его в группу) и откройте
  `https://api.telegram.org/bot<TOKEN>/getUpdates` — поле `chat.id`.

Приложение ищет каждый секрет по порядку: `VAR` → `VAR_FILE` → `/run/secrets/<var>` → `/run/secrets/<VAR>`
(см. `lib/secrets.ts`), так что вместо файлов можно задать обычные env-переменные в панели.
