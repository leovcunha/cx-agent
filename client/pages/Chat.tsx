import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Bot, ArrowLeft } from "lucide-react";

const SCENARIOS = [
  { id: "ecommerce_demo", key: "demoEcommerce" },
  { id: "creditcard_demo", key: "demoCreditCard" },
  { id: "internet_demo", key: "demoInternet" },
  { id: "elearning_demo", key: "demoELearning" },
];

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0].id);

  // Isolate conversation history per scenario
  const actualClientId = chatId ? `${chatId}_${activeScenario}` : `demo_${activeScenario}`;

  const { messages, loading, isTyping, sendMessage } = useChatMessages({
    clientId: actualClientId,
    chatId: actualClientId,
    tenantId: activeScenario,
  });

  const { session } = useAuth();

  const activeScenarioTitle = t(SCENARIOS.find(s => s.id === activeScenario)?.key || SCENARIOS[0].key);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Demo Scenarios
          </h2>
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeScenario === s.id
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-100 border border-transparent"
                }`}
              >
                {t(s.key)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
          Switching scenarios initializes a new session context.
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 sm:p-4 md:p-6 lg:p-8">
        <div className="flex-1 w-full max-w-4xl mx-auto bg-white rounded-none sm:rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t('aiReferralAssistant')}</h1>
                <p className="text-xs text-blue-600 font-medium">{activeScenarioTitle}</p>
              </div>
            </div>
            {/* Mobile Home Link */}
            <Link to="/" className="md:hidden flex items-center text-sm text-gray-500 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Link>
          </div>

          {/* Mobile Scenario Selector */}
          <div className="md:hidden border-b border-gray-100 bg-gray-50 p-2 overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar shrink-0">
             {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeScenario === s.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t(s.key)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden relative bg-gray-50">
            <ChatInterface
              messages={messages}
              loading={loading}
              isTyping={isTyping}
              onSendMessage={sendMessage}
              hideHeader={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
