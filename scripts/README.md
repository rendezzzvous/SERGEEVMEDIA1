# Медиа-скрипты

Видео не лежат в репозитории и не попадают в Docker-образ — только на CDN. Скрипты готовят файлы
в `out-media/` (в `.gitignore`) с той же структурой, что ожидает `content/videos.ts`:

```
out-media/
├── shorts/s01.mp4        # encode-shorts.sh   — 1080×1920, со звуком (лайтбокс)
├── long/l02.mp4          # encode-long.sh     — 1920×1080, со звуком (лайтбокс)
├── previews/s01.mp4      # encode-previews.sh — 640px, 8 с, без звука (автоплей/hover)
├── hero/showreel.mp4     # encode-hero.sh     — 1280px, 25 с, без звука (фон первого экрана)
└── posters/s01.jpg|webp  # posters.sh         — кадр-постер
```

Нужны `ffmpeg` и `rclone`:

```bash
brew install ffmpeg rclone
```

## Всё портфолио одной командой

```bash
PRESET=medium scripts/encode-portfolio.sh ~/Downloads/Видео
```

Список роликов (исходник → id, откуда брать превью и постер) — в начале `encode-portfolio.sh`; id совпадают
с `content/videos.ts`. Готовые файлы пропускаются, `ONLY=<id>` пересобирает один. Там же собирается hero:
пока нет шоурила — немой автомонтаж из трёх колонок вертикалок (`hero/montage.mp4`) и интро «Обо мне».

## Посмотреть локально без CDN

По умолчанию сайт берёт видео из R2. Чтобы смотреть свежесобранные файлы до заливки: `public/media` — ссылка
на `../out-media` (в git и Docker-образ не попадает), плюс `.env.local` с `NEXT_PUBLIC_CDN_BASE=/media`,
затем `pnpm dev`.

## Пример: один шорт

```bash
scripts/encode-shorts.sh   raw/barista.mov out-media/shorts/s01.mp4
scripts/encode-previews.sh raw/barista.mov out-media/previews/s01.mp4 3
scripts/posters.sh         out-media/shorts/s01.mp4 out-media/posters/s01
```

## Пример: шоурил в hero

```bash
scripts/encode-long.sh     raw/showreel.mov out-media/long/l01.mp4
scripts/encode-hero.sh     raw/showreel.mov out-media/hero/showreel.mp4
scripts/encode-previews.sh raw/showreel.mov out-media/previews/l01.mp4 12
scripts/posters.sh         out-media/long/l01.mp4 out-media/posters/l01 4
```

## Заливка в Cloudflare R2

```bash
npx wrangler login              # один раз
scripts/upload-r2.sh            # бакет sergeev-media → https://pub-be8d4a5abc704b2191aa35c87855b98e.r2.dev
```

Скрипт сам создаёт бакет и публичный r2.dev-URL, повторяет упавшие загрузки. Файлы крупнее ~50 МБ wrangler
заливает ненадёжно — см. «Большие файлы» ниже.

### Большие файлы

wrangler заливает объект одним запросом, и файлы крупнее ~60 МБ у нас падали с `fetch failed`. Поэтому
горизонтали кодируются с потолком 2,8 Мбит/с (2,5-минутный влог ≈ 56 МБ). Если ролик всё равно вышел больше —
заливайте его через rclone ниже: он режет файл на части (multipart).

## Заливка через rclone (любой S3)

```bash
RCLONE_REMOTE=r2:sergeev-media scripts/upload-cdn.sh
```

Потом в `.env` / build-args: `NEXT_PUBLIC_CDN_BASE=https://<ваш-cdn>/` и пересборка.

## Правила

- **Версионируйте имена** (`s01.v2.mp4`): файлы отдаются с `Cache-Control: immutable`, перезалив под тем же
  именем браузеры и CDN не увидят год.
- CDN должен отдавать `Content-Type: video/mp4` и поддерживать `Range`-запросы (R2, Bunny, S3 — умеют).
  CORS не нужен: `<video>` без `crossorigin`.
- Суммарный вес автоплея первого экрана — до ~3 MB (hero-фон + превью первых карточек).
- `-movflags +faststart` обязателен: без него браузер качает весь файл до первого кадра.

## 3D-портрет

Портрет в «Обо мне» — WebGL-рельеф по карте глубины `public/portrait-depth.png` (R — глубина, G — маска
силуэта). При замене `public/portrait.jpg` карту нужно пересобрать — инструкция в шапке
[`portrait-depth.mjs`](portrait-depth.mjs). Лучше всего работает фото анфас на светлом однотонном фоне.
