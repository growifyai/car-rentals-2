"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu, X, User, Settings } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./notification-bell";
import { UpdatesIcon } from "./updates-icon";
import { getApiBaseUrl } from "@/lib/env";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const logoUrl = `${getApiBaseUrl()}/uploads/logo.png`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
          <img 
            src={logoUrl} 
            alt="Zion Car Rentals" 
            className="w-10 h-10 rounded-lg object-contain"
            onError={(e) => {
              // Fallback to Z letter if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.insertAdjacentHTML('afterbegin', '<div class="flex w-10 h-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white">Z</div>');
            }}
          />
          <div className="leading-tight">
            <span className="block text-lg font-semibold text-foreground">Zion Car Rentals</span>
            <span className="text-sm text-muted-foreground">Luxury Cars, Seamless Booking</span>
          </div>
        </Link>

        <nav className="hidden items-center space-x-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href.replace(/#.*/, ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center space-x-3 md:flex">
          {user ? (
            <>
              <UpdatesIcon />
              <NotificationBell />
            </>
          ) : null}
          {user?.role === "admin" && (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/dashboard">
                <Settings className="size-4 mr-2" />
                Admin Dashboard
              </Link>
            </Button>
          )}
          {user ? (
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/profile">
                <User className="size-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Login / Register</Link>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="outline" onClick={() => setIsMenuOpen(false)}>
              <Link href="/cars">Book a Car</Link>
            </Button>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button asChild variant="outline" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/admin/dashboard">
                      <Settings className="size-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild onClick={() => setIsMenuOpen(false)}>
                <Link href="/auth/login">Login / Register</Link>
              </Button>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

