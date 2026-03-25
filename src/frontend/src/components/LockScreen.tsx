import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Task } from "../backend";
import ProofModal from "./ProofModal";

interface Props {
  task: Task;
  onUnlocked: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LockScreen({ task, onUnlocked }: Props) {
  const totalSeconds = Number(task.durationMinutes) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [showProof, setShowProof] = useState(false);

  const halfwayReached = secondsLeft <= totalSeconds / 2;
  const timerDone = secondsLeft <= 0;
  const canSubmit = halfwayReached || timerDone;

  // Fullscreen
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  // Block back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleUnlocked = useCallback(() => {
    setShowProof(false);
    onUnlocked();
  }, [onUnlocked]);

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        style={{ minHeight: "100dvh" }}
        data-ocid="lock_screen.panel"
      >
        {/* Pulsing background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-96 h-96 rounded-full border border-primary/20 animate-pulse-ring"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute w-72 h-72 rounded-full border border-primary/15 animate-pulse-ring"
            style={{ animationDelay: "0.8s" }}
          />
          <div
            className="absolute w-52 h-52 rounded-full border border-primary/10 animate-pulse-ring"
            style={{ animationDelay: "1.6s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full text-center">
          {/* Lock icon */}
          <motion.div
            animate={{ scale: timerDone ? [1, 1.15, 1] : 1 }}
            transition={{
              repeat: timerDone ? Number.POSITIVE_INFINITY : 0,
              duration: 1.5,
            }}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30"
          >
            {timerDone ? (
              <ShieldCheck className="h-9 w-9 text-primary" />
            ) : (
              <Lock className="h-9 w-9 text-primary" />
            )}
          </motion.div>

          {/* Task info */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {task.title}
            </h1>
            {task.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Timer */}
          <div className="space-y-3 w-full">
            <motion.div
              animate={{ scale: secondsLeft > 0 ? [1, 1.02, 1] : 1 }}
              transition={{
                repeat: secondsLeft > 0 ? Number.POSITIVE_INFINITY : 0,
                duration: 1,
                ease: "easeInOut",
              }}
              className="font-display text-7xl font-bold tabular-nums"
              style={{
                color: timerDone
                  ? "oklch(0.65 0.18 160)"
                  : halfwayReached
                    ? "oklch(0.75 0.18 80)"
                    : "oklch(var(--foreground))",
                textShadow: timerDone
                  ? "0 0 32px oklch(0.65 0.18 160 / 0.5)"
                  : "none",
              }}
            >
              {formatTime(secondsLeft)}
            </motion.div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: timerDone
                    ? "oklch(0.65 0.18 160)"
                    : "oklch(var(--primary))",
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {timerDone
                ? "Time's up! Submit your proof to unlock."
                : halfwayReached
                  ? "You can submit proof now or keep going."
                  : `Submit proof available after ${formatTime(Math.ceil(totalSeconds / 2))}`}
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => setShowProof(true)}
            disabled={!canSubmit}
            className="w-full rounded-pill text-base py-6 gap-2 shadow-glow"
            size="lg"
            data-ocid="lock_screen.primary_button"
          >
            <ShieldCheck className="h-5 w-5" />
            Submit Proof &amp; Unlock
          </Button>

          {!canSubmit && (
            <p className="text-xs text-muted-foreground -mt-4">
              Your phone is locked until you prove you're done.
            </p>
          )}
        </div>

        {showProof && (
          <ProofModal
            open={showProof}
            taskId={task.id}
            onSuccess={handleUnlocked}
            onClose={() => setShowProof(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
