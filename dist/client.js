const BASE_URL = "https://searchapi.api.cloud.yandex.net/v2/wordstat";
const WEB_SEARCH_URL = "https://searchapi.api.cloud.yandex.net/v2/web/searchAsync";
const OPERATIONS_URL = "https://operation.api.cloud.yandex.net/operations/";
function getAuthHeader() {
    const iam = process.env.YANDEX_IAM_TOKEN;
    const api = process.env.YANDEX_API_TOKEN;
    if (iam)
        return `Bearer ${iam}`;
    if (api)
        return `Api-Key ${api}`;
    throw new Error("No auth token set. Provide YANDEX_IAM_TOKEN or YANDEX_API_TOKEN.");
}
function getFolderId() {
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!folderId)
        throw new Error("YANDEX_FOLDER_ID env variable is not set.");
    return folderId;
}
export async function callWordstat(path, body) {
    const url = `${BASE_URL}/${path}`;
    const payload = { ...body, folderId: getFolderId() };
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuthHeader(),
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Yandex API error ${response.status}: ${text}`);
    }
    return response.json();
}
export async function callWebSearch(body) {
    const payload = { ...body, folderId: getFolderId() };
    const authHeader = getAuthHeader();
    const initResp = await fetch(WEB_SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify(payload),
    });
    if (!initResp.ok) {
        const text = await initResp.text();
        throw new Error(`Yandex Search API error ${initResp.status}: ${text}`);
    }
    const opData = (await initResp.json());
    if (!opData.id)
        throw new Error(`No operation ID in response: ${JSON.stringify(opData)}`);
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1_000));
        const pollResp = await fetch(OPERATIONS_URL + opData.id, {
            headers: { Authorization: authHeader },
        });
        if (!pollResp.ok)
            continue;
        const result = (await pollResp.json());
        if (result.done) {
            const rawData = result.response?.rawData;
            if (!rawData)
                throw new Error("Operation done but rawData is empty");
            return Buffer.from(rawData, "base64").toString("utf-8");
        }
    }
    throw new Error("Timeout: search operation did not complete in 30 seconds");
}
