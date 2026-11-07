type Props = {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
};

export function ProgressRing({
  value,
  size = 56,
  stroke = 4,
  color = '#2dd4bf',
  track = 'rgba(255,255,255,0.12)',
  className = '',
  children,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.22,0.8,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
