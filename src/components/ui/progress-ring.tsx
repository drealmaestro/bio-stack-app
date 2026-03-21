interface ProgressRingProps {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0 to 1
    color?: string;
    trackColor?: string;
    label?: string;
    sublabel?: string;
    children?: React.ReactNode;
}

export function ProgressRing({
    size = 120,
    strokeWidth = 10,
    progress,
    color = '#00D4FF',
    trackColor = 'rgba(255,255,255,0.05)',
    label,
    sublabel,
    children,
}: ProgressRingProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - clampedProgress);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
                className="absolute"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            {/* Center content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
                {children ?? (
                    <>
                        {label && <span className="font-black text-white leading-tight" style={{ fontSize: size * 0.16 }}>{label}</span>}
                        {sublabel && <span className="text-muted-foreground leading-tight" style={{ fontSize: size * 0.1 }}>{sublabel}</span>}
                    </>
                )}
            </div>
        </div>
    );
}
