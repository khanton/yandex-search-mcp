# Yandex Wordstat MCP Server

MCP сервер для доступа к Yandex Wordstat через [Yandex Search API](https://aistudio.yandex.ru/docs/ru/search-api/).

## Инструменты

| Инструмент | Описание |
|-----------|----------|
| `wordstat_get_top` | Топ запросов по фразе за 30 дней |
| `wordstat_get_dynamics` | Динамика частоты запросов |
| `wordstat_get_regions_distribution` | Распределение по регионам |
| `wordstat_get_region_tree` | Список регионов с ID |

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
