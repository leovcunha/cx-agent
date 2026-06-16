import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatInterface from "@/components/ChatInterface";
import type { ChatMessage } from "@/hooks/useChatMessages";
import type { Database } from "@/integrations/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ChatViewerProps {
  activeClient: ClientRow | null;
  messages: ChatMessage[];
  chatLoading: boolean;
  isTyping: boolean;
  sendMessage: (text: string) => void;
  isMobile: boolean;
  onBack: () => void;
}

const ChatViewer = ({
  activeClient,
  messages,
  chatLoading,
  isTyping,
  sendMessage,
  isMobile,
  onBack,
}: ChatViewerProps) => {
  const { t } = useTranslation();

  /* Empty state — no active client */
  if (!activeClient) {
    return (
      <div
        className="hidden md:flex flex-1 flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "var(--wa-panel-bg)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--wa-accent)", opacity: 0.15 }}
        >
          <MessageSquareText className="h-10 w-10" style={{ color: "var(--wa-accent)" }} />
        </div>
        <p className="text-lg font-medium" style={{ color: "var(--wa-text-secondary)" }}>
          {t("selectConversation")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${
        isMobile ? "fixed inset-0 z-50" : "flex-1"
      }`}
      style={{ backgroundColor: "var(--wa-chat-bg)" }}
    >
      {/* Chat header with client info */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ backgroundColor: "var(--wa-header-bg)" }}
      >
        {isMobile && (
          <button
            onClick={onBack}
            className="p-1 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
          style={{ backgroundColor: "var(--wa-accent)" }}
        >
          {activeClient.name
            ? activeClient.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{activeClient.name}</p>
          <p className="text-gray-400 text-xs">{activeClient.email || activeClient.phone_number}</p>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          loading={chatLoading}
          isTyping={isTyping}
          onSendMessage={sendMessage}
          headerSubtitle={activeClient.email ?? undefined}
          hideHeader
        />
      </div>
    </div>
  );
};

export default ChatViewer;
