export function getApiBaseUrl() {
  // Use local backend for testing
  const localUrl = "http://localhost:5000";
  
  if (typeof window === "undefined") {
    // Server-side: check environment variables first, fallback to local URL
    return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? localUrl;
  }

  // Client-side: check environment variables first, fallback to local URL
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? localUrl;
}

