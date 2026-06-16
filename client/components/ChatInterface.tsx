import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "@/hooks/useChatMessages";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  loading: boolean;
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  headerSubtitle?: string;
  showLogout?: boolean;
  onLogout?: () => void;
  hideHeader?: boolean;
}

const ChatInterface = ({
  messages,
  loading,
  isTyping,
  onSendMessage,
  headerSubtitle,
  showLogout,
  onLogout,
  hideHeader = false,
}: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {!hideHeader && (
        <ChatHeader subtitle={headerSubtitle} showLogout={showLogout} onLogout={onLogout} />
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="text-center text-blue-600">Loading chat...</div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isTyping && (
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-full p-2">
              <Bot className="h-4 w-4 text-blue-500" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatInterface;
