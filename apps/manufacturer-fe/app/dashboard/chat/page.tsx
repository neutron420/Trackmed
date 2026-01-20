"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import {
  FiSend,
  FiUsers,
  FiCircle,
  FiMessageCircle,
  FiSearch,
  FiMoreVertical,
  FiRefreshCw,
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
// Connect to admin-be WebSocket server for chat functionality
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  message: string;
  timestamp: string;
  isMine: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = useCallback((token: string, currentUser: User) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Send authentication
      ws.send(JSON.stringify({
        type: "AUTH",
        payload: { token },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "AUTH" && data.payload?.success) {
          setIsConnected(true);
          console.log("WebSocket authenticated:", data.payload);
        } else if (data.type === "ERROR" || (data.type === "AUTH" && !data.payload?.success)) {
          console.error("WebSocket error:", data.error || data.payload?.error);
          setIsConnected(false);
        } else if (data.type === "CHAT_RECEIVED") {
          const chatData = data.payload;
          const newMsg: Message = {
            id: data.messageId || Date.now().toString(),
            senderId: chatData.senderId,
            senderName: chatData.senderName || chatData.senderId,
            senderRole: chatData.senderRole,
            recipientId: chatData.recipientId,
            message: chatData.message,
            timestamp: chatData.timestamp,
            isMine: chatData.senderId === currentUser.id,
          };
          
          setMessages((prev) => [...prev, newMsg]);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          connectWebSocket(storedToken, currentUser);
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, []);

  const fetchChatUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/chat/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setChatUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch chat users:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchChatUsers();
      connectWebSocket(token, parsedUser);
      setIsLoading(false);
    } catch {
      router.push("/login");
    }

    return () => {
      wsRef.current?.close();
    };
  }, [router, fetchChatUsers, connectWebSocket]);

  const handleLogout = () => {
    wsRef.current?.close();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageData = {
      type: "CHAT",
      payload: {
        message: newMessage.trim(),
        recipientId: selectedUser?.id, // undefined for broadcast
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

  const filteredUsers = chatUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = selectedUser
    ? messages.filter(
        (m) =>
          (m.senderId === selectedUser.id && m.recipientId === user?.id) ||
          (m.senderId === user?.id && m.recipientId === selectedUser.id)
      )
    : messages.filter((m) => !m.recipientId); // Broadcast messages

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <FiMessageCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Chat</h1>
                <p className="text-xs text-slate-500">
                  Communicate with team members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FiCircle
                  className={`h-2 w-2 ${
                    isConnected ? "fill-emerald-500 text-emerald-500" : "fill-red-500 text-red-500"
                  }`}
                />
                <span className="text-xs text-slate-500">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button
                onClick={fetchChatUsers}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-65px)]">
          {/* Users Sidebar */}
          <div className="w-72 border-r border-slate-200 bg-white">
            <div className="p-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Broadcast Option */}
            <div
              onClick={() => setSelectedUser(null)}
              className={`mx-3 mb-2 cursor-pointer rounded-lg p-3 transition ${
                selectedUser === null
                  ? "bg-emerald-50 border border-emerald-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <FiUsers className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Broadcast</p>
                  <p className="text-xs text-slate-500">Send to all team</p>
                </div>
              </div>
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-medium uppercase text-slate-400">
                Team Members ({filteredUsers.length})
              </p>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {filteredUsers.map((chatUser) => (
                <div
                  key={chatUser.id}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`mx-3 mb-2 cursor-pointer rounded-lg p-3 transition ${
                    selectedUser?.id === chatUser.id
                      ? "bg-emerald-50 border border-emerald-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                        {chatUser.avatar}
                      </div>
                      {chatUser.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {chatUser.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {chatUser.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="py-8 text-center">
                  <FiUsers className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs text-slate-500">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col bg-slate-50">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                {selectedUser ? (
                  <>
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                        {selectedUser.avatar}
                      </div>
                      {selectedUser.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedUser.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedUser.isOnline ? "Online" : "Offline"} • {selectedUser.role}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <FiUsers className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Team Broadcast
                      </p>
                      <p className="text-xs text-slate-500">
                        Messages visible to all team members
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <FiMoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5">
              {filteredMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <FiMessageCircle className="h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No messages yet</p>
                  <p className="text-xs text-slate-400">
                    {selectedUser
                      ? `Start a conversation with ${selectedUser.name}`
                      : "Send a broadcast message to all team members"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.isMine
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-900 shadow-sm border border-slate-100"
                        }`}
                      >
                        {!msg.isMine && (
                          <p className={`text-xs font-medium mb-1 ${
                            msg.isMine ? "text-emerald-100" : "text-emerald-600"
                          }`}>
                            {msg.senderName}
                            <span className={`ml-1 ${msg.isMine ? "text-emerald-200" : "text-slate-400"}`}>
                              • {msg.senderRole}
                            </span>
                          </p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`mt-1 text-xs ${
                            msg.isMine ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div >
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={
                    selectedUser
                      ? `Message ${selectedUser.name}...`
                      : "Broadcast message to team..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
              {!isConnected && (
                <p className="mt-2 text-xs text-red-500">
                  Not connected to chat server. Messages cannot be sent.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}


