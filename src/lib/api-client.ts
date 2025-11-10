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
}

export async function apiFetch<TResponse>(path: string, options: FetchOptions = {}): Promise<TResponse> {
  const { token, json, isFormData, headers, ...rest } = options;
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

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body,
      cache: rest.cache ?? "no-store",
      mode: "cors",
      credentials: "omit",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const message = isJson && payload && typeof payload.error === "string"
        ? payload.error
        : response.statusText || "Request failed";
      throw buildError(response.status, message, payload);
    }

    return (payload ?? {}) as TResponse;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw buildError(0, "Network error: Unable to connect to the server. Please check your internet connection.", error);
    }
    throw error;
  }
}

