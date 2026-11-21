const BASE_URL = "https://api.webmaster.yandex.net/v4";

let cachedUserId: string | undefined;

async function webmasterRequest<T>(path: string): Promise<T> {
  const token = process.env.YANDEX_WEBMASTER_TOKEN;
  if (!token) throw new Error("YANDEX_WEBMASTER_TOKEN environment variable is not set.");

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `OAuth ${token}`, Accept: "application/json" },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Yandex Webmaster API error ${response.status}: ${details}`);
  }
  return response.json() as Promise<T>;
}

export async function getWebmasterUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const configuredId = process.env.YANDEX_WEBMASTER_USER_ID;
  if (configuredId) return (cachedUserId = configuredId);
  const user = await webmasterRequest<{ user_id: number | string }>("/user");
  return (cachedUserId = String(user.user_id));
}

export async function callWebmaster<T>(path: string): Promise<T> {
  const userId = await getWebmasterUserId();
  return webmasterRequest<T>(`/user/${encodeURIComponent(userId)}${path}`);
}
