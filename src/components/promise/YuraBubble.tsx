import React from "react";
import { YuraMascot } from "../brand/YuraMascot";

export interface YuraBubbleProps {
  text: string;
  tone?: "sweet" | "direct" | "playful";
  mood?: "normal" | "listening" | "processing" | "celebrating" | "sleeping" | "supportive" | "wink" | "love" | "sad" | "question" | "concern";
  className?: string;
}

export const YuraBubble: React.FC<YuraBubbleProps> = ({
  text,
  tone = "sweet",
  mood = "supportive",
  className = "",
}) => {
  const getBannerColor = () => {
    switch (tone) {
      case "direct":
        return "border-l-primary";
      case "playful":
        return "border-l-secondary";
      default:
        return "border-l-primary-container";
    }
  };

  return (
    <div className={`flex items-end gap-3.5 my-2.5 ${className}`}>
      <YuraMascot mood={mood} size="xs" className="flex-shrink-0 yura-float" />
      <div className={`flex-grow bg-white p-5 rounded-t-2xl rounded-br-2xl text-on-surface shadow-[0_8px_24px_rgba(95,82,166,0.04)] border-l-4 ${getBannerColor()} border-r border-y border-white/50 animate-none`}>
        <p className="text-base font-semibold leading-relaxed text-on-surface">
          {text}
        </p>
      </div>
    </div>
  );
};
export default YuraBubble;
