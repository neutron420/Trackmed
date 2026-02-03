import { useQuery } from "@tanstack/react-query";
import { getToken } from "../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchWithAuth<T>(url: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.success ? data.data : data;
}

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
}

export function useManufacturers() {
  return useQuery({
    queryKey: ["chat", "manufacturers"],
    queryFn: async () => {
      const users = await fetchWithAuth<OnlineUser[]>(
        `${API_BASE}/api/chat/users`,
      );
      return users
        .filter((u) => u.role === "MANUFACTURER")
        .map((u) => ({
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          role: u.role,
          isOnline: u.isOnline ?? false,
        }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  timestamp: string;
}

export function useChatHistory(recipientId: string | null) {
  return useQuery({
    queryKey: ["chat", "history", recipientId ?? "all"],
    queryFn: async () => {
      const url = recipientId
        ? `${API_BASE}/api/chat/history?recipientId=${encodeURIComponent(
            recipientId,
          )}&limit=100`
        : `${API_BASE}/api/chat/history?limit=50`;

      const messages = await fetchWithAuth<
        Array<{
          id: string;
          message: string;
          senderId: string;
          senderName?: string | null;
          senderRole?: string | null;
          recipientId?: string | null;
          timestamp?: string;
          createdAt?: string;
        }>
      >(url);

      return messages
        .map((m) => ({
          id: m.id,
          message: m.message,
          senderId: m.senderId,
          senderName: m.senderName ?? m.senderId,
          senderRole: m.senderRole ?? "",
          recipientId: m.recipientId ?? undefined,
          timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
        }))
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
    },
    staleTime: 1 * 60 * 1000, // 1 minute - chat needs fresher data
  });
}
