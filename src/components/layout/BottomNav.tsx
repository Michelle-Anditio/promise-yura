import React from "react";
import { Home, ListChecks, Mic, Clock, User } from "lucide-react";

export interface BottomNavProps {
  activeTab: "home" | "promises" | "add" | "history" | "profile";
  onChangeTab: (tab: "home" | "promises" | "add" | "history" | "profile") => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-low/95 backdrop-blur-xl rounded-t-2xl shadow-[0_-10px_30px_rgba(95,82,166,0.06)] border-t border-surface-container-high/40 select-none">
      <button
        onClick={() => onChangeTab("home")}
        className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 w-16 cursor-pointer ${
          activeTab === "home" ? "text-primary scale-105 font-bold" : "text-on-surface-variant/70 hover:text-primary"
        }`}
      >
        <Home className="w-5 h-5 select-none" />
        <span className="text-[10px] mt-0.5 font-bold">Home</span>
      </button>

      <button
        onClick={() => onChangeTab("promises")}
        className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 w-16 cursor-pointer ${
          activeTab === "promises" ? "text-primary scale-105 font-bold" : "text-on-surface-variant/70 hover:text-primary"
        }`}
      >
        <ListChecks className="w-5 h-5 select-none" />
        <span className="text-[10px] mt-0.5 font-bold">Promises</span>
      </button>

      {/* Core audio/microphone action button at the center - MUST BE MICROPHONE */}
      <div className="relative -top-5 flex flex-col items-center justify-center animate-none">
        <button
          onClick={() => onChangeTab("add")}
          className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform duration-300 ring-4 ring-background cursor-pointer"
        >
          <Mic className="w-7 h-7 font-bold select-none" />
        </button>
      </div>

      <button
        onClick={() => onChangeTab("history")}
        className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 w-16 cursor-pointer ${
          activeTab === "history" ? "text-primary scale-105 font-bold" : "text-on-surface-variant/70 hover:text-primary"
        }`}
      >
        <Clock className="w-5 h-5 select-none" />
        <span className="text-[10px] mt-0.5 font-bold">History</span>
      </button>

      <button
        onClick={() => onChangeTab("profile")}
        className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 w-16 cursor-pointer ${
          activeTab === "profile" ? "text-primary scale-105 font-bold" : "text-on-surface-variant/70 hover:text-primary"
        }`}
      >
        <User className="w-5 h-5 select-none" />
        <span className="text-[10px] mt-0.5 font-bold">Profile</span>
      </button>
    </nav>
  );
};
export default BottomNav;
