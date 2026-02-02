"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { getToken, getUser, clearAuth, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
// Connect to admin-be WebSocket server for chat functionality
const WS_URL = "ws://localhost:3000/ws";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  timestamp: string;
}

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [manufacturers, setManufacturers] = useState<OnlineUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedUserRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);
  const initialSelectionApplied = useRef(false);
  const connectWebSocketRef = useRef<(() => void) | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectWebSocket = useCallback(() => {
    const token = getToken();
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(JSON.stringify({ type: "AUTH", payload: { token } }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "AUTH" && data.payload?.success) {
            setIsConnected(true);
            console.log("WebSocket authenticated:", data.payload);
          } else if (
            data.type === "ERROR" ||
            (data.type === "AUTH" && !data.payload?.success)
          ) {
            console.error(
              "WebSocket error:",
              data.error || data.payload?.error,
            );
            setIsConnected(false);
          } else if (data.type === "CHAT_RECEIVED") {
            const chatMsg: ChatMessage = {
              id: data.messageId || Date.now().toString() + Math.random(),
              message: data.payload.message,
              senderId: data.payload.senderId,
              senderName: data.payload.senderName || data.payload.senderId,
              senderRole: data.payload.senderRole,
              recipientId: data.payload.recipientId,
              timestamp: data.payload.timestamp,
            };
            setMessages((prev) => {
              const sel = selectedUserRef.current;
              const u = userRef.current;
              const forCurrentView =
                sel === null
                  ? !data.payload.recipientId
                  : (data.payload.senderId === u?.id &&
                      data.payload.recipientId === sel) ||
                    (data.payload.senderId === sel &&
                      data.payload.recipientId === u?.id);
              if (!forCurrentView) return prev;
              if (
                prev.some(
                  (m) =>
                    m.id === chatMsg.id ||
                    (m.timestamp === chatMsg.timestamp &&
                      m.message === chatMsg.message),
                )
              )
                return prev;
              const next = [...prev, chatMsg];
              next.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              );
              return next;
            });
          }
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocketRef.current?.();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    connectWebSocketRef.current = connectWebSocket;
  }, [connectWebSocket]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchManufacturers = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/chat/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list: OnlineUser[] = (data.data || [])
          .filter((u: OnlineUser) => u.role === "MANUFACTURER")
          .map((u: OnlineUser) => ({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            role: u.role,
            isOnline: u.isOnline ?? false,
          }));
        setManufacturers(list);

        // Restore last selected conversation (WhatsApp-style) on load
        if (!initialSelectionApplied.current) {
          const saved = localStorage.getItem("admin-chat-last-target");
          if (saved && list.some((u) => u.id === saved)) {
            setSelectedUser(saved);
          } else {
            setSelectedUser(null);
          }
          initialSelectionApplied.current = true;
        }
      }
    } catch (error) {
      console.error("Failed to fetch manufacturers:", error);
    }
  }, []);

  /** Load persisted chat history so messages survive refresh */
  const fetchChatHistory = useCallback(async (recipientId: string | null) => {
    const token = getToken();
    console.log(
      "[ChatHistory] fetchChatHistory called, recipientId:",
      recipientId,
      "token exists:",
      !!token,
    );
    if (!token) return;

    const requestKey = recipientId ?? "all";
    try {
      const url = recipientId
        ? `${API_BASE}/api/chat/history?recipientId=${encodeURIComponent(
            recipientId,
          )}&limit=100`
        : `${API_BASE}/api/chat/history?limit=50`;
      console.log("[ChatHistory] Fetching from:", url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("[ChatHistory] API Response:", data);
      // Only apply if we're still viewing the same conversation (avoid stale response overwriting)
      if ((selectedUserRef.current ?? "all") !== requestKey) {
        console.log("[ChatHistory] Skipping stale response");
        return;
      }
      if (data.success && Array.isArray(data.data)) {
        const list: ChatMessage[] = data.data.map((m: {
          id: string;
          message: string;
          senderId: string;
          senderName?: string | null;
          senderRole?: string | null;
          recipientId?: string | null;
          timestamp?: string;
          createdAt?: string;
        }) => ({
          id: m.id,
          message: m.message,
          senderId: m.senderId,
          senderName: m.senderName ?? m.senderId,
          senderRole: m.senderRole ?? "",
          recipientId: m.recipientId,
          timestamp: m.timestamp ?? m.createdAt,
        }));
        list.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        console.log("[ChatHistory] Setting messages:", list.length, "messages");
        setMessages(list);
      } else {
        console.log("[ChatHistory] No data or not success, clearing messages");
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      if ((selectedUserRef.current ?? "all") === requestKey) setMessages([]);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(storedUser);
    fetchManufacturers();
    connectWebSocket();
    setIsLoading(false);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [router, connectWebSocket, fetchManufacturers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persisted chat history when selecting a user (or "All") so messages survive refresh
  useEffect(() => {
    console.log(
      "[ChatHistory] useEffect triggered, user:",
      user?.id,
      "selectedUser:",
      selectedUser,
    );
    if (!user) {
      console.log("[ChatHistory] No user yet, skipping");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChatHistory(selectedUser);
  }, [selectedUser, user?.id, fetchChatHistory]);

  // Persist last selected conversation so it reopens after login/refresh
  useEffect(() => {
    if (!initialSelectionApplied.current) return;
    if (selectedUser === null) {
      localStorage.setItem("admin-chat-last-target", "all");
    } else {
      localStorage.setItem("admin-chat-last-target", selectedUser);
    }
  }, [selectedUser]);

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    clearAuth();
    router.push("/login");
  };

  const sendMessage = () => {
    if (
      !newMessage.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;

    const messageData = {
      type: "CHAT",
      payload: {
        message: newMessage.trim(),
        recipientId: selectedUser || undefined,
        timestamp: new Date().toISOString(),
      },
    };

    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: isCollapsed ? 72 : 280 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Chat</h1>
              <p className="text-sm text-slate-500">
                Communicate with manufacturers in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-slate-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Users Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Manufacturers</h3>
              <p className="text-xs text-slate-500">
                {manufacturers.length} registered
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <button
                onClick={() => setSelectedUser(null)}
                className={`w-full px-4 py-3 text-left border-b border-slate-50 hover:bg-slate-50 ${
                  selectedUser === null
                    ? "bg-emerald-50 border-l-2 border-l-emerald-500"
                    : ""
                }`}
              >
                <p className="font-medium text-slate-900">All Manufacturers</p>
                <p className="text-xs text-slate-500">Broadcast message</p>
              </button>
              {manufacturers.map((mf) => (
                <button
                  key={mf.id}
                  onClick={() => setSelectedUser(mf.id)}
                  className={`w-full px-4 py-3 text-left border-b border-slate-50 hover:bg-slate-50 ${
                    selectedUser === mf.id
                      ? "bg-emerald-50 border-l-2 border-l-emerald-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                      {mf.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {mf.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {mf.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {manufacturers.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-400">
                  No manufacturers found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Chat Header */}
            <div className="px-6 py-3 bg-white border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {selectedUser
                  ? manufacturers.find((m) => m.id === selectedUser)?.name ||
                    "Direct Message"
                  : "All Manufacturers (Broadcast)"}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedUser
                  ? "Private conversation"
                  : "Message will be sent to all connected manufacturers"}
              </p>
            </div>

            {/* Messages (when "All Manufacturers" selected, show only broadcast messages) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(selectedUser === null
                ? messages.filter((m) => !m.recipientId)
                : messages
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <svg
                    className="h-16 w-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">
                    Start a conversation with manufacturers
                  </p>
                </div>
              ) : (
                (selectedUser === null
                  ? messages.filter((m) => !m.recipientId)
                  : messages
                ).map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-semibold text-emerald-600 mb-1">
                            {msg.senderName} ({msg.senderRole})
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isConnected ? "Type a message..." : "Connecting..."
                  }
                  disabled={!isConnected}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              {!isConnected && (
                <p className="mt-2 text-xs text-amber-600">
                  Reconnecting to server...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
