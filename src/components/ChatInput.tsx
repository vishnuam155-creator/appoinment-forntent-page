import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformAnimation from "./WaveformAnimation";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

const ChatInput = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  disabled = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Simulate voice activity detection
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setIsVoiceActive((prev) => !prev);
      }, 800);
      return () => clearInterval(interval);
    }
    setIsVoiceActive(false);
  }, [isRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-3">
        {/* Textarea Container */}
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95 rounded-2xl border-2 border-primary backdrop-blur-sm z-10 animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <WaveformAnimation isActive={isVoiceActive} />
                <p className={cn(
                  "text-sm font-medium animate-pulse transition-colors duration-300",
                  isVoiceActive ? "text-green-500" : "text-red-500"
                )}>
                  {isVoiceActive ? "Listening..." : "Speak now..."}
                </p>
              </div>
            </div>
          )}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={disabled || isRecording}
            className={cn(
              "resize-none min-h-[60px] max-h-[120px] rounded-2xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20 text-center px-6 py-3",
              "placeholder:animate-pulse placeholder:transition-all placeholder:duration-500",
              "focus:placeholder:opacity-50 transition-all duration-300",
              message && "animate-fade-in"
            )}
            rows={2}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            size="lg"
            variant={isRecording ? "destructive" : "ghost"}
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled}
            className={cn(
              "h-14 w-14 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105",
              isRecording 
                ? "bg-destructive hover:bg-destructive/90 ring-4 ring-destructive/20" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isRecording ? (
              <Square className="w-5 h-5" fill="currentColor" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            type="submit"
            size="lg"
            disabled={!message.trim() || disabled || isRecording}
            className={cn(
              "h-14 px-8 rounded-full transition-all duration-300 shadow-lg gap-2",
              message.trim() && !disabled && !isRecording
                ? "bg-primary hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                : "opacity-50"
            )}
          >
            <Send className="w-5 h-5" />
            <span className="font-medium">Send</span>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
