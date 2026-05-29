/**
 * Shared Type Definitions for Promise Yura
 */

export interface PromiseItem {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string; // empty means needs detail!
  priority: "Low" | "Medium" | "High";
  status: "upcoming" | "needs check-in" | "needs detail" | "done" | "missed";
  notes?: string;
  category?: string;
  intensity?: "Gentle" | "Normal" | "Annoying";
  originalText?: string;
  needsDetails?: boolean;
  dueAt?: string;
  reminderAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  messageTone: "Sweet" | "Direct" | "Playful";
  voiceInputEnabled: boolean;
  notificationStyle: "Soft nudge" | "Repeated nudge" | "Check-in required";
}

export interface AppState {
  currentScreen: string; // Splash | Onboarding1 | Onboarding2 | Onboarding3 | Login | Register | ForgotPassword | Permission | Home | Listening | Processing | ReviewPromises | FollowUp | SavedSuccess | MyPromises | EditPromise | CheckIn | Reschedule | MissedPromise | History | Profile | CustomizeYura
  promises: PromiseItem[];
  currentEditingId: string | null;
  preferences: UserPreferences;
  userEmail: string;
  userName: string;
}
