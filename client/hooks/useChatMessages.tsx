import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/api";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered";
}

interface UseChatMessagesOptions {
  clientId: string;
  chatId: string;
}

export const useChatMessages = ({ clientId, chatId }: UseChatMessagesOptions) => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<string>("");

  const accessToken = session?.access_token ?? null;

  const refreshMessages = useCallback(async (force = false) => {
    if (!clientId || !chatId || !accessToken) {
      console.log("[useChatMessages] Missing required parameters:", { clientId, chatId, hasToken: !!accessToken });
      return;
    }

    const cacheKey = `${clientId}:${chatId}:${accessToken}`;
    if (!force && lastFetchRef.current === cacheKey) {
      console.log("[useChatMessages] Cache hit, skipping fetch for", clientId);
      return;
    }

    console.log("[useChatMessages] Fetching messages for client:", clientId);
    lastFetchRef.current = cacheKey;
    setLoading(true);
    try {
      const result = await apiRequest<{ messages: any[] }>("/api/messages", {
        method: "POST",
        token: accessToken,
        body: { clientId },
      });

      if (!result.ok || !result.data) {
        throw new Error("Failed to fetch messages");
      }

      const mappedMessages = result.data.messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender as "user" | "ai",
        timestamp: new Date(msg.timestamp),
        status: "delivered" as const,
      }));
      console.log("[useChatMessages] Mapped messages count:", mappedMessages.length);
      setMessages(mappedMessages);
    } catch (error) {
      console.error("[useChatMessages] Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, chatId, clientId]);

  // Reset messages and load when clientId or chatId changes
  useEffect(() => {
    console.log("[useChatMessages] Client/Chat changed:", { clientId, chatId });
    setMessages([]);
    // Reset cache key so we force a fetch for the new client
    lastFetchRef.current = "";
    setLoading(true);
  }, [clientId, chatId]);

  // Trigger fetch when parameters are ready
  useEffect(() => {
    if (clientId && chatId && accessToken) {
      refreshMessages();
    }
  }, [clientId, chatId, accessToken, refreshMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !clientId || !chatId || !accessToken) {
        return;
      }

      if (text !== "[AI_INTRO_REQUEST]") {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text,
          sender: "user",
          timestamp: new Date(),
          status: "sending",
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      setIsTyping(true);
      try {
        const chatResult = await apiRequest("/api/chat", {
          method: "POST",
          token: accessToken,
          body: { client_id: clientId, chat_id: chatId, message: text },
        });
        if (!chatResult.ok) {
          throw new Error("Network response was not ok");
        }

        // Fetch latest messages directly to update UI
        await refreshMessages(true);
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsTyping(false);
      }
    },
    [accessToken, chatId, clientId, refreshMessages]
  );

  return {
    messages,
    isTyping,
    loading,
    refreshMessages,
    sendMessage,
  };
};
