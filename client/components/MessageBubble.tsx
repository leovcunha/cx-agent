
import { Bot, User, Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  
  const getStatusIcon = () => {
    if (message.sender === 'ai') return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/\*\*+/);
    return (
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-gray-950'}`}>
                {part}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className={`flex items-end space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 mb-1">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm border'
          }`}
        >
          {renderMessageText(message.text)}
        </div>
        
        <div className={`flex items-center mt-1 space-x-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {getStatusIcon()}
          {!isUser && (
            <button
              onClick={() => {
                // Dispatch a custom event to notify Chat.tsx
                window.dispatchEvent(new CustomEvent('openCompliance', { detail: message.id }));
              }}
              className="ml-2 flex items-center text-[10px] text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-gray-100"
              title="View Compliance Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Compliance
            </button>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-full p-2 mb-1">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
