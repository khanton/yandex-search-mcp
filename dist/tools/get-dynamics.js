import { z } from "zod";
import { callWordstat } from "../client.js";
export const getDynamicsSchema = {
    phrase: z.string().describe("Ключевая фраза"),
    period: z
        .enum(["PERIOD_DAILY", "PERIOD_WEEKLY", "PERIOD_MONTHLY"])
        .describe("Период группировки: ежедневно, еженедельно, ежемесячно"),
    fromDate: z
        .string()
        .describe("Начало периода в формате RFC3339, например 2025-01-01T00:00:00Z"),
    toDate: z
        .string()
        .optional()
        .describe("Конец периода (RFC3339). Для monthly — последний день месяца, для weekly — воскресенье"),
    regions: z
        .array(z.string())
        .optional()
        .describe("ID регионов"),
    devices: z
        .array(z.enum([
        "DEVICE_ALL",
        "DEVICE_DESKTOP",
        "DEVICE_PHONE",
        "DEVICE_TABLET",
    ]))
        .optional()
        .describe("Фильтр по типу устройства"),
};
export async function getDynamics(params) {
    const { phrase, period, fromDate, toDate, regions, devices } = params;
    const body = { phrase, period, fromDate };
    if (toDate)
        body.toDate = toDate;
    if (regions?.length)
        body.regions = regions;
    if (devices?.length)
        body.devices = devices;
    const data = await callWordstat("dynamics", body);
    if (!data.results?.length)
        return "Нет данных за указанный период.";
    const lines = [
        `Динамика запросов для "${phrase}" (${period})`,
        "",
        "Дата | Запросов | Доля от всех запросов Яндекса",
        "---- | -------- | -----------------------------",
        ...data.results.map((r) => `${r.date.slice(0, 10)} | ${r.count} | ${(r.share * 100).toFixed(6)}%`),
    ];
    return lines.join("\n");
}
