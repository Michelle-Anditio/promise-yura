import React from "react";
import { Quote } from "lucide-react";
import { Card } from "../ui/Card";

export interface TranscriptCardProps {
  transcript: string;
  isCompleted?: boolean;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  transcript,
  isCompleted = false,
}) => {
  return (
    <Card className="glass-card border border-white/40 shadow-sm p-4 relative">
      <div className="flex items-start gap-3">
        <Quote className="text-primary-container w-6 h-6 select-none flex-shrink-0 rotate-180" />
        <div className="flex-grow">
          <p className="text-sm italic text-on-surface font-medium leading-relaxed">
            "{transcript}"
          </p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-2">
        <div className="h-1.5 flex-grow bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full bg-primary-container rounded-full transition-all duration-1000 ${
              isCompleted ? "w-full" : "w-3/4 animate-pulse"
            }`}
          />
        </div>
        <span className="text-[10px] font-bold text-[#797582] uppercase select-none tracking-widest">
          {isCompleted ? "Captured" : "Streaming"}
        </span>
      </div>
    </Card>
  );
};
export default TranscriptCard;
