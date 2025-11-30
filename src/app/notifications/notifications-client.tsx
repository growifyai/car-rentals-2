"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Calendar,
  CreditCard,
  Info,
  ExternalLink,
  Mail,
  MailOpen,
  Filter,
  Trash2
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification,
  type NotificationItem 
} from "@/lib/notifications";
import { toast } from "sonner";

type FilterType = "all" | "unread" | "read" | "booking_update" | "payment" | "general";

export function NotificationsClient() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("unread");
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Optimistic updates: immediately update UI, then sync with backend
  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;
    
    // Optimistic update - update UI immediately
    setNotifications(prev =>
      prev.map(item =>
        item._id === notificationId ? { ...item, read: true } : item
      )
    );
    setOptimisticUpdates(prev => new Set(prev).add(notificationId));

    // Sync with backend (fire and forget for speed)
    markNotificationRead(notificationId, token).catch((error) => {
      console.error("Failed to mark notification as read", error);
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(item =>
          item._id === notificationId ? { ...item, read: false } : item
        )
      );
      setOptimisticUpdates(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      toast.error("Failed to mark notification as read");
    });
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length === 0) return;

    // Optimistic update - mark all as read immediately
    setNotifications(prev =>
      prev.map(item => ({ ...item, read: true }))
    );
    setOptimisticUpdates(prev => new Set([...prev, ...unreadIds]));

    // Sync with backend
    markAllNotificationsRead(token).catch((error) => {
      console.error("Failed to mark all as read", error);
      // Revert on error
      setNotifications(prev =>
        prev.map(item => 
          unreadIds.includes(item._id) ? { ...item, read: false } : item
        )
      );
      setOptimisticUpdates(prev => {
        const next = new Set(prev);
        unreadIds.forEach(id => next.delete(id));
        return next;
      });
      toast.error("Failed to mark all notifications as read");
    });
  };

  const handleDelete = async (notificationId: string) => {
    if (!token) return;

    // Optimistic delete - remove from UI immediately
    const notification = notifications.find(n => n._id === notificationId);
    setNotifications(prev => prev.filter(item => item._id !== notificationId));
    setDeletingIds(prev => new Set(prev).add(notificationId));

    // Sync with backend
    try {
      await deleteNotification(notificationId, token);
      toast.success("Notification deleted");
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    } catch (error: unknown) {
      console.error("Failed to delete notification", error);
      // Revert on error - restore the notification
      if (notification) {
        setNotifications(prev => [...prev, notification].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      
      // Show specific error message
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number };
        if (apiError.status === 404) {
          toast.error("Delete endpoint not found. Please contact support.");
        } else if (apiError.status === 405) {
          toast.error("Delete method not allowed. The backend may not support deletion.");
        } else {
          const errorMsg = error instanceof Error ? error.message : "Failed to delete notification";
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = error instanceof Error ? error.message : "Failed to delete notification";
        toast.error(errorMsg);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!token) return;

    const notificationsToDelete = filteredNotifications;
    if (notificationsToDelete.length === 0) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${notificationsToDelete.length} notification(s)? This action cannot be undone.`)) {
      return;
    }

    const idsToDelete = notificationsToDelete.map(n => n._id);
    
    // Optimistic delete - remove from UI immediately
    setNotifications(prev => prev.filter(item => !idsToDelete.includes(item._id)));
    setDeletingIds(prev => new Set([...prev, ...idsToDelete]));

    // Delete all in parallel with better error handling
    const deletePromises = idsToDelete.map(id => 
      deleteNotification(id, token).catch((error) => {
        console.error(`Failed to delete notification ${id}:`, error);
        return { id, error };
      })
    );
    
    try {
      const results = await Promise.all(deletePromises);
      const errors = results.filter(r => r && 'error' in r);
      const successCount = idsToDelete.length - errors.length;
      
      if (errors.length > 0) {
        // Reload notifications on partial failure
        await loadNotifications();
        if (successCount > 0) {
          toast.success(`Deleted ${successCount} notification(s)`);
          toast.error(`Failed to delete ${errors.length} notification(s)`);
        } else {
          // All failed - check if it's a 404/405 (endpoint doesn't exist)
          const firstError = errors[0]?.error;
          if (firstError?.status === 404 || firstError?.status === 405) {
            toast.error("Delete endpoint not available. Please contact support.");
          } else {
            toast.error("Failed to delete notifications");
          }
        }
      } else {
        toast.success(`Deleted ${successCount} notification(s)`);
      }
      
      setDeletingIds(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      console.error("Failed to delete notifications", error);
      // Reload notifications on error
      await loadNotifications();
      toast.error("Failed to delete notifications");
    }
  };

  const loadNotifications = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const items = await fetchNotifications(token);
      // Sort by date: newest first
      const sorted = items.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
      // Clear optimistic updates after successful load
      setOptimisticUpdates(new Set());
    } catch (error) {
      console.error("Failed to load notifications", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  // Filter and categorize notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    switch (activeFilter) {
      case "unread":
        filtered = filtered.filter(n => !n.read);
        break;
      case "read":
        filtered = filtered.filter(n => n.read);
        break;
      case "booking_update":
      case "payment":
      case "general":
        filtered = filtered.filter(n => n.type === activeFilter);
        break;
      default:
        // "all" - no filter
        break;
    }

    return filtered;
  }, [notifications, activeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.read).length;
    const read = notifications.filter(n => n.read).length;
    const bookingUpdates = notifications.filter(n => n.type === "booking_update").length;
    const payments = notifications.filter(n => n.type === "payment").length;
    const general = notifications.filter(n => n.type === "general").length;

    return { unread, read, bookingUpdates, payments, general, total: notifications.length };
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_update":
        return <Calendar className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "payment":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
    });
  };

  const renderNotificationCard = (notification: NotificationItem) => {
    const isOptimistic = optimisticUpdates.has(notification._id);
    const isDeleting = deletingIds.has(notification._id);
    
    if (isDeleting) {
      return null; // Don't render if being deleted
    }
    
    return (
      <Card
        key={notification._id}
        className={`transition-all hover:shadow-md ${
          !notification.read 
            ? "border-l-4 border-l-primary bg-primary/5" 
            : "border-l-4 border-l-transparent opacity-75"
        } ${isOptimistic ? "animate-pulse" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} shrink-0`}>
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getNotificationColor(notification.type)}`}
                    >
                      {notification.type.replace("_", " ")}
                    </Badge>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${!notification.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {notification.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  {notification.bookingId && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Link href={`/bookings/${notification.bookingId}`}>
                        View Booking
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                  {!notification.read && (
                    <Button
                      onClick={() => handleMarkAsRead(notification._id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={isOptimistic}
                    >
                      {isOptimistic ? (
                        "Marking..."
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Mark as read
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(notification._id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center mb-6">
              Please log in to view your notifications
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {stats.unread > 0 
              ? `${stats.unread} unread notification${stats.unread > 1 ? 's' : ''}`
              : "All caught up!"}
          </p>
        </div>
        {stats.unread > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-primary">{stats.unread}</p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="text-2xl font-bold">{stats.read}</p>
              </div>
              <MailOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{stats.bookingUpdates}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">{stats.payments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full min-w-max">
            <TabsTrigger value="unread" className="flex items-center gap-1.5 whitespace-nowrap">
              <Mail className="h-4 w-4 shrink-0" />
              <span>Unread</span>
              {stats.unread > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">{stats.unread}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-1.5 whitespace-nowrap">
              <MailOpen className="h-4 w-4 shrink-0" />
              <span>Read</span>
              {stats.read > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{stats.read}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="booking_update" className="flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Bookings</span>
              {stats.bookingUpdates > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{stats.bookingUpdates}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1.5 whitespace-nowrap">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Payments</span>
              {stats.payments > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{stats.payments}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-1.5 whitespace-nowrap">
              <Info className="h-4 w-4 shrink-0" />
              <span>General</span>
              {stats.general > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{stats.general}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-1.5 whitespace-nowrap">
              <Filter className="h-4 w-4 shrink-0" />
              <span>All</span>
              {stats.total > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{stats.total}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeFilter} className="mt-6">
          {/* Delete All Button - Show for all sections except unread */}
          {activeFilter !== "unread" && filteredNotifications.length > 0 && !isLoading && (
            <div className="mb-4 flex justify-end">
              <Button
                onClick={handleDeleteAll}
                variant="destructive"
                size="sm"
                disabled={deletingIds.size > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All ({filteredNotifications.length})
              </Button>
            </div>
          )}
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeFilter === "unread" 
                    ? "No unread notifications" 
                    : activeFilter === "read"
                    ? "No read notifications"
                    : activeFilter === "booking_update"
                    ? "No booking notifications"
                    : activeFilter === "payment"
                    ? "No payment notifications"
                    : activeFilter === "general"
                    ? "No general notifications"
                    : "No notifications"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {activeFilter === "unread"
                    ? "You're all caught up! New notifications will appear here."
                    : activeFilter === "read"
                    ? "You haven't read any notifications yet."
                    : "You don't have any notifications in this category."}
                </p>
                {activeFilter !== "all" && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveFilter("all")}
                  >
                    View all notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(renderNotificationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
