"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getUnreadUpdatesCount } from "@/lib/updates";

export function UpdatesIcon() {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadUpdatesCount(token);
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to load unread count", error);
      }
    };

    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  if (!token) {
    return null;
  }

  return (
    <Button asChild variant="ghost" size="sm" className="h-auto">
      <Link href="/updates">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Megaphone className="size-5" />
          {unreadCount > 0 && (
            <span className="flex min-w-[20px] h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}

