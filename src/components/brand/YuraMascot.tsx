import React from "react";

export interface YuraMascotProps {
  mood?: "normal" | "listening" | "processing" | "celebrating" | "sleeping" | "supportive" | "wink" | "love" | "sad" | "question" | "concern";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  behindText?: boolean;
  src?: string;
}

export const YuraMascot: React.FC<YuraMascotProps> = ({
  mood = "normal",
  size = "md",
  className = "",
  behindText = false,
  src,
}) => {
  const sizeClasses = {
    xs: "w-10 h-10",
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  const getBouncingStyle = () => {
    switch (mood) {
      case "listening":
      case "question":
        return "scale-[1.03] rotate-[1deg] ring-2 ring-[#b2a4ff]/25 rounded-full animate-pulse transition-all duration-300";
      case "processing":
      case "concern":
        return "scale-[1.04] animate-pulse duration-1000";
      case "celebrating":
      case "love":
      case "wink":
        return "animate-bounce scale-[1.06] transition-transform duration-300";
      case "sleeping":
      case "sad":
        return "opacity-80 rotate-[-2deg] transition-all duration-500 scale-[0.98]";
      default:
        return "hover:scale-[1.03] transition-transform duration-500";
    }
  };

  const moodAssets: Record<string, string> = {
    normal: "/logo.png?v=yura-new",
    sleeping: "/yura-sleep.png?v=yura-new",
    question: "/yura-question.png?v=yura-new",
    listening: "/yura-question.png?v=yura-new",
    concern: "/yura-concern.png?v=yura-new",
    processing: "/yura-concern.png?v=yura-new",
    wink: "/yura-wink.png?v=yura-new",
    celebrating: "/yura-wink.png?v=yura-new",
    supportive: "/yura-wink.png?v=yura-new",
    love: "/yura-love.png?v=yura-new",
    sad: "/yura-sad.png?v=yura-new",
  };

  const [imgSrc, setImgSrc] = React.useState(src || moodAssets[mood] || "/logo.png?v=yura-new");

  React.useEffect(() => {
    setImgSrc(src || moodAssets[mood] || "/logo.png?v=yura-new");
  }, [mood, src]);

  const handleImgError = () => {
    if (imgSrc !== (src || "/logo.png?v=yura-new")) {
      setImgSrc(src || "/logo.png?v=yura-new");
    }
  };

  const getAltText = () => {
    switch (mood) {
      case "question":
      case "listening":
        return "Yura questioning expression";
      case "concern":
      case "processing":
        return "Yura concerned expression";
      case "wink":
      case "celebrating":
      case "supportive":
        return "Yura winking expression";
      case "love":
        return "Yura loving expression";
      case "sad":
        return "Yura sad expression";
      case "sleeping":
        return "Yura sleeping expression";
      default:
        return "Yura Mascot logo";
    }
  };

  // Render the uploaded official Yura mascot image
  const renderMascotImage = () => {
    return (
      <img
        src={imgSrc}
        alt={getAltText()}
        onError={handleImgError}
        className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(115,97,235,0.16)]"
        referrerPolicy="no-referrer"
      />
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        behindText
          ? "absolute inset-0 opacity-15 pointer-events-none z-0 overflow-hidden"
          : ""
      } ${className}`}
    >
      {/* Background soft aura blur */}
      {!behindText && (
        <div className="absolute inset-0 bg-[#b2a4ff]/15 rounded-full blur-[40px] scale-75 animate-pulse" />
      )}
      <div className={`${sizeClasses[size]} ${getBouncingStyle()} relative z-10 transition-all duration-500`}>
        {renderMascotImage()}
      </div>
    </div>
  );
};

export default YuraMascot;
