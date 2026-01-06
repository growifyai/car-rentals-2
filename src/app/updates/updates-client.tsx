"use client";

import { useEffect, useState } from "react";
import { Megaphone, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  fetchUpdates,
  markUpdateAsRead,
  markAllUpdatesAsRead,
  type UpdateItem,
} from "@/lib/updates";
import { toast } from "sonner";

export function UpdatesClient() {
  const { token } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    loadUpdates();
  }, [token, router]);

  const loadUpdates = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUpdates(token);
      setUpdates(data);
    } catch (err: unknown) {
      console.error("Failed to load updates", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load updates";
      setError(errorMessage);
      toast.error("Failed to load updates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (updateId: string) => {
    if (!token) return;

    try {
      await markUpdateAsRead(updateId, token);
      setUpdates((prev) =>
        prev.map((update) =>
          update._id === updateId ? { ...update, read: true } : update
        )
      );
      toast.success("Update marked as read");
    } catch (error: unknown) {
      console.error("Failed to mark update as read", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to mark update as read";
      toast.error(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await markAllUpdatesAsRead(token);
      setUpdates((prev) => prev.map((update) => ({ ...update, read: true })));
      toast.success("All updates marked as read");
    } catch (error: unknown) {
      console.error("Failed to mark all updates as read", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to mark all updates as read";
      toast.error(errorMessage);
    }
  };

  const unreadCount = updates.filter((update) => !update.read).length;

  if (!token) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="size-8 text-primary" />
                Updates
              </h1>
              <p className="text-muted-foreground mt-2">
                Stay informed about the latest announcements and site updates.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                <Check className="size-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading updates...
            </div>
          ) : updates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Megaphone className="size-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No updates available</p>
                <p className="text-sm mt-2">
                  Check back later for new announcements.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <Card
                  key={update._id}
                  className={`transition-all hover:shadow-md ${
                    !update.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{update.title}</CardTitle>
                          {!update.read && (
                            <Badge variant="default" className="bg-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(update.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      {!update.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(update._id)}
                        >
                          <Check className="size-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">
                      {update.message}
                    </p>
                    {update.expiryDate && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Expires:{" "}
                        {new Date(update.expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

