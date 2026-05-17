#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTop, getTopSchema } from "./tools/get-top.js";
import { getDynamics, getDynamicsSchema } from "./tools/get-dynamics.js";
import { getRegionsDistribution, getRegionsDistributionSchema, } from "./tools/get-regions-distribution.js";
import { getRegionTree } from "./tools/get-region-tree.js";
import { webSearch, webSearchSchema } from "./tools/web-search.js";
const server = new McpServer({
    name: "yandex-wordstat",
    version: "1.0.0",
});
server.tool("wordstat_get_top", "Топ запросов по ключевой фразе за последние 30 дней (включая ассоциации)", getTopSchema, async (params) => {
    const result = await getTop(params);
    return { content: [{ type: "text", text: result }] };
});
server.tool("wordstat_get_dynamics", "Динамика изменения частоты запросов по ключевой фразе за выбранный период", getDynamicsSchema, async (params) => {
    const result = await getDynamics(params);
    return { content: [{ type: "text", text: result }] };
});
server.tool("wordstat_get_regions_distribution", "Распределение запросов по ключевой фразе по регионам за последние 30 дней", getRegionsDistributionSchema, async (params) => {
    const result = await getRegionsDistribution(params);
    return { content: [{ type: "text", text: result }] };
});
server.tool("wordstat_get_region_tree", "Список всех регионов и их ID для использования в других инструментах", {}, async () => {
    const result = await getRegionTree();
    return { content: [{ type: "text", text: result }] };
});
server.tool("search_web", "Текстовый поиск в Яндексе — возвращает список веб-страниц с заголовками и сниппетами", webSearchSchema, async (params) => {
    const result = await webSearch(params);
    return { content: [{ type: "text", text: result }] };
});
const transport = new StdioServerTransport();
await server.connect(transport);
