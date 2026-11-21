# Yandex Wordstat MCP Server

MCP сервер для доступа к Yandex Wordstat через [Yandex Search API](https://aistudio.yandex.ru/docs/ru/search-api/).

## Инструменты

| Инструмент | Описание |
|-----------|----------|
| `wordstat_get_top` | Топ запросов по фразе за 30 дней |
| `wordstat_get_dynamics` | Динамика частоты запросов |
| `wordstat_get_regions_distribution` | Распределение по регионам |
| `wordstat_get_region_tree` | Список регионов с ID |

## Yandex Webmaster MCP

MCP-сервер для API Яндекс Вебмастера и Wordstat. Wordstat API доступен в этом же сервере; отдельный `yandex-wordstat` MCP при этом можно не подключать. Доступные инструменты Webmaster:

- `yandex_webmaster_list_sites` — сайты пользователя;
- `yandex_webmaster_site_summary` — сводка индексирования и ИКС;
- `yandex_webmaster_site_diagnostics` — диагностика сайта;
- `yandex_webmaster_popular_queries` — популярные запросы (до 500 за вызов).

В этом же сервере доступны инструменты Wordstat: `wordstat_get_top`, `wordstat_get_dynamics`, `wordstat_get_regions_distribution` и `wordstat_get_region_tree`. Для них дополнительно настройте `YANDEX_FOLDER_ID` и один из токенов `YANDEX_IAM_TOKEN` / `YANDEX_API_TOKEN` (подробности — в разделе переменных окружения ниже).

### Как получить `YANDEX_WEBMASTER_TOKEN`

1. Войдите в аккаунт Яндекса, у которого есть доступ к нужным сайтам в Вебмастере.
2. Откройте [создание приложения в Яндекс OAuth](https://oauth.yandex.ru/client/new).
3. Задайте любое название, в разделе платформ выберите **Веб-сервисы**, а в поле **Redirect URI** укажите `https://oauth.yandex.ru/verification_code`.
4. В разделе доступа к данным добавьте разрешения **webmaster:hostinfo** и **webmaster:verify**, затем создайте приложение.
5. Скопируйте **ClientID** приложения и откройте в браузере ссылку, подставив его вместо `<CLIENT_ID>`:

   ```text
   https://oauth.yandex.ru/authorize?response_type=token&client_id=<CLIENT_ID>
   ```

6. Подтвердите доступ. Яндекс покажет авторизационный токен — скопируйте его. Это и есть значение `YANDEX_WEBMASTER_TOKEN` (не ClientID).
7. Сохраните токен в окружении MCP. Не публикуйте его и не добавляйте настоящий токен в Git. По документации токен действует 6 месяцев; для получения нового откройте ссылку авторизации повторно.

Подробности — в [официальной инструкции Яндекса](https://yandex.ru/dev/webmaster/doc/ru/tasks/how-to-get-oauth.md).

ID пользователя сервер получает автоматически; при необходимости его можно задать через `YANDEX_WEBMASTER_USER_ID`.

После сборки сервер запускается командой `npm run start:webmaster`. Пример настройки в `.mcp.json`:

```json
"yandex-webmaster": {
  "command": "node",
  "args": ["dist/webmaster-index.js"],
  "env": {
    "YANDEX_WEBMASTER_TOKEN": "...",
    "YANDEX_FOLDER_ID": "...",
    "YANDEX_API_TOKEN": "..."
  }
}
```

Для инструментов сайта сначала вызовите список сайтов и передайте `host_id` в формате ответа.

## Установка

```bash
npm install
npm run build
```

## Настройка

### Переменные окружения

| Переменная | Обязательно | Описание |
|-----------|:-----------:|----------|
| `YANDEX_FOLDER_ID` | ✅ | ID папки в Yandex Cloud |
| `YANDEX_IAM_TOKEN` | ✅* | IAM-токен (`Bearer`) |
| `YANDEX_API_TOKEN` | ✅* | API-ключ (`Api-Key`) |

\* Требуется один из двух токенов. Если заданы оба — приоритет у IAM-токена.

Получить `YANDEX_FOLDER_ID` можно в [консоли Yandex Cloud](https://console.yandex.cloud/).

### Подключение в Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yandex-wordstat": {
      "command": "node",
      "args": ["/path/to/yandex-wordstat-mcp/dist/index.js"],
      "env": {
        "YANDEX_FOLDER_ID": "b1g...",
        "YANDEX_API_TOKEN": "AQVN..."
      }
    }
  }
}
```

### Подключение через `claude mcp add`

```bash
claude mcp add yandex-wordstat \
  -e YANDEX_FOLDER_ID=b1g... \
  -e YANDEX_API_TOKEN=AQVN... \
  -- node /path/to/dist/index.js
```

## Использование

### Топ запросов

```
wordstat_get_top(phrase="чат бот", numPhrases=10)
```

### Динамика по месяцам

```
wordstat_get_dynamics(
  phrase="чат бот",
  period="PERIOD_MONTHLY",
  fromDate="2025-01-01T00:00:00Z",
  toDate="2025-12-31T00:00:00Z"
)
```

### Распределение по городам

```
wordstat_get_regions_distribution(phrase="чат бот", region="REGION_CITIES")
```

### Список регионов

```
wordstat_get_region_tree()
```
