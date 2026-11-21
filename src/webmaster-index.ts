#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { callWebmaster } from "./webmaster-client.js";
import { getTop, getTopSchema } from "./tools/get-top.js";
import { getDynamics, getDynamicsSchema } from "./tools/get-dynamics.js";
import { getRegionsDistribution, getRegionsDistributionSchema } from "./tools/get-regions-distribution.js";
import { getRegionTree } from "./tools/get-region-tree.js";

const server = new McpServer({ name: "yandex-webmaster", version: "1.0.0" });

const hostSchema = { hostId: z.string().min(1).describe("ID сайта из yandex_webmaster_list_sites") };

server.tool("yandex_webmaster_list_sites", "Список сайтов, добавленных в Яндекс Вебмастер", {}, async () => {
  const result = await callWebmaster("/hosts");
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("yandex_webmaster_site_summary", "Сводка индексирования сайта: ИКС, страницы в поиске и исключенные страницы", hostSchema, async ({ hostId }) => {
  const result = await callWebmaster(`/hosts/${encodeURIComponent(hostId)}/summary`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("yandex_webmaster_site_diagnostics", "Диагностика проблем сайта в Яндекс Вебмастере", hostSchema, async ({ hostId }) => {
  const result = await callWebmaster(`/hosts/${encodeURIComponent(hostId)}/diagnostics`);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool(
  "yandex_webmaster_popular_queries",
  "Популярные поисковые запросы сайта за последнюю неделю или указанный период",
  {
    hostId: hostSchema.hostId,
    orderBy: z.enum(["TOTAL_SHOWS", "TOTAL_CLICKS"]).default("TOTAL_SHOWS"),
    limit: z.number().int().min(1).max(500).default(100),
    offset: z.number().int().min(0).default(0),
    dateFrom: z.string().optional().describe("Дата начала YYYY-MM-DD"),
    dateTo: z.string().optional().describe("Дата окончания YYYY-MM-DD"),
    deviceType: z.enum(["ALL", "DESKTOP", "MOBILE_AND_TABLET", "MOBILE", "TABLET"]).default("ALL"),
  },
  async ({ hostId, orderBy, limit, offset, dateFrom, dateTo, deviceType }) => {
    const query = new URLSearchParams({ order_by: orderBy, limit: String(limit), offset: String(offset), device_type_indicator: deviceType });
    if (dateFrom) query.set("date_from", dateFrom);
    if (dateTo) query.set("date_to", dateTo);
    const result = await callWebmaster(`/hosts/${encodeURIComponent(hostId)}/search-queries/popular?${query}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool("wordstat_get_top", "Топ запросов по ключевой фразе за последние 30 дней", getTopSchema, async (params) => {
  const result = await getTop(params as z.infer<z.ZodObject<typeof getTopSchema>>);
  return { content: [{ type: "text", text: result }] };
});

server.tool("wordstat_get_dynamics", "Динамика частоты запросов по ключевой фразе", getDynamicsSchema, async (params) => {
  const result = await getDynamics(params as z.infer<z.ZodObject<typeof getDynamicsSchema>>);
  return { content: [{ type: "text", text: result }] };
});

server.tool("wordstat_get_regions_distribution", "Распределение запросов по регионам", getRegionsDistributionSchema, async (params) => {
  const result = await getRegionsDistribution(params as z.infer<z.ZodObject<typeof getRegionsDistributionSchema>>);
  return { content: [{ type: "text", text: result }] };
});

server.tool("wordstat_get_region_tree", "Список регионов и их ID", {}, async () => {
  const result = await getRegionTree();
  return { content: [{ type: "text", text: result }] };
});

await server.connect(new StdioServerTransport());
