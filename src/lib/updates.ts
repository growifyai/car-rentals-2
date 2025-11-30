import { apiFetch } from "./api-client";

export interface UpdateItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  expiryDate?: string | null;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  read?: boolean;
  active?: boolean;
}

interface UpdatesResponse {
  updates: UpdateItem[];
}

interface UnreadCountResponse {
  unreadCount: number;
}

export async function fetchUpdates(token: string): Promise<UpdateItem[]> {
  const data = await apiFetch<UpdatesResponse>("/api/updates", { token });
  return data.updates;
}

export async function getUnreadUpdatesCount(token: string): Promise<number> {
  const data = await apiFetch<UnreadCountResponse>("/api/updates/unread-count", { token });
  return data.unreadCount;
}

export async function markUpdateAsRead(updateId: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/updates/${updateId}/read`, {
    method: "PUT",
    token,
  });
}

export async function markAllUpdatesAsRead(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/updates/read-all", {
    method: "PUT",
    token,
  });
}

// Admin functions
export interface CreateUpdatePayload {
  title: string;
  message: string;
  active?: boolean;
  expiryDate?: string | null;
}

export interface UpdatePayload {
  title?: string;
  message?: string;
  active?: boolean;
  expiryDate?: string | null;
}

export async function fetchAdminUpdates(token: string): Promise<UpdateItem[]> {
  const data = await apiFetch<UpdatesResponse>("/api/admin/updates", { token });
  return data.updates;
}

export async function createUpdate(payload: CreateUpdatePayload, token: string): Promise<{ message: string; update: UpdateItem }> {
  return apiFetch<{ message: string; update: UpdateItem }>("/api/admin/updates", {
    method: "POST",
    json: payload,
    token,
  });
}

export async function updateUpdate(updateId: string, payload: UpdatePayload, token: string): Promise<{ message: string; update: UpdateItem }> {
  return apiFetch<{ message: string; update: UpdateItem }>(`/api/admin/updates/${updateId}`, {
    method: "PUT",
    json: payload,
    token,
  });
}

export async function deleteUpdate(updateId: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/updates/${updateId}`, {
    method: "DELETE",
    token,
  });
}

