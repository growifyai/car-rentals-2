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
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/notifications">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}

