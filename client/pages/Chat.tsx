import { useParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useChatAccess } from "@/hooks/useChatAccess";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { messages, loading, isTyping, sendMessage } = useChatMessages({
    clientId: chatId ?? "default_client",
    chatId: chatId ?? "default_client",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
        style={{ minWidth: "320px", height: "700px", maxHeight: "90vh", maxWidth: "100%" }}
      >
        <ChatInterface
          messages={messages}
          loading={loading}
          isTyping={isTyping}
          onSendMessage={sendMessage}
          headerSubtitle="Customer Support Agent"
        />
      </div>
    </div>
  );
};

export default ChatPage;
