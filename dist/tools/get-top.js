import { z } from "zod";
import { callWordstat } from "../client.js";
export const getTopSchema = {
    phrase: z.string().describe("Ключевая фраза (до 400 символов)"),
    numPhrases: z
        .number()
        .int()
        .min(1)
        .max(2000)
        .default(20)
        .describe("Количество результатов (1–2000, по умолчанию 20)"),
    regions: z
        .array(z.string())
        .optional()
        .describe('ID регионов (из wordstat_get_region_tree), например ["213"]'),
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
export async function getTop(params) {
    const { phrase, numPhrases, regions, devices } = params;
    const body = { phrase, numPhrases };
    if (regions?.length)
        body.regions = regions;
    if (devices?.length)
        body.devices = devices;
    const data = await callWordstat("topRequests", body);
    const lines = [
        `Всего запросов: ${data.totalCount}`,
        "",
        "## Топ запросов",
        ...data.results.map((r, i) => `${i + 1}. "${r.phrase}" — ${r.count}`),
    ];
    if (data.associations?.length) {
        lines.push("", "## Ассоциации");
        lines.push(...data.associations.map((r, i) => `${i + 1}. "${r.phrase}" — ${r.count}`));
    }
    return lines.join("\n");
}
