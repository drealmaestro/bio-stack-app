import { useState, useEffect } from "react";

interface AnimatedNumberProps {
    value: number;
    formatter?: (val: number) => string | number;
}

export function AnimatedNumber({ value, formatter }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let startTime: number;
        const duration = 1500;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            // Ease out quart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setDisplay(value * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <>{formatter ? formatter(display) : Math.round(display)}</>;
}
