import { z } from "zod";
import { callWebSearch } from "../client.js";

export const webSearchSchema = {
  query: z
    .string()
    .max(400)
    .describe("Текст поискового запроса (до 400 символов / 40 слов)"),
  numResults: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Количество результатов (1–100, по умолчанию 10)"),
  page: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Номер страницы (начиная с 0)"),
  searchType: z
    .enum(["SEARCH_TYPE_RU", "SEARCH_TYPE_COM_EN"])
    .default("SEARCH_TYPE_RU")
    .describe(
      "Тип поиска: SEARCH_TYPE_RU — Яндекс.ру, SEARCH_TYPE_COM_EN — международный"
    ),
  region: z
    .string()
    .optional()
    .describe('ID региона для гео-зависимых результатов (например "213" — Москва)'),
};

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSearchXml(xml: string): SearchResult[] {
  const results: SearchResult[] = [];
  const docRegex = /<doc[^>]*>([\s\S]*?)<\/doc>/g;
  let match: RegExpExecArray | null;

  while ((match = docRegex.exec(xml)) !== null) {
    const content = match[1];

    const urlMatch = /<url>([\s\S]*?)<\/url>/.exec(content);
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(content);
    const passageMatch = /<passage>([\s\S]*?)<\/passage>/.exec(content);

    const url = urlMatch ? stripTags(urlMatch[1]) : "";
    if (!url) continue;

    results.push({
      url,
      title: titleMatch ? stripTags(titleMatch[1]) : "",
      snippet: passageMatch ? stripTags(passageMatch[1]) : "",
    });
  }

  return results;
}

export async function webSearch(
  params: z.infer<z.ZodObject<typeof webSearchSchema>>
): Promise<string> {
  const { query, numResults, page, searchType, region } = params;

  const body: Record<string, unknown> = {
    query: {
      searchType,
      queryText: query,
      familyMode: "FAMILY_MODE_NONE",
      page,
    },
    sortSpec: {
      sortMode: "SORT_MODE_BY_RELEVANCE",
      sortOrder: "SORT_ORDER_DESC",
    },
    groupSpec: {
      groupMode: "GROUP_MODE_DEEP",
      groupsOnPage: numResults,
      docsInGroup: 1,
    },
    maxPassages: 2,
    l10N:
      searchType === "SEARCH_TYPE_COM_EN" ? "LOCALIZATION_EN" : "LOCALIZATION_RU",
  };

  if (region) body.region = region;

  const xml = await callWebSearch(body);
  const results = parseSearchXml(xml);

  if (!results.length) return "Результаты не найдены.";

  const lines: string[] = [`Результаты поиска: «${query}»`, ""];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    lines.push(`### ${i + 1}. ${r.title || r.url}`);
    lines.push(r.url);
    if (r.snippet) lines.push(`> ${r.snippet}`);
    lines.push("");
  }

  return lines.join("\n");
}
