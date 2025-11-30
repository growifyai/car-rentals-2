export function getApiBaseUrl() {
  // Server-side: check environment variables
  if (typeof window === "undefined") {
    const url = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!url) {
      throw new Error(
        "API_BASE_URL or NEXT_PUBLIC_API_BASE_URL environment variable is required. " +
        "Please set it in your .env file. See .env.example for reference."
      );
    }
    return url;
  }

  // Client-side: check environment variables
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL environment variable is required. " +
      "Please set it in your .env file. See .env.example for reference."
    );
  }
  return url;
}

