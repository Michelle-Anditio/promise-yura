import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export interface ScreenLayoutProps {
  children: React.ReactNode;
  headerProps?: {
    title: string;
    onBack?: () => void;
    onAction?: () => void;
    actionIcon?: string;
    actionType?: "settings" | "skip" | "notification";
    onSkip?: () => void;
  };
  bottomNavProps?: {
    activeTab: "home" | "promises" | "add" | "history" | "profile";
    onChangeTab: (tab: "home" | "promises" | "add" | "history" | "profile") => void;
  };
  className?: string;
  pulseGlow?: boolean;
  fullScreen?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerProps,
  bottomNavProps,
  className = "",
  pulseGlow = true,
  fullScreen = false,
}) => {
  return (
    <div className={`relative flex flex-col bg-gradient-to-b from-white via-[#fbfaff] to-[#f6f3ff] text-on-background selection:bg-primary-container selection:text-on-primary-container ${
      fullScreen
        ? "h-[100dvh] max-h-[100dvh] overflow-hidden"
        : `min-h-[100dvh] ${bottomNavProps ? "pb-32" : "pb-6"}`
    }`}>
      {/* Soft Luminous Background Glows */}
      {pulseGlow && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 animate-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-purple-100/40 via-purple-50/20 to-transparent blur-[60px]" />
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#ede7ff]/40 rounded-full blur-[100px] animate-pulse duration-10000" />
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-[#ffdce7]/30 rounded-full blur-[110px] animate-pulse duration-10000 delay-2000" />
          <div className="absolute top-2/3 left-10 w-64 h-64 bg-[#e0f2fe]/30 rounded-full blur-[100px] animate-pulse duration-8000 delay-4000" />
        </div>
      )}

      {/* Header section */}
      {headerProps && (
        <Header
          title={headerProps.title}
          onBack={headerProps.onBack}
          onAction={headerProps.onAction}
          actionIcon={headerProps.actionIcon}
          actionType={headerProps.actionType}
          onSkip={headerProps.onSkip}
        />
      )}

      {/* Main scrolling content safe bounds */}
      <main className={`flex-grow w-full max-w-lg mx-auto ${
        fullScreen
          ? `flex flex-col min-h-0 overflow-hidden px-6 pb-4 pt-1 ${className}`
          : `px-6 py-4 ${className}`
      }`}>
        {children}
      </main>

      {/* Persistent Bottom navigation */}
      {bottomNavProps && (
        <BottomNav
          activeTab={bottomNavProps.activeTab}
          onChangeTab={bottomNavProps.onChangeTab}
        />
      )}
    </div>
  );
};
export default ScreenLayout;
