let scriptLoadingPromise: Promise<boolean> | null = null;

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return scriptLoadingPromise;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

