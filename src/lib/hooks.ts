import { useEffect, useRef, useState } from 'react';

/** Countdown that freezes when `running` is false and resets when `resetKey` changes. */
export function useCountdown(
  total: number,
  running: boolean,
  onExpire: () => void,
  resetKey: string | number = 'default',
) {
  const [remaining, setRemaining] = useState(total);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(total);
    firedRef.current = false;
  }, [total, resetKey]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [running, remaining]);

  useEffect(() => {
    if (running && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      onExpireRef.current();
    }
  }, [remaining, running]);

  return remaining;
}

/** Elapsed seconds that stop while paused. */
export function useElapsed(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return seconds;
}
