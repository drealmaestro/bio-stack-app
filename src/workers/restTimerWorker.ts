// src/workers/restTimerWorker.ts
// Web Worker for background rest timer countdown / interval ticks

export type RestTimerWorkerInput =
    | { type: 'START'; endTime: number }
    | { type: 'STOP' };

export type RestTimerWorkerOutput =
    | { type: 'TICK'; remaining: number; now: number }
    | { type: 'COMPLETE' };

let timerId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (event: MessageEvent<RestTimerWorkerInput>) => {
    const data = event.data;
    if (!data) return;

    if (data.type === 'START' && typeof data.endTime === 'number') {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }

        const tick = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((data.endTime - now) / 1000));

            self.postMessage({
                type: 'TICK',
                remaining,
                now,
            } as RestTimerWorkerOutput);

            if (remaining <= 0) {
                if (timerId) {
                    clearInterval(timerId);
                    timerId = null;
                }
                self.postMessage({
                    type: 'COMPLETE',
                } as RestTimerWorkerOutput);
            }
        };

        tick();
        timerId = setInterval(tick, 1000);
    } else if (data.type === 'STOP') {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }
};

export {};
