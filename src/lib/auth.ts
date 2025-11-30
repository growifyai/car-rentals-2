import type { AuthSession, AuthUser } from "@/components/providers/auth-provider";

import { apiFetch } from "./api-client";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobile: string;
}

interface AuthResponse {
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "customer" | "admin";
  };
}

function mapUser(response: AuthResponse["user"]): AuthUser {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    role: response.role,
  };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  try {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      json: payload,
    });

    return {
      token: data.token,
      user: mapUser(data.user),
    };
  } catch (error) {
    throw error;
  }
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    json: payload,
  });

  return {
    token: data.token,
    user: mapUser(data.user),
  };
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    json: payload,
  });
}

export async function verifyResetToken(token: string): Promise<{ message: string; email: string }> {
  return apiFetch<{ message: string; email: string }>(`/api/auth/verify-reset-token/${token}`, {
    method: "GET",
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    json: payload,
  });
}

