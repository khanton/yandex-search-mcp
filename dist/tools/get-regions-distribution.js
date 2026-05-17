import { z } from "zod";
import { callWordstat } from "../client.js";
export const getRegionsDistributionSchema = {
    phrase: z.string().describe("Ключевая фраза"),
    region: z
        .enum(["REGION_ALL", "REGION_CITIES", "REGION_REGIONS"])
        .default("REGION_ALL")
        .describe("Тип географической единицы: все / только города / только регионы"),
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
export async function getRegionsDistribution(params) {
    const { phrase, region, devices } = params;
    const body = { phrase, region };
    if (devices?.length)
        body.devices = devices;
    const data = await callWordstat("regions", body);
    if (!data?.length)
        return "Нет данных по регионам.";
    const sorted = [...data].sort((a, b) => Number(b.count) - Number(a.count));
    const lines = [
        `Распределение запросов "${phrase}" по регионам (${region})`,
        "",
        "Регион | Запросов | Доля | Affinity Index",
        "------ | -------- | ---- | --------------",
        ...sorted.map((r) => `${r.region} | ${r.count} | ${(r.share * 100).toFixed(4)}% | ${r.affinityIndex.toFixed(1)}`),
    ];
    return lines.join("\n");
}
