"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Bell } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { fetchNotifications, type NotificationItem } from "@/lib/notifications";

export function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const items = await fetchNotifications(token);
        setNotifications(items);
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token]);

  if (!token) {
    return null;
  }

  return (
    <Button asChild variant="ghost" size="sm" className="h-auto">
      <Link href="/notifications" className="flex items-center gap-2 px-2 py-1.5">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="flex min-w-[20px] h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground px-1.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}

