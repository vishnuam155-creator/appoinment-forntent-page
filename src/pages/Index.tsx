import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { AudioRecorder } from "@/utils/audioRecorder";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with text and voice conversations. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "Response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Fallback response when API is not available
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm a demo chatbot. To enable real AI responses, you'll need to set up the backend API endpoint.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      toast({
        title: "API unavailable",
        description: "Using demo mode. Connect a backend to enable real responses.",
        variant: "default",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      audioRecorderRef.current = new AudioRecorder();
      await audioRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak now...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    if (!audioRecorderRef.current) return;

    try {
      const audioBlob = await audioRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      toast({
        title: "Processing audio",
        description: "Converting speech to text...",
      });

      // Simulate voice processing (replace with actual API call)
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: "[Voice message - transcription would appear here]",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I heard your voice message! To enable voice transcription and AI responses, you'll need to connect speech-to-text and AI services.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsProcessing(false);
        }, 1000);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process recording",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isProcessing && (
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card shadow-lg">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isRecording={isRecording}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
