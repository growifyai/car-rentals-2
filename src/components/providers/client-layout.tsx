"use client";
import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
