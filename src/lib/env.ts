export function getApiBaseUrl() {
  // Always use the production API URL as specified
  const productionUrl = "https://zion-car-rentals.onrender.com";
  
  if (typeof window === "undefined") {
    // Server-side: check environment variables first, fallback to production URL
    return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? productionUrl;
  }

  // Client-side: check environment variables first, fallback to production URL
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? productionUrl;
}

export function getRazorpayKeyId() {
  if (typeof window === "undefined") {
    return process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  }

  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

