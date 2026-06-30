import { useEffect, useRef, useState } from 'react';

interface SamsungActivityHeartProps {
    stepsProgress: number; // 0 to 1
    activeProgress: number; // 0 to 1
    caloriesProgress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
}

export function SamsungActivityHeart({
    stepsProgress,
    activeProgress,
    caloriesProgress,
    size = 180,
    strokeWidth = 6.5,
    centerLabel = "Fit"
}: SamsungActivityHeartProps) {
    const [lengths, setLengths] = useState([200, 160, 120]);
    const outerRef = useRef<SVGPathElement>(null);
    const middleRef = useRef<SVGPathElement>(null);
    const innerRef = useRef<SVGPathElement>(null);

    // Dynamic path length measurement on mount for smooth stroke animation
    useEffect(() => {
        if (outerRef.current && middleRef.current && innerRef.current) {
            setLengths([
                outerRef.current.getTotalLength(),
                middleRef.current.getTotalLength(),
                innerRef.current.getTotalLength()
            ]);
        }
    }, []);

    // Clamp progress between 0 and 1
    const pSteps = Math.min(Math.max(stepsProgress, 0), 1);
    const pActive = Math.min(Math.max(activeProgress, 0), 1);
    const pCal = Math.min(Math.max(caloriesProgress, 0), 1);

    // Calculate offsets
    const offsetOuter = lengths[0] * (1 - pSteps);
    const offsetMiddle = lengths[1] * (1 - pActive);
    const offsetInner = lengths[2] * (1 - pCal);

    // Concentric Heart SVG Paths (scaled around center 50, 56)
    const pathOuter = "M 50,23 C 45,13 30,13 20,23 C 10,33 10,49 20,59 L 50,89 L 80,59 C 90,49 90,33 80,23 C 70,13 55,13 50,23 Z";
    const pathMiddle = "M 50,29.6 C 46,21.6 34,21.6 26,29.6 C 18,37.6 18,50.4 26,58.4 L 50,82.4 L 74,58.4 C 82,50.4 82,37.6 74,29.6 C 66,21.6 54,21.6 50,29.6 Z";
    const pathInner = "M 50,36.2 C 47,30.2 38,30.2 32,36.2 C 26,42.2 26,51.8 32,57.8 L 50,75.8 L 68,57.8 C 74,51.8 74,42.2 68,36.2 C 62,30.2 53,30.2 50,36.2 Z";

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                className="absolute overflow-visible drop-shadow-[0_0_12px_rgba(60,207,148,0.15)]"
            >
                {/* ── Outer Ring: Steps Track & Progress ── */}
                <path
                    d={pathOuter}
                    fill="none"
                    stroke="#1e2925"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <path
                    ref={outerRef}
                    d={pathOuter}
                    fill="none"
                    stroke="var(--color-steps)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={lengths[0]}
                    strokeDashoffset={offsetOuter}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />

                {/* ── Middle Ring: Active Time Track & Progress ── */}
                <path
                    d={pathMiddle}
                    fill="none"
                    stroke="#162530"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <path
                    ref={middleRef}
                    d={pathMiddle}
                    fill="none"
                    stroke="var(--color-active)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={lengths[1]}
                    strokeDashoffset={offsetMiddle}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s' }}
                />

                {/* ── Inner Ring: Calories Burned Track & Progress ── */}
                <path
                    d={pathInner}
                    fill="none"
                    stroke="#2a1b22"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <path
                    ref={innerRef}
                    d={pathInner}
                    fill="none"
                    stroke="var(--color-calories)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={lengths[2]}
                    strokeDashoffset={offsetInner}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s' }}
                />
            </svg>
            
            {/* Ambient center design elements */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1 select-none">
                <div className="flex gap-1 items-baseline">
                    <span className="text-[20px] font-black text-white leading-none">
                        {Math.round(pSteps * 100)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold leading-none">%</span>
                </div>
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{centerLabel}</span>
            </div>
        </div>
    );
}
