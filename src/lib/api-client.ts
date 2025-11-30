import { getApiBaseUrl } from "./env";

export interface ApiClientError extends Error {
  status: number;
  details?: unknown;
}

function buildError(status: number, message: string, details?: unknown): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.status = status;
  error.details = details;
  return error;
}

export interface FetchOptions extends RequestInit {
  token?: string | null;
  json?: unknown;
  isFormData?: boolean;
  timeoutMs?: number;
  retries?: number;
}

export async function apiFetch<TResponse>(path: string, options: FetchOptions = {}): Promise<TResponse> {
  const {
    token,
    json,
    isFormData,
    headers,
    timeoutMs = 30000, // Increased to 30 seconds for better reliability
    retries = 1,
    ...rest
  } = options;
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const requestHeaders = new Headers(headers ?? {});

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined = rest.body ?? undefined;
  let finalIsFormData = isFormData;

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
    finalIsFormData = false;
  }

  if (!finalIsFormData && body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let attempt = 0;
  // Simple retry with fixed backoff
  // Only retries on network-like failures and 5xx responses
  // Avoid changing functionality for successful requests
  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
        body,
        cache: rest.cache ?? "no-store",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json().catch(() => ({})) : await response.text();

      if (!response.ok) {
        const message = isJson && payload && typeof (payload as any).error === "string"
          ? (payload as any).error
          : response.statusText || "Request failed";
        // Retry only on 5xx
        if (response.status >= 500 && attempt < retries) {
          attempt += 1;
          await new Promise(r => setTimeout(r, 300 + attempt * 200));
          continue;
        }
        throw buildError(response.status, message, payload);
      }

      return (payload ?? {}) as TResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isAbort = message.includes("aborted") || message.includes("The user aborted a request");
      const isHeadersTimeout = message.includes("Headers Timeout") || message.includes("UND_ERR_HEADERS_TIMEOUT");
      const isNetworkFetchError = error instanceof TypeError && message.includes("fetch");

      if ((isAbort || isHeadersTimeout || isNetworkFetchError) && attempt < retries) {
        attempt += 1;
        await new Promise(r => setTimeout(r, 300 + attempt * 200));
        continue;
      }

      if (isNetworkFetchError) {
        throw buildError(0, "Network error: Unable to connect to the server. Please check your internet connection.", error);
      }
      
      // Handle aborted signals with better error message
      if (isAbort) {
        throw buildError(0, `Request timeout: The server took too long to respond (${timeoutMs}ms). Please check if the backend server is running on ${baseUrl}`, error);
      }
      
      throw error;
    }
  }
}

