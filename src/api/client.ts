/** Steam HTTP requests with bounded retries and request timeouts. */
import { getConfig } from "../config.js";
import { buildEndpointUrl, STEAM_STORE_BASE } from "./endpoints.js";
import type { SteamEndpoint } from "./endpoints.js";

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
  return delay + delay * Math.random() * 0.25;
}

export class SteamApiError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "SteamApiError";
  }
}

function isRetryable(statusCode: number): boolean {
  return statusCode === 429 || statusCode >= 500;
}

type QueryParams = Record<string, string | number | boolean>;

function addParams(url: URL, params: QueryParams): void {
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
}

async function request<T>(url: URL, label: string): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      // Fetch errors can contain the request URL, including the API key.
      throw new SteamApiError(`${label}: network request failed or timed out`);
    }
    if (response.ok) {
      return (await response.json()) as T;
    }
    const error = new SteamApiError(
      `${label}: HTTP ${response.status}`,
      response.status
    );
    // Release the response stream before retrying or returning an error.
    await response.body?.cancel();
    if (!isRetryable(response.status) || attempt === MAX_RETRIES) {
      throw error;
    }
    await sleep(calculateBackoff(attempt));
  }
  throw new SteamApiError(`${label}: retries exhausted`);
}

/** Request authenticated Steam Web API data. */
export async function steamApiRequest<T>(
  endpoint: SteamEndpoint,
  params: QueryParams = {}
): Promise<T> {
  const url = new URL(buildEndpointUrl(endpoint));
  url.searchParams.set("key", getConfig().apiKey);
  addParams(url, params);
  return request<T>(url, "Steam API");
}

/** Request public Steam Store data. */
export async function storeApiRequest<T>(
  path: string,
  params: QueryParams = {}
): Promise<T> {
  const url = new URL(`${STEAM_STORE_BASE}/${path}`);
  addParams(url, params);
  return request<T>(url, "Steam Store API");
}
