import { useEffect, useRef, useState } from "react";

export interface UseDelayedNotificationPromptReturn {
  visible: boolean;
  dismiss: () => void;
}

const PROMPT_DELAY_MS = 75_000;
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

export const useDelayedNotificationPrompt = (): UseDelayedNotificationPromptReturn => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const dismissedUntilRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const schedulePrompt = () => {
      clearTimer();

      if (typeof Notification === "undefined") {
        setVisible(false);

        return;
      }

      if (Notification.permission !== "default") {
        setVisible(false);

        return;
      }

      if (Date.now() < dismissedUntilRef.current) {
        setVisible(false);

        return;
      }

      if (
        document.visibilityState !== "visible" ||
        !document.hasFocus()
      ) {
        setVisible(false);

        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        setVisible(true);
      }, PROMPT_DELAY_MS);
    };

    schedulePrompt();

    window.addEventListener("focus", schedulePrompt);
    document.addEventListener(
      "visibilitychange",
      schedulePrompt
    );

    return () => {
      clearTimer();
      window.removeEventListener(
        "focus",
        schedulePrompt
      );
      document.removeEventListener(
        "visibilitychange",
        schedulePrompt
      );
    };
  }, []);

  const dismiss = () => {
    dismissedUntilRef.current =
      Date.now() + DISMISS_DURATION_MS;
    setVisible(false);
  };

  return {
    visible,
    dismiss,
  };
};

export default useDelayedNotificationPrompt;
