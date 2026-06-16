
import { Bot, MoreVertical, Phone, Video, LogOut } from "lucide-react";

interface ChatHeaderProps {
  subtitle?: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

const ChatHeader = ({ subtitle, showLogout = false, onLogout }: ChatHeaderProps) => {

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Bot className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">AI Customer Support Agent</h3>
            <p className="text-sm text-blue-100">{subtitle || "Online • Ready to help"}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
