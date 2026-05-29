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
    <div className={`relative flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container ${
      fullScreen
        ? "h-[100dvh] max-h-[100dvh] overflow-hidden"
        : `min-h-[100dvh] ${bottomNavProps ? "pb-32" : "pb-6"}`
    }`}>
      {/* Soft Glow Background Blobs */}
      {pulseGlow && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 animate-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-container/15 rounded-full blur-[80px] animate-pulse duration-10000" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-container/15 rounded-full blur-[100px] animate-pulse duration-10000 delay-2000" />
          <div className="absolute top-1/2 right-[10%] w-60 h-60 bg-tertiary-container/10 rounded-full blur-[90px] animate-pulse duration-8000 delay-4000" />
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
