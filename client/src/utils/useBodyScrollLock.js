import { useEffect } from "react";

const LOCK_COUNT_KEY = "prScrollLockCount";
const PREV_OVERFLOW_KEY = "prPrevBodyOverflow";

export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const { body } = document;
    const currentCount = Number(body.dataset[LOCK_COUNT_KEY] || "0");

    if (currentCount === 0) {
      body.dataset[PREV_OVERFLOW_KEY] = body.style.overflow || "";
      body.style.overflow = "hidden";
    }

    body.dataset[LOCK_COUNT_KEY] = String(currentCount + 1);

    return () => {
      const activeCount = Number(body.dataset[LOCK_COUNT_KEY] || "1");
      const nextCount = Math.max(0, activeCount - 1);

      if (nextCount === 0) {
        body.style.overflow = body.dataset[PREV_OVERFLOW_KEY] || "";
        delete body.dataset[PREV_OVERFLOW_KEY];
        delete body.dataset[LOCK_COUNT_KEY];
      } else {
        body.dataset[LOCK_COUNT_KEY] = String(nextCount);
      }
    };
  }, [locked]);
}