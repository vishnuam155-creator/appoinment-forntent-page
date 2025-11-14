import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatOptions from "@/components/ChatOptions";
import { AudioRecorder } from "@/utils/audioRecorder";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";
import { sendChatMessage, speechToText } from "@/services/api";
import type { ChatOption } from "@/types/api";

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
  const [conversationId, setConversationId] = useState<string>("");
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, options]);

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
      // Send message to backend API
      const data = await sendChatMessage({
        message: content,
        conversation_id: conversationId || undefined,
      });

      // Debug: Log the full response to see what backend returns
      console.log('Backend response:', data);
      console.log('Response structure:', JSON.stringify(data, null, 2));

      // Store conversation ID for subsequent messages
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Try different possible response field names
      const responseText = data.response ||
                          data.message ||
                          data.reply ||
                          data.text ||
                          data.content ||
                          (typeof data === 'string' ? data : null) ||
                          JSON.stringify(data);

      console.log('Extracted response text:', responseText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Update options if provided by backend
      if (data.options && Array.isArray(data.options)) {
        console.log('Received options:', data.options);
        setOptions(data.options);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the backend. Please make sure the backend server is running at http://127.0.0.1:8000",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setOptions([]); // Clear options on error

      toast({
        title: "Connection Error",
        description: "Failed to connect to backend API. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectOption = async (value: string, label: string) => {
    // Clear options immediately when one is selected
    setOptions([]);

    // Send the selected option as a message
    await handleSendMessage(value);
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

      try {
        // Convert speech to text using backend API
        const transcription = await speechToText({
          audio_data: audioBlob,
          language: "en",
          format: "wav",
        });

        // Add user message with transcribed text
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: transcription.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send transcribed text to chatbot
        await handleSendMessage(transcription.text);
      } catch (error) {
        console.error("Error processing voice:", error);
        toast({
          title: "Voice Processing Error",
          description: "Failed to convert speech to text. Make sure the backend is running.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
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
          {options.length > 0 && (
            <div className="mt-4">
              <ChatOptions
                options={options}
                onSelectOption={handleSelectOption}
                disabled={isProcessing}
              />
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
