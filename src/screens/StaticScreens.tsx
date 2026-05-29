import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ScreenLayout } from "../components/layout/ScreenLayout";
import { YuraMascot } from "../components/brand/YuraMascot";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export const StartupSplashScreen: React.FC = () => {
  return (
    <motion.div
      key="StartupSplash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 h-[100dvh] max-h-[100dvh] z-50 flex flex-col items-center justify-center text-center p-6 md:p-8 bg-neutral-background relative overflow-hidden"
    >
      {/* Ambient Background blur glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-container/30 rounded-full blur-[90px] animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-secondary-container/25 rounded-full blur-[80px]" />
      </div>
      
      <div className="flex flex-col items-center gap-6">
        <YuraMascot mood="wink" size="lg" className="ambient-glow rounded-full transition-transform duration-500" />
        <div className="space-y-3 mt-4">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Promise Yura</h1>
          <p className="text-xs font-bold tracking-widest text-[#797582] uppercase select-none">Your Focus-Friendly Companion</p>
          
          {/* Animated awake indicator */}
          <div className="py-2 flex flex-col items-center justify-center select-none">
            <p className="text-xs text-[#5f52a6] font-extrabold tracking-wider animate-pulse flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5f52a6] animate-ping" />
              Yura is waking up...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  return (
    <motion.div
      key="Splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 h-[100dvh] max-h-[100dvh] z-50 flex flex-col items-center justify-between text-center p-6 md:p-8 bg-neutral-background relative overflow-hidden"
    >
      {/* Ambient Background blur glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 animate-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-container/30 rounded-full blur-[90px] animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-secondary-container/25 rounded-full blur-[80px]" />
      </div>

      <div />
      
      <div className="flex flex-col items-center gap-6">
        <YuraMascot mood="normal" size="lg" className="ambient-glow rounded-full" />
        <div className="space-y-2 mt-4">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">Promise Yura</h1>
          <p className="text-sm font-bold tracking-widest text-[#797582] uppercase">Your Focus-Friendly Companion</p>
          
          {/* Animated awake indicator */}
          <div className="py-3 flex flex-col items-center justify-center select-none">
            <p className="text-xs text-primary font-bold tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5f52a6] animate-ping" />
              Yura is waking up...
            </p>
          </div>

          <p className="text-xs text-[#797582]/70 max-w-[280px] leading-relaxed mx-auto">
            Say messy thoughts, Yura turns them into gentle reminders and helps you keep them without stress.
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <Button
          variant="primary"
          className="w-full text-base py-5 h-16 rounded-full"
          onClick={onGetStarted}
        >
          Get Started
        </Button>
        <p className="text-[11px] text-[#797582]/60">Developed with care for focused clarity</p>
      </div>
    </motion.div>
  );
};

interface OnboardingScreenProps {
  activeSlide: number;
  onSetSlide: (slide: number) => void;
  onSkip: () => void;
  onDone: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  activeSlide,
  onSetSlide,
  onSkip,
  onDone,
}) => {
  if (activeSlide === 0) {
    return (
      <motion.div
        key="Onboarding-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-[100dvh] w-full overflow-hidden"
      >
        <ScreenLayout
          fullScreen={true}
          headerProps={{
            title: "Step 1 of 3",
            onSkip: onSkip,
          }}
        >
          <div className="flex-grow flex flex-col items-center justify-between min-h-0 pb-2 pt-1 relative">
            
            <div className="text-center max-w-[340px] z-10 mt-2 space-y-1">
              <h2 className="text-2xl font-bold text-primary">Say it messy</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Rambling, forgetting, or changing your mind is okay. Yura will catch the promise.
              </p>
            </div>

            {/* Mascot Visual Section with messy speech bubbles */}
            <div className="relative flex items-center justify-center w-full h-[220px] sm:h-[260px] md:h-[320px] my-2 sm:my-4 select-none">
              <div className="absolute top-[8%] left-[2%] z-20 glass-card rounded-xl px-4 py-2 text-xs text-primary font-bold shadow-sm animate-bounce duration-5000">
                "don't forget..."
              </div>
              <div className="absolute top-[18%] right-[2%] z-20 glass-card rounded-xl px-4 py-2 text-xs text-tertiary font-bold shadow-sm animate-bounce duration-6000 delay-1000">
                "maybe tomorrow..."
              </div>
              <div className="absolute bottom-[20%] left-[2%] z-20 glass-card rounded-xl px-4 py-2 text-xs text-secondary font-bold shadow-sm animate-bounce duration-4000 delay-2000">
                "I need to..."
              </div>
              <div className="absolute bottom-[8%] right-[8%] z-20 glass-card rounded-xl px-4 py-2 text-xs text-primary/70 font-bold shadow-sm animate-bounce duration-5000 delay-3000">
                "pick up some..."
              </div>

              <YuraMascot mood="question" src="/yura-question.png" size="lg" className="z-10 scale-[0.75] sm:scale-[0.85] opacity-95" />
            </div>

            {/* Progress Dots */}
            <div className="flex flex-col items-center gap-4 w-full animate-none">
              <div className="flex gap-2">
                <div className="w-8 h-2 rounded-full bg-primary shadow-sm transition-all" />
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
              </div>

              {/* Bottom Nav indicators inside footer zone */}
              <div className="w-full flex justify-end items-center px-4">
                <Button
                  variant="primary"
                  onClick={() => onSetSlide(1)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>

          </div>
        </ScreenLayout>
      </motion.div>
    );
  }

  if (activeSlide === 1) {
    return (
      <motion.div
        key="Onboarding-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-[100dvh] w-full overflow-hidden"
      >
        <ScreenLayout
          fullScreen={true}
          headerProps={{
            title: "Step 2 of 3",
            onSkip: onSkip,
          }}
        >
          <div className="flex-grow flex flex-col items-center justify-between min-h-0 pb-2 pt-1 relative">
            
            <div className="text-center max-w-[340px] z-10 mt-2 space-y-1">
              <h2 className="text-2xl font-bold text-primary">Yura organizes it</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your messy thoughts become clear promise cards, checklists, and reminders.
              </p>
            </div>

            {/* Organizes Cards Stack Visualizer */}
            <div className="w-full space-y-2.5 my-3 sm:my-6 select-none">
              <div className="glass-card p-4 rounded-xl soft-glow-lavender flex items-center gap-4 border-l-4 border-l-primary-container transform rotate-[-1deg] translate-y-1">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-grow text-left">
                  <p className="text-sm font-bold text-on-surface">Call Mom at 5 PM</p>
                  <Badge color="primary" className="mt-1 text-[10px]">FAMILY</Badge>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl soft-glow-lavender flex items-center gap-4 border-l-4 border-l-secondary-container transform rotate-[1deg] translate-x-1.5">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-grow text-left">
                  <p className="text-sm font-bold text-on-surface">Pick up dry cleaning</p>
                  <Badge color="secondary" className="mt-1 text-[10px]">URGENT</Badge>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl soft-glow-lavender flex items-center gap-4 border-l-4 border-l-tertiary-container transform rotate-[-2deg] -translate-y-1">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-tertiary" />
                </div>
                <div className="flex-grow text-left">
                  <p className="text-sm font-bold text-on-surface">Drink more water</p>
                  <Badge color="tertiary" className="mt-1 text-[10px]">Every 2 hours</Badge>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex flex-col items-center gap-4 w-full animate-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
                <div className="w-8 h-2 rounded-full bg-primary shadow-sm transition-all animate-none" />
                <div className="w-2 h-2 rounded-full bg-surface-variant" />
              </div>

              <div className="w-full flex justify-between items-center px-4 animate-none">
                <Button variant="ghost" onClick={() => onSetSlide(0)}>
                  <ArrowLeft className="mr-1 w-4 h-4" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onSetSlide(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>

          </div>
        </ScreenLayout>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="Onboarding-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[100dvh] w-full overflow-hidden"
    >
      <ScreenLayout
        fullScreen={true}
        headerProps={{
          title: "Step 3 of 3",
          onSkip: onSkip,
        }}
      >
        <div className="flex-grow flex flex-col items-center justify-between min-h-0 pb-2 pt-1 relative">
          
          <div className="text-center max-w-[340px] z-10 mt-2 space-y-1">
            <h2 className="text-2xl font-bold text-primary">Check in to keep it</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Yura will gently nudge you until you confirm the promise is done.
            </p>
          </div>

          {/* Stacked Interactive elements center zone */}
          <div className="relative w-[280px] bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-white/60 flex flex-col items-center my-3 sm:my-6 select-none animate-none">
            <div className="w-14 h-14 bg-primary-fixed/60 rounded-full flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-primary font-bold" />
            </div>
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-creamLight rounded-xl">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="h-2 w-16 bg-outline-variant/60 rounded-full mb-1" />
                  <div className="h-1.5 w-10 bg-outline-variant/30 rounded-full" />
                </div>
              </div>
              <Button variant="primary" className="w-full text-xs py-3 rounded-full cursor-not-allowed">
                Check in
              </Button>
            </div>
          </div>

          {/* Progress Indicators & Action trigger to Login */}
          <div className="flex flex-col items-center gap-4 w-full animate-none">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
              <div className="w-8 h-2 rounded-full bg-primary shadow-sm transition-all" />
            </div>

            <div className="w-full flex justify-between items-center px-4 animate-none">
              <Button variant="ghost" onClick={() => onSetSlide(1)}>
                <ArrowLeft className="mr-1 w-4 h-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={onDone}
                rightIcon={<Rocket className="w-4 h-4" />}
              >
                Start
              </Button>
            </div>
          </div>

        </div>
      </ScreenLayout>
    </motion.div>
  );
};
