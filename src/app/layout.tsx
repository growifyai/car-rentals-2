import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Zion Car Rentals",
  description:
    "Luxury car rentals with seamless booking, secure payments, and end-to-end management for customers and admins.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

