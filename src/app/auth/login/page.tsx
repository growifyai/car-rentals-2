import Link from "next/link";

import { AuthContent } from "./auth-content";

export const metadata = {
  title: "Login or Register | Zion Car Rentals",
  description: "Access your Zion Car Rentals account or create a new one to manage bookings and payments.",
};

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" aria-hidden />

      <header className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white">
            Z
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold text-foreground">Zion Car Rentals</span>
            <span className="text-sm text-muted-foreground">Luxury Cars, Seamless Booking</span>
          </div>
        </Link>

        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage bookings, track payments, and enjoy a seamless rental experience.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur">
            <AuthContent />
          </div>
        </div>
      </main>
    </div>
  );
}

