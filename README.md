# SERGEEV — лендинг монтажёра

Одностраничное портфолио «страница = таймлайн»: брутальный монохром, гигантская типографика, видео как
главный контент. Next.js 16 (App Router) + TypeScript, Tailwind v4, GSAP + ScrollTrigger, Lenis.
RU/EN без i18n-библиотек, форма заявок → Telegram, Docker-образ для своего VPS.

## Быстрый старт

```bash
pnpm install
pnpm dev            # http://localhost:3000 → редирект на /ru или /en
pnpm check          # lint + typecheck + build
```

Нужны Node ≥ 24 и pnpm 12 (`npm i -g pnpm@12.5.1`).

## Где править контент

Всё, что меняет заказчик, — в `content/` (типы в `content/types.ts`, TS подсветит пропуски):

| Файл                               | Что там                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `content/site.ts`                  | домен, CDN, контакты (Telegram / WhatsApp / Instagram / Email), портрет, `showPrices`, число раундов правок       |
| `content/videos.ts`                | портфолио (порядок = порядок на сайте), `hero` — фон первого экрана и будущий шоурил, `intro` — видео в «Обо мне» |
| `content/data.ts`                  | услуги и цены (₽ для RU, $ для EN), шаги процесса, цифры, клиенты, манифест и факты «обо мне»                     |
| `i18n/dictionaries/ru.ts`, `en.ts` | UI-строки: меню, заголовки секций, подписи формы, meta. `en` обязан повторять форму `ru`                          |
| `public/portrait.jpg`              | портрет для дизеринг-графики в «Обо мне» (путь — `site.portrait`)                                                 |

Пути к видео и постерам — относительно `NEXT_PUBLIC_CDN_BASE` (так их кладёт `scripts/upload-cdn.sh`).
Подготовка роликов (сжатие, превью, постеры) — в [`scripts/README.md`](scripts/README.md).

## Переменные

| Переменная                                       | Когда читается | Назначение                       |
| ------------------------------------------------ | -------------- | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                           | **при сборке** | canonical, hreflang, OG, sitemap |
| `NEXT_PUBLIC_CDN_BASE`                           | **при сборке** | база для видео и постеров        |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_TOKEN_FILE` | в рантайме     | бот для заявок                   |
| `TELEGRAM_CHAT_ID` / `TELEGRAM_CHAT_ID_FILE`     | в рантайме     | куда слать заявки                |

`NEXT_PUBLIC_*` вшиваются в бандл → смена домена или CDN = пересборка. Секреты никогда не `NEXT_PUBLIC_`.
Секрет ищется так: `VAR` → `VAR_FILE` → `/run/secrets/<var>` → `/run/secrets/<VAR>` (`lib/secrets.ts`).

## Деплой (Docker)

Образ — `output: 'standalone'`, Node 24 alpine, пользователь `node`, `HEALTHCHECK` на `/api/health`,
порт 3000. HTTPS и домен даёт панель (Traefik), контейнер только отдаёт порт.

```bash
docker build -t sergeev-landing \
  --build-arg NEXT_PUBLIC_SITE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_CDN_BASE=https://cdn.example.com/sergeev .

# опциональные build-time секреты (приватный реестр, Sentry)
docker build --secret id=npmrc,src=$HOME/.npmrc --secret id=SENTRY_AUTH_TOKEN -t sergeev-landing .
```

### Вариант A — compose с file-secrets (Dokploy, голый VPS)

```bash
printf '%s' '<token>'   > secrets/telegram_bot_token
printf '%s' '<chat_id>' > secrets/telegram_chat_id
chmod 0444 secrets/*
docker compose up -d --build
docker compose ps        # web … (healthy)
```

- **Dokploy**: тип «Docker Compose», секреты — через _Advanced → Mounts → File Mount_ (`../files/telegram_bot_token`),
  раскомментировать `dokploy-network` в `compose.yaml`. `external: true` для секретов Dokploy не поддерживает.
- Локально с пробросом порта: `docker compose -f compose.yaml -f compose.local.yaml up -d --build`.

### Вариант B — Dockerfile + env из панели (Coolify)

Coolify не управляет compose `secrets:`. Создайте ресурс из Dockerfile и задайте в UI:

- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CDN_BASE` — **Build Variable: on**;
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — **Build Variable: off** (только рантайм);
- порт контейнера — `3000`, healthcheck — `/api/health`.

## Как устроено

- `proxy.ts` — `/` и любые пути без локали → `/ru` или `/en` (cookie `NEXT_LOCALE`, затем `Accept-Language`).
- `app/[locale]/layout.tsx` — корневой layout на локаль: шрифты, HUD, курсор, зерно, metadata с hreflang.
- `app/api/lead` — zod-валидация, honeypot, минимальное время заполнения 3 с, rate limit 5 заявок / 10 мин на IP
  (in-memory, одного инстанса достаточно), проверка `Origin`, отправка в Telegram (HTML, экранирование, ≤ 4096).
- Все анимации отключаются при `prefers-reduced-motion`; видео — только постеры.
- Pin-секции (hero, рейл шортов) и кастомный курсор — только на desktop с мышью (`@custom-variant desktop`
  в `globals.css` = `DESKTOP_MQ` в `lib/motion.ts`).

## Что нужно от заказчика

- mp4 (или исходники для сжатия) + порядок, названия, клиенты, хронометраж, просмотры;
- email (пока «coming soon») и домен;
- 2–3 предложения «о себе», факты (город, с какого года, софт);
- цены «от» по форматам (₽ и $) или решение их не показывать (`showPrices: false`);
- цифры (проекты, просмотры, лет) и список клиентов;
- токен бота от @BotFather и chat id — **только на VPS в `secrets/` или в панели, не в чат и не в git**.
