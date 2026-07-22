import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import type { RestTimerWorkerInput, RestTimerWorkerOutput } from "../workers/restTimerWorker";

export function playChimeTone(): void {
    try {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);

        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
    } catch {
        // Safe fallback if Web Audio is unsupported or blocked by autoplay
    }
}

export function sendRestNotification(
    title = 'Rest Timer Complete!',
    body = 'Time for your next set!'
): void {
    try {
        if (typeof window !== 'undefined' && typeof Notification !== 'undefined') {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' });
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification(title, { body, icon: '/favicon.ico' });
                    }
                }).catch(() => {});
            }
        }
    } catch {
        // Safe fallback if Notifications are denied or unsupported
    }
}

export function useRestTimer() {
    const { activeWorkout, addRestTime, skipRest: storeSkipRest } = useStore();
    const [now, setNow] = useState(Date.now());
    const originalRestRef = useRef<number>(0);
    const hasAlertedRef = useRef<boolean>(false);
    const workerRef = useRef<Worker | null>(null);

    const restEndTime = activeWorkout?.restEndTime ?? null;
    const isResting = restEndTime ? restEndTime > now : false;

    const restSecondsRemaining = isResting && restEndTime
        ? Math.ceil((restEndTime - now) / 1000)
        : 0;

    // Web Worker initialization
    useEffect(() => {
        if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
            try {
                const worker = new Worker(new URL('../workers/restTimerWorker.ts', import.meta.url), {
                    type: 'module',
                });
                workerRef.current = worker;

                worker.onmessage = (event: MessageEvent<RestTimerWorkerOutput>) => {
                    const data = event.data;
                    if (data?.type === 'TICK') {
                        setNow(data.now || Date.now());
                    } else if (data?.type === 'COMPLETE') {
                        setNow(Date.now());
                    }
                };

                return () => {
                    worker.postMessage({ type: 'STOP' } satisfies RestTimerWorkerInput);
                    worker.terminate();
                    workerRef.current = null;
                };
            } catch {
                workerRef.current = null;
            }
        }
    }, []);

    // Timer interval fallback & worker dispatch
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (restEndTime && restEndTime > Date.now()) {
            if (workerRef.current) {
                workerRef.current.postMessage({
                    type: 'START',
                    endTime: restEndTime,
                } satisfies RestTimerWorkerInput);
            } else {
                interval = setInterval(() => {
                    setNow(Date.now());
                }, 1000);
            }
        } else if (workerRef.current) {
            workerRef.current.postMessage({ type: 'STOP' } satisfies RestTimerWorkerInput);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [restEndTime]);

    // Handle timer expiration alerts & track original duration
    useEffect(() => {
        if (isResting && restEndTime) {
            if (restSecondsRemaining > originalRestRef.current || originalRestRef.current === 0) {
                originalRestRef.current = restSecondsRemaining;
            }
            hasAlertedRef.current = false;
        } else if (!isResting) {
            if (originalRestRef.current > 0 && !hasAlertedRef.current) {
                hasAlertedRef.current = true;
                playChimeTone();
                sendRestNotification();
            }
            originalRestRef.current = 0;
        }
    }, [isResting, restEndTime, restSecondsRemaining]);

    const skipRest = () => {
        hasAlertedRef.current = true;
        originalRestRef.current = 0;
        storeSkipRest();
    };

    const restProgress = originalRestRef.current > 0
        ? restSecondsRemaining / originalRestRef.current
        : 1;

    return {
        isResting,
        restSecondsRemaining,
        restProgress,
        addRestTime,
        skipRest,
    };
}
