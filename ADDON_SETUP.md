# 🎯 Anna's Archive Addon Setup Guide

Полный гайд по интеграции Anna's Archive addon в локальную разработку.

## 📋 Prerequisites

- Docker & Docker Compose (или Node.js 20+)
- Golden Library запущена локально на http://localhost:3000
- Codeberg репозиторий: https://codeberg.org/peterbaikov/js-adon

## 🚀 Quick Start

### 1. Запусти Anna's Archive Addon

**Самый простой способ (macOS/Linux):**
```bash
cd ../js-adon/addons/annas-archive
./run.sh
```

**Или вручную:**
```bash
cd ../js-adon/addons/annas-archive
PORT=5000 node server.mjs
```

**Или Docker:**
```bash
docker compose up --build
```

Сервер будет доступен на **http://localhost:5000**

Лог вывода:
```
Anna's Archive addon listening on http://localhost:5000/manifest.json
```

### 2. Установи Addon в Golden Library

1. Открой http://localhost:3000 (Golden Library)
2. Перейди на страницу `/addons`
3. **Новое!** В секции "Addon Library" нажми **Install** для "Anna's Archive"
   - Или скопируй URL в "Addon from Server": `http://localhost:5000/manifest.json`
4. Нажми **Continue**, проверь permissions, нажми **Install**

Статус: ✅ Установлен, включен

### 3. Используй на странице поиска

1. Открой страницу поиска книг
2. Выполни поиск (напр. "dune")
3. Results включат данные от Anna's Archive addon:
   - Книги найдены и показаны
   - Название, автор, описание из архива

## 🔧 Configuration

### Переключение Mirror

По умолчанию используется `https://annas-archive.org`. Поменять можно:

```bash
# Environment variable
ANNAS_ARCHIVE_URL=https://annas-archive.se docker-compose up

# Или отредактировать docker-compose.yml
```

Доступные mirrors:
- https://annas-archive.org
- https://annas-archive.se
- https://annas-archive.li
- https://annas-archive.gl

### Запуск без Docker

```bash
# Из js-adon/addons/annas-archive/
node server.mjs

# Дефолтный порт: 4301
# Для другого портаи:
PORT=4302 node server.mjs
```

## 📊 Architecture

```
Golden Library (http://localhost:3000)
    ↓ searches
Addon Registry
    ↓ installs from
Anna's Archive Addon (http://localhost:5000)
    ↓ proxies searches to
Anna's Archive Mirrors
    ↓ parses and returns
Book metadata + download links
```

## 🔍 Testing

### Check if addon is running

```bash
# Проверь, запущен ли сервер
curl http://localhost:5000/manifest.json | jq .

# Должен вернуться манифест
{
  "id": "annas-archive",
  "name": "Anna's Archive",
  "apiVersion": 1,
  "resources": ["catalog", "source"],
  ...
}
```

### Test search directly

```bash
# Поиск "dune"
curl 'http://localhost:5000/catalog/book/search/search=dune.json' | jq .
```

### Monitor logs

```bash
# Если запущено через docker-compose
docker-compose logs -f annas-archive-addon
```

## 🐛 Troubleshooting

### Addon не установился

1. Проверь URL в форме: `http://localhost:5000/manifest.json`
2. Убедись, что сервер запущен: `curl http://localhost:5000/manifest.json`
3. Посмотри на консоль браузера (F12) за CORS ошибками
4. Проверь, что Golden Library может достучаться до `localhost:5000`

### Поиск не возвращает результаты

1. Проверь, доступен ли Anna's Archive: `curl https://annas-archive.org` (может быть заблокирован)
2. Попробуй другой mirror через `ANNAS_ARCHIVE_URL`
3. Посмотри логи addon: `docker-compose logs annas-archive-addon`

### "Network error" при установке

- Docker контейнер не запущен или остановлен
- Проверь: `docker-compose ps`
- Перезапусти: `docker-compose restart`

### CORS ошибки в браузере

Это нормально для локального развития. Addon сервер отправляет необходимые CORS заголовки:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

## 📚 Resources

- [Golden Library Addon Protocol](../docs/addon-protocol.md)
- [js-adon Repository](https://codeberg.org/peterbaikov/js-adon)
- [Anna's Archive Addon README](../../../js-adon/addons/annas-archive/README.md)

## 🔗 Production Deployment

Для использования в production:

1. Деплой Anna's Archive addon на свой сервер или на Heroku/Railway/Fly.io
2. Обновить manifest URL в код или использовать production версию с Codeberg:
   ```
   https://codeberg.org/peterbaikov/js-adon/raw/main/addons/annas-archive/manifest.json
   ```

**Note:** Убедись, что сервер имеет доступ к Anna's Archive (может быть заблокирован в некоторых регионах).
