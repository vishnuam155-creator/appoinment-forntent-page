import { cn } from "@/lib/utils";

interface WaveformAnimationProps {
  className?: string;
  isActive?: boolean;
}

const WaveformAnimation = ({ className, isActive = true }: WaveformAnimationProps) => {
  const bars = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {bars.map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full animate-pulse transition-colors duration-300",
            isActive ? "bg-green-500" : "bg-red-500"
          )}
          style={{
            height: '20px',
            animation: `waveform 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformAnimation;
