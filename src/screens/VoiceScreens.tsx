import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Trash2, Edit3, Calendar, Clock, Mic, Info } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Chip } from "../components/ui/Chip";
import { Input } from "../components/ui/Input";
import { ScreenLayout } from "../components/layout/ScreenLayout";
import { YuraMascot } from "../components/brand/YuraMascot";
import { TranscriptCard } from "../components/promise/TranscriptCard";
import { YuraBubble } from "../components/promise/YuraBubble";
import { PromiseItem } from "../types";
import { MicrophoneHelpModal } from "../components/promise/MicrophoneHelpModal";

// ============================================================================
// 1. LISTENING SCREEN
// ============================================================================
interface ListeningScreenProps {
  inputThought: string;
  setInputThought: (thought: string) => void;
  onCancel: () => void;
  onDone: () => void;
  onTypeInstead: () => void;
}

export const ListeningScreen: React.FC<ListeningScreenProps> = ({
  inputThought,
  setInputThought,
  onCancel,
  onDone,
  onTypeInstead,
}) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [isMicBlocked, setIsMicBlocked] = React.useState(false);
  const [isMicHelpOpen, setIsMicHelpOpen] = React.useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);
  const handleDoneRef = React.useRef<() => void>();

  const isRecordingRef = React.useRef(false);
  const silenceTimerRef = React.useRef<any>(null);
  const lastResultTimeRef = React.useRef(Date.now());

  // Modern architecture buffers and reference points
  const latestInputThoughtRef = React.useRef(inputThought);
  const baselineTextRef = React.useRef("");
  const finalTranscriptRef = React.useRef("");
  const activeSessionIdRef = React.useRef<string | null>(null);

  // Synchronize latest inputThought continuously inside render lifecycle
  React.useEffect(() => {
    latestInputThoughtRef.current = inputThought;
  }, [inputThought]);

  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  React.useEffect(() => {
    // Generate a unique ID to identify this specific effect mount
    const effectId = Math.random().toString(36).substring(7);
    activeSessionIdRef.current = effectId;
    console.log(`[VoiceToText] Mount session initialized. effectId: ${effectId}`);

    // Synchronize initial baseline text on mount
    baselineTextRef.current = inputThought;
    finalTranscriptRef.current = "";
    console.log(`[VoiceToText] Syncing initial inputThought text: "${baselineTextRef.current}"`);

    // Check permission state reactively
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" as PermissionName }).then((permissionStatus) => {
        if (activeSessionIdRef.current !== effectId) return;
        if (permissionStatus.state === "denied") {
          setIsMicBlocked(true);
        }
        permissionStatus.onchange = () => {
          if (activeSessionIdRef.current !== effectId) return;
          if (permissionStatus.state === "denied") {
            setIsMicBlocked(true);
            isRecordingRef.current = false;
            setIsRecording(false);
          } else {
            setIsMicBlocked(false);
          }
        };
      }).catch(err => console.log("navigator.permissions query not supported:", err));
    }

    if (!SpeechRecognitionAPI) {
      setErrorText("Speech Recognition is not supported on this browser context. You can type your messy thought manually below!");
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US"; // Configured for English-first speech recognition as requested

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        if (activeSessionIdRef.current !== effectId) return;
        
        const currentText = latestInputThoughtRef.current.trim();
        if (currentText) {
          console.log("[VoiceToText] 3 seconds of silence reached. Auto-triggering completed voice processing...");
          setIsAutoProcessing(true);
          
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Allow 600ms for user to see the "Yura is processing your thoughts..." notification
          setTimeout(() => {
            if (activeSessionIdRef.current === effectId) {
              handleDoneRef.current?.();
            }
          }, 600);
        } else {
          console.log("[VoiceToText] 3 seconds of silence reached with no input text. Keep listening.");
          resetSilenceTimer();
        }
      }, 3000); // 3 seconds timeout for natural voice detection
    };

    rec.onstart = () => {
      if (activeSessionIdRef.current !== effectId) {
        console.log(`[VoiceToText] Ignoring onstart from stale effectId: ${effectId}`);
        return;
      }
      console.log(`[VoiceToText] Speech recognition session started. effectId: ${effectId}`);
      setIsRecording(true);
      isRecordingRef.current = true;
      setErrorText("");
      setIsAutoProcessing(false);
      
      // Update the baseline to the actual current text-area value at start-time
      baselineTextRef.current = latestInputThoughtRef.current;
      finalTranscriptRef.current = "";
      
      console.log(`[VoiceToText] Session onstart - Baseline text locked: "${baselineTextRef.current}"`);
      resetSilenceTimer();
    };

    rec.onresult = (event: any) => {
      if (activeSessionIdRef.current !== effectId) {
        console.log(`[VoiceToText] Ignoring onresult from stale effectId: ${effectId}`);
        return;
      }

      console.log(`[VoiceToText] onresult event. resultIndex: ${event.resultIndex}, length: ${event.results.length}`);

      // Process all final results from the current session (stateless approach)
      let currentFinalTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result && result.isFinal) {
          currentFinalTranscript += result[0]?.transcript || "";
        }
      }
      finalTranscriptRef.current = currentFinalTranscript;

      // Gather current interim text from the entire growing list
      let interimText = "";
      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result && !result.isFinal) {
          interimText += result[0]?.transcript || "";
        }
      }

      const sessionText = (finalTranscriptRef.current + " " + interimText).trim().replace(/\s+/g, " ");
      console.log(`[VoiceToText] Session cumulative text processed: "${sessionText}"`);

      // Combine previous baseline text (which represents text-area state prior to the current session)
      // with current active SpeechRecognition session's processed text
      let combinedText = baselineTextRef.current.trim();
      if (sessionText) {
        if (combinedText) {
          combinedText = combinedText + " " + sessionText;
        } else {
          combinedText = sessionText;
        }
      }

      // Ensure proper clean space formatting
      combinedText = combinedText.replace(/\s+/g, " ").trim();

      console.log(`[VoiceToText] Setting inputThought to: "${combinedText}"`);
      setInputThought(combinedText);
      lastResultTimeRef.current = Date.now();
      resetSilenceTimer();
    };

    rec.onerror = (e: any) => {
      if (activeSessionIdRef.current !== effectId) {
        console.log(`[VoiceToText] Ignoring onerror from stale effectId: ${effectId}`);
        return;
      }
      console.warn(`[VoiceToText] Speech recognition error on effectId ${effectId}:`, e);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setIsMicBlocked(true);
        isRecordingRef.current = false;
        setIsRecording(false);
      } else if (e.error !== "no-speech") {
        setErrorText(`Voice error: ${e.error}`);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    rec.onspeechend = () => {
      console.log("[VoiceToText] Speech ended natively event. Doing nothing to allow custom silence timer to handle.");
    };

    rec.onend = () => {
      if (activeSessionIdRef.current !== effectId) {
        console.log(`[VoiceToText] Ignoring onend from stale effectId: ${effectId}`);
        return;
      }
      console.log(`[VoiceToText] Speech recognition session ended on effectId: ${effectId}`);

      // Auto-restart if we are still marked as recording
      if (isRecordingRef.current) {
        console.log(`[VoiceToText] Auto-restoring speech recognition session...`);
        try {
          // Clear session final buffer prior to restart to prevent any potential carry-overs
          finalTranscriptRef.current = "";
          rec.start();
        } catch (err) {
          console.warn("[VoiceToText] Could not auto-restore start:", err);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = rec;

    // Trigger auto-start listening on mount if permitted and not blocked
    const autoStartRecording = () => {
      if (activeSessionIdRef.current !== effectId) return;
      try {
        console.log(`[VoiceToText] Triggering auto-start on effectId: ${effectId}`);
        isRecordingRef.current = true;
        rec.start();
      } catch (err) {
        console.warn("[VoiceToText] Auto-start failed:", err);
      }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" as PermissionName }).then((p) => {
        if (activeSessionIdRef.current === effectId && p.state !== "denied") {
          autoStartRecording();
        }
      }).catch(() => {
        autoStartRecording();
      });
    } else {
      autoStartRecording();
    }

    return () => {
      console.log(`[VoiceToText] Cleaning up complete on effectId: ${effectId}`);
      activeSessionIdRef.current = null;
      isRecordingRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (rec) {
        try {
          rec.abort();
        } catch (err) {
          console.warn("[VoiceToText] Abort failed during unmount cleanup:", err);
        }
      }
    };
  }, []);

  const handleToggleRecord = () => {
    setIsAutoProcessing(false);
    if (isMicBlocked) {
      setIsMicHelpOpen(true);
      return;
    }

    if (!SpeechRecognitionAPI) {
      setErrorText("Speech Recognition is not supported on this browser context.");
      return;
    }

    const rec = recognitionRef.current;
    if (!rec) return;

    console.log(`[VoiceToText] handleToggleRecord called. current isRecording/isRecordingRef: ${isRecording}/${isRecordingRef.current}`);

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      try {
        rec.stop();
      } catch (err) {
        console.warn("[VoiceToText] Manual stop failed:", err);
      }
    } else {
      // Locking the current textarea content as our starting baseline for the new session
      baselineTextRef.current = latestInputThoughtRef.current;
      finalTranscriptRef.current = "";
      console.log(`[VoiceToText] Starting record. Reference baseline set to: "${baselineTextRef.current}"`);
      isRecordingRef.current = true;
      setIsRecording(true);
      setErrorText("");
      try {
        rec.start();
      } catch (err) {
        console.warn("[VoiceToText] Manual start failed:", err);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setInputThought(nextValue);
    latestInputThoughtRef.current = nextValue;
    
    // Explicitly update baselineTextRef to the user's manual edits to protect from jump-backs
    baselineTextRef.current = nextValue;
    finalTranscriptRef.current = "";
    console.log(`[VoiceToText] Textarea manually updated. Baseline and inputThought synchronized to: "${nextValue}"`);

    // Cleanly abort any ongoing session to clear the browser's audio buffer and force a fresh session
    if (isRecordingRef.current && recognitionRef.current) {
      console.log("[VoiceToText] Aborting active SpeechRecognition session to force new session with updated baseline!");
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.warn("[VoiceToText] SpeechRecognition abort failed during sync restart:", err);
      }
    }
  };

  const handleDone = () => {
    if (!inputThought.trim()) {
      setErrorText("Transcription text cannot be empty! Please type or speak your promise first.");
      return;
    }
    isRecordingRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsRecording(false);
    onDone();
  };

  // Keep handleDoneRef updated to prevent stale closures inside useEffect
  handleDoneRef.current = handleDone;

  return (
    <motion.div
      key="Listening"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Promise Yura", onSkip: onCancel }}>
        <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] max-w-md mx-auto pb-10 px-4">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-primary">
              {isMicBlocked 
                ? "Microphone blocked" 
                : isAutoProcessing
                  ? "Processing thoughts…"
                  : isRecording 
                    ? "Yura is listening…" 
                    : "Listening paused"
              }
            </h1>
            <p className="text-sm font-semibold text-on-surface-variant">
              Say it messy. I will catch the promises.
            </p>
          </div>

          {/* Pulsing Mic visualizer */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2 select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`pulse-ring w-40 h-40 rounded-full bg-primary-container/30 ${isRecording && !isMicBlocked ? "animate-pulse" : "opacity-30"}`} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`pulse-ring-delayed w-40 h-40 rounded-full bg-tertiary-container/20 ${isRecording && !isMicBlocked ? "animate-pulse" : "opacity-30"}`} />
            </div>
            <button
              onClick={handleToggleRecord}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-[0_12px_24px_rgba(95,82,166,0.15)] active:scale-95 transition-transform cursor-pointer ${
                isMicBlocked
                  ? "bg-neutral-creamDark text-on-surface-variant"
                  : isRecording 
                    ? "bg-gradient-to-br from-rose-500 to-rose-600" 
                    : "bg-gradient-to-br from-primary to-primary-container"
              }`}
              id="center-mic-toggle"
              title={isMicBlocked ? "Microphone blocked - tap for guide" : isRecording ? "Tap to pauses listening" : "Tap to resumes listening"}
            >
              <Mic className="text-white w-8 h-8" />
            </button>
          </div>

          {/* Hearing sound indicator state */}
          <div className="flex items-center gap-2 select-none">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording && !isMicBlocked ? "bg-secondary" : "bg-neutral-dark/30"}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording && !isMicBlocked ? "bg-secondary" : "bg-neutral-dark/40"}`} />
            </span>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              {isMicBlocked 
                ? "Microphone unavailable" 
                : isAutoProcessing
                  ? "Yura is processing your thoughts…"
                  : isRecording 
                    ? "Listening for promises…" 
                    : "Microphone inactive"
              }
            </span>
          </div>

          {/* Fully editable Textarea for matching transcription */}
          <div className="w-full text-left space-y-1">
            <label htmlFor="messy-thought-input" className="text-xs font-bold uppercase tracking-widest text-[#797582] select-none pl-1">
              Your Messy Thought input
            </label>
            <div className="relative">
              <textarea
                id="messy-thought-input"
                value={inputThought}
                onChange={handleTextareaChange}
                placeholder="Talk or type your messy scattered thought here..."
                className="w-full min-h-[140px] px-4 py-3.5 pb-12 bg-white border border-primary-container/45 rounded-2xl shadow-sm outline-none focus:border-2 focus:border-primary text-sm leading-relaxed"
              />
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`absolute right-3.5 bottom-3.5 p-2 rounded-full transition-all cursor-pointer ${
                  isMicBlocked
                    ? "bg-neutral-creamDark text-on-surface-variant"
                    : isRecording 
                      ? "bg-rose-500 text-white animate-pulse" 
                      : "bg-surface-container hover:bg-primary-container text-primary"
                }`}
                title={isMicBlocked ? "Microphone is blocked" : isRecording ? "Hold to stop" : "Tap to speak"}
              >
                <Mic className="w-4 h-4 font-bold" />
              </button>
            </div>

            {isMicBlocked ? (
              <div className="bg-rose-50/75 border border-rose-100 rounded-2xl p-4 mt-2 flex items-center gap-3 select-none text-left">
                <YuraMascot mood="concern" size="md" className="shrink-0 self-center" />
                <div className="space-y-2 flex-grow">
                  <p className="text-xs font-black text-[#ba1a1a]">
                    Yura can’t hear you yet.
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">
                    You can still type your promise below, or enable microphone access from site settings.
                  </p>
                  {!inputThought.trim() && (
                    <p className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1">
                      ⚠️ Type your messy thought first to proceed manually.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMicHelpOpen(true)}
                    className="text-[10.5px] font-black text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                  >
                    How to enable →
                  </button>
                </div>
              </div>
            ) : !inputThought.trim() ? (
              <div className="bg-white border border-[#D8CCFF] rounded-2xl p-4 mt-2 flex items-center gap-3 select-none text-left shadow-sm">
                <YuraMascot mood="question" size="md" className="shrink-0" />
                <div className="space-y-1 flex-grow">
                  <p className="text-xs font-black text-primary">Stuck on what to say?</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold leading-relaxed">
                    Give Yura a messy draft, like: "Need to pay electricity bills before Friday or it locks."
                  </p>
                </div>
              </div>
            ) : errorText ? (
              <div className="bg-rose-50/75 border border-rose-100 rounded-2xl p-4 mt-2 flex items-center gap-3 select-none text-left animate-bounce">
                <YuraMascot mood="concern" size="sm" className="shrink-0" />
                <p className="text-xs font-bold text-rose-500 flex-grow">
                  {errorText}
                </p>
              </div>
            ) : null}

            {!SpeechRecognitionAPI && !isMicBlocked && (
              <p className="text-[11px] italic text-[#797582] px-1 select-none">
                Note: Typing is fully supported. Say it or draft it, Yura organizes either!
              </p>
            )}
          </div>

          {/* Bottom Actions flow control */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 animate-none">
            <Button variant="ghost" className="px-6 py-3.5 flex items-center justify-center select-none" onClick={onCancel}>
              <ArrowLeft className="mr-1 w-4 h-4" />
              Cancel
            </Button>
            <Button
              variant="primary"
              className={`font-bold transition-all h-auto py-3.5 px-6 leading-relaxed flex items-center justify-center gap-2 bg-primary shadow-md flex-1 sm:flex-initial cursor-pointer`}
              onClick={() => {
                if (isMicBlocked) {
                  onTypeInstead();
                } else {
                  handleDone();
                }
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isMicBlocked ? "Type Promise" : "Done speaking"}
            </Button>
          </div>
        </div>
      </ScreenLayout>

      <MicrophoneHelpModal
        isOpen={isMicHelpOpen}
        onClose={() => setIsMicHelpOpen(false)}
      />
    </motion.div>
  );
};

// ============================================================================
// 2. PROCESSING SCREEN
// ============================================================================
interface ProcessingScreenProps {
  inputThought: string;
  processingState: number;
  onCancel: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  inputThought,
  processingState,
  onCancel,
}) => {
  return (
    <motion.div
      key="Processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 h-[100dvh] max-h-[100dvh] z-50 flex flex-col items-center justify-center p-6 bg-neutral-background relative overflow-hidden"
    >
      <div className="text-center space-y-1 mb-6 animate-pulse select-none">
        <h1 className="text-2xl font-black text-primary">Yura is organizing your promise...</h1>
        <p className="text-sm font-semibold text-on-surface-variant max-w-[280px] mx-auto">
          I’m turning your messy thoughts into clear promises.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Card className="glass-card w-full p-6 text-center flex flex-col items-center relative overflow-hidden">
          <YuraMascot mood="processing" size="md" className="mb-4" />
          <div className="bg-white p-4 rounded-xl text-left border border-[#D8CCFF] border-l-4 border-l-primary shadow-sm">
            <p className="text-xs italic text-on-surface-variant leading-relaxed">
              "{inputThought}"
            </p>
          </div>
        </Card>

        {/* Progress Bar & steps indicators */}
        <div className="w-full space-y-4 px-2">
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-container to-secondary-container transition-all duration-500 rounded-full"
              style={{ width: `${(processingState + 1) * 33.3}%` }}
            />
          </div>

          <div className="space-y-2.5 text-left text-sm font-semibold">
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${processingState >= 0 ? "text-primary font-bold opacity-100" : "opacity-30"}`}>
              {processingState > 0 ? (
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-primary animate-spin" />
              )}
              <span>Finding promises...</span>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${processingState >= 1 ? "text-primary font-bold opacity-100" : "opacity-30"}`}>
              {processingState > 1 ? (
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
              ) : processingState === 1 ? (
                <span className="w-4 h-4 rounded-full border border-primary animate-spin" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-outline-variant" />
              )}
              <span>Checking missing details...</span>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${processingState >= 2 ? "text-primary font-bold opacity-100" : "opacity-30"}`}>
              {processingState === 2 ? (
                <span className="w-4 h-4 rounded-full border border-primary animate-spin" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-outline-variant" />
              )}
              <span>Preparing follow-up...</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-on-surface-variant font-bold text-xs"
          onClick={onCancel}
        >
          Cancel Process
        </Button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// 3. REVIEW PROMISES SCREEN
// ============================================================================
interface ReviewPromisesScreenProps {
  inputThought: string;
  detectedDrafts: PromiseItem[];
  setDetectedDrafts: React.Dispatch<React.SetStateAction<PromiseItem[]>>;
  onEditPromise: (id: string) => void;
  onAskFollowUp: () => void;
  onSaveAll: () => void;
  onBack: () => void;
}

export const ReviewPromisesScreen: React.FC<ReviewPromisesScreenProps> = ({
  inputThought,
  detectedDrafts,
  setDetectedDrafts,
  onEditPromise,
  onAskFollowUp,
  onSaveAll,
  onBack,
}) => {
  return (
    <motion.div
      key="ReviewPromises"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Review Promises", onBack: onBack }}>
        <div className="space-y-6 max-w-md mx-auto pb-10">
          <div className="space-y-1 mt-2">
            <h2 className="text-2xl font-black text-primary">I caught these promises</h2>
            <p className="text-sm font-semibold text-on-surface-variant">Check them before I save.</p>
          </div>

          {/* Input Text Transcript preview */}
          <div className="glass-card rounded-xl p-3 bg-surface-container border border-white/40 shadow-sm text-xs italic text-[#484551] flex items-center gap-2 select-none font-medium">
            <Mic className="w-4 h-4 flex-shrink-0" />
            "{inputThought}"
          </div>

          {/* Detected Items Lists */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Detected promises</h3>
              <Badge color="tertiary">{detectedDrafts.length} Found</Badge>
            </div>

            {detectedDrafts.length === 0 ? (
               <p className="text-xs text-[#797582] py-4 italic text-center">No parsed promises remaining. Add elements.</p>
            ) : (
              detectedDrafts.map((df) => (
                <Card key={df.id} className="border border-white/60 p-5 rounded-2xl relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1 flex-1 pr-4">
                      <h4 className="text-base font-bold text-on-surface">{df.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{df.dateStr || "Specify date"}{df.timeStr ? `, ${df.timeStr}` : ", Missing time"}</span>
                      </div>
                    </div>
                    
                     <div className="flex gap-1 select-none animate-none">
                      <button
                        onClick={() => onEditPromise(df.id)}
                        className="p-1.5 text-primary hover:bg-primary/5 rounded-full cursor-pointer"
                        title="Edit promise details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDetectedDrafts(prev => prev.filter(item => item.id !== df.id));
                        }}
                        className="p-1.5 text-error hover:bg-red-50 rounded-full cursor-pointer"
                        title="Dismiss promise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status detail pill */}
                  <Badge color={df.timeStr === "" ? "danger" : "primary"}>
                    {df.timeStr === "" ? "Needs detail (Time Missing)" : "Ready"}
                  </Badge>
                </Card>
              ))
            )}
          </div>

          {/* Ignored thoughts segment */}
          <div className="space-y-2 pt-2 select-none">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Ignored thoughts</h3>
            <div className="rounded-xl border border-dashed border-outline-variant p-4 flex flex-col items-center justify-center text-center opacity-60">
              <Info className="w-6 h-6 text-outline-variant mb-1" />
              <p className="text-xs font-semibold text-on-surface-variant">No unrelated messy data extracted.</p>
            </div>
          </div>

          {/* Bottom Actions sticky footer flow */}
          <div className="space-y-3 pt-6 animate-none">
            <Button
              onClick={onAskFollowUp}
              variant="outline"
              className="w-full h-14 border-2 font-bold cursor-pointer"
            >
              Ask follow-up
            </Button>
            <Button
              onClick={onSaveAll}
              variant="primary"
              className="w-full h-15 bg-primary shadow-lg cursor-pointer"
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Save all
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 4. FOLLOW-UP QUESTION SCREEN
// ============================================================================
interface FollowUpScreenProps {
  messageTone: "Sweet" | "Direct" | "Playful";
  customTimeInput: string;
  setCustomTimeInput: (t: string) => void;
  showToast: (msg: string) => void;
  onSaveTime: () => void;
  onBack: () => void;
  promiseTitle?: string;
  promiseDate?: string;
}

export const FollowUpScreen: React.FC<FollowUpScreenProps> = ({
  messageTone,
  customTimeInput,
  setCustomTimeInput,
  showToast,
  onSaveTime,
  onBack,
  promiseTitle = "Pay rent",
  promiseDate = "Tomorrow",
}) => {
  return (
    <motion.div
      key="FollowUp"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Detail missing", onBack: onBack }}>
        <div className="space-y-6 max-w-sm mx-auto pb-10">
          <div className="space-y-1 mt-2">
            <h2 className="text-2xl font-black text-on-surface">One detail missing</h2>
            <p className="text-sm text-on-surface-variant/80">Yura needs a time before saving.</p>
          </div>

          {/* Centered large question mascot */}
          <YuraMascot mood="question" size="md" className="mx-auto" />

          {/* Yura Dialogue Bubble asking detail */}
          <YuraBubble text={`What time should I remind you to: "${promiseTitle}"?`} tone={messageTone.toLowerCase() as any} mood="question" />

          {/* The promise card preview */}
          <Card className="glass-card shadow-sm p-5 border-l-4 border-l-primary flex flex-col gap-2">
            <div className="flex justify-between items-center select-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#797582]">Promise Draft</span>
              <Info className="w-4 h-4 text-[#797582]" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">{promiseTitle}</h3>
            <div className="flex flex-col gap-1 text-xs text-on-surface-variant mt-2 font-semibold">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{promiseDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-error font-extrabold">
                <Clock className="w-4 h-4" />
                <Badge color="danger">Missing time</Badge>
              </div>
            </div>
          </Card>

          {/* Quick select pills */}
          <div className="space-y-4 pt-4 select-none animate-none">
            <div className="flex flex-wrap gap-2">
              {["08:00 AM", "09:00 AM", "12:00 PM", "05:00 PM"].map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={customTimeInput === t}
                  onClick={() => {
                    setCustomTimeInput(t);
                    showToast(`Selected ${t}`);
                  }}
                />
              ))}
              <Chip
                label="Tonight"
                active={customTimeInput === "08:00 PM"}
                onClick={() => setCustomTimeInput("08:00 PM")}
              />
            </div>

            <Input
              label="Or type custom time"
              placeholder="e.g. 9:30 AM or Evening"
              value={customTimeInput}
              onChange={(e) => setCustomTimeInput(e.target.value)}
              rightIcon={<Edit3 className="w-5 h-5 text-primary" />}
            />
          </div>

          {/* Dynamic Save button */}
          <div className="space-y-3 pt-6 animate-none">
            <Button
              onClick={() => {
                if (!customTimeInput) {
                  showToast("Please choose or specify a safe slot.");
                  return;
                }
                onSaveTime();
              }}
              variant="primary"
              className="w-full h-15 bg-primary shadow-lg"
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Confirm detail
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs font-bold text-on-surface-variant"
              onClick={onBack}
            >
              Back to overview
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 5. SAVED SUCCESS SCREEN
// ============================================================================
interface SavedSuccessScreenProps {
  onContinue: () => void;
}

export const SavedSuccessScreen: React.FC<SavedSuccessScreenProps> = ({ onContinue }) => {
  return (
    <motion.div
      key="SavedSuccess"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 h-[100dvh] max-h-[100dvh] z-50 flex flex-col items-center justify-between text-center p-6 md:p-8 bg-neutral-background overflow-hidden"
    >
      {/* Soft Glow behind Mascot */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-400/20 rounded-full blur-[80px] animate-pulse" />

      <div />

      <div className="flex flex-col items-center gap-4 sm:gap-6 select-none animate-none justify-center min-h-0 flex-grow">
        <YuraMascot mood="celebrating" size="lg" className="ambient-glow rounded-3xl scale-90 sm:scale-100" />
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-2xl font-black text-[#7a5362]">Promises Saved!</h2>
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant max-w-[280px] leading-relaxed">
            Yura will keep watch and gently remind you until you check in.
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs pt-3 sm:pt-4 animate-none pb-2">
        <Button
          variant="primary"
          className="w-full py-3.5 sm:py-4 select-none"
          onClick={onContinue}
        >
          Go to promises
        </Button>
      </div>
    </motion.div>
  );
};
