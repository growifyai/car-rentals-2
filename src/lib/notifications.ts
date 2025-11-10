import { apiFetch } from "./api-client";

export interface NotificationItem {
  _id: string;
  message: string;
  type: "booking_update" | "payment" | "general";
  read: boolean;
  createdAt: string;
  bookingId?: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
}

export async function fetchNotifications(token: string) {
  const data = await apiFetch<NotificationsResponse>("/api/notifications", { token });
  return data.notifications;
}

export async function markNotificationRead(notificationId: string, token: string) {
  return apiFetch<{ message: string }>(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    token,
  });
}

export async function markAllNotificationsRead(token: string) {
  return apiFetch<{ message: string }>("/api/notifications/read-all", {
    method: "PUT",
    token,
  });
}

