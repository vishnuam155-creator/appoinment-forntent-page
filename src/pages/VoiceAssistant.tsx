import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendVoiceAssistantRequest } from "@/services/api";

interface Message {
  type: "user" | "bot";
  content: string;
}

const VoiceAssistant = () => {
  const [status, setStatus] = useState("Click 'Start' to begin");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", content: "Hello! I'm MediBot, your voice medical assistant. Click 'Start' and I'll help you book an appointment." }
  ]);
  const [transcript, setTranscript] = useState("...");
  const [sessionId, setSessionId] = useState<string>("");  // Backend uses session_id
  const [showCaptions, setShowCaptions] = useState(false);  // Toggle for caption visibility
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startVoiceAssistant = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript((finalTranscript + interimTranscript).trim() || "...");

      if (finalTranscript.trim()) {
        setTimeout(() => {
          processSpeech(finalTranscript.trim());
        }, 1500);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' && isListening) {
        recognitionRef.current?.start();
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }, 100);
      } else {
        setStatus("Click 'Start' to begin");
      }
    };

    recognitionRef.current.start();
    
    setMessages(prev => [...prev, { 
      type: "bot", 
      content: "I'm listening! Tell me about your symptoms or when you'd like to book an appointment." 
    }]);
  };

  const stopVoiceAssistant = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setStatus("Stopped");
    setTranscript("...");
  };

  const processSpeech = async (message: string) => {
    if (!message || message.trim() === '') return;

    setMessages(prev => [...prev, { type: "user", content: message }]);
    setStatus("Processing...");
    setTranscript("...");

    try {
      // Send message to voice assistant backend API with correct field names
      const response = await sendVoiceAssistantRequest({
        message: message,                    // Backend expects 'message', not 'text'
        session_id: sessionId || undefined,  // Backend uses session_id
      });

      // Check if request was successful
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }

      // Store session ID for subsequent messages (backend uses session_id)
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      // Backend returns 'message' field, not 'text_response'
      const botResponse = response.message || response.text_response || "I'm here to help you!";
      setMessages(prev => [...prev, { type: "bot", content: botResponse }]);
      speak(botResponse);
      setStatus("Listening...");
    } catch (error) {
      console.error("Error processing speech:", error);
      const fallbackResponse = "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running at http://127.0.0.1:8000";
      setMessages(prev => [...prev, { type: "bot", content: fallbackResponse }]);
      speak(fallbackResponse);
      setStatus("Listening...");

      toast({
        title: "Connection Error",
        description: "Failed to connect to voice assistant API.",
        variant: "destructive",
      });
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startNewConversation = () => {
    stopVoiceAssistant();
    setMessages([
      { type: "bot", content: "Hello! I'm MediBot, your voice medical assistant. Click 'Start' and I'll help you book an appointment." }
    ]);
    setSessionId("");
    setTranscript("...");
    setShowCaptions(false);
    setStatus("Click 'Start' to begin");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#667eea] to-[#764ba2] overflow-hidden relative p-5">
      {/* Heading */}
      <h1 className="text-white text-4xl font-bold mb-4 drop-shadow-lg">
        MediBot Voice Assistant
      </h1>
      <p className="text-white/90 text-lg mb-12 drop-shadow">
        {isListening ? 'Listening to your voice...' : 'Click START to begin conversation'}
      </p>

      {/* Mic Animation */}
      <div className="w-[250px] h-[250px] mx-auto mb-12 relative flex justify-center items-center">
        <div className="absolute w-full h-full rounded-full bg-white opacity-20 animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="absolute w-[85%] h-[85%] rounded-full bg-white opacity-15 animate-[pulse_2s_ease-in-out_infinite_0.3s]" />
        <div className="absolute w-[70%] h-[70%] rounded-full bg-white opacity-10 animate-[pulse_2s_ease-in-out_infinite_0.6s]" />
        <div className={`relative z-10 text-8xl transition-all duration-300 ${isListening ? 'animate-[glow_1.5s_ease-in-out_infinite]' : ''}`}>
          🎤
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 items-center mb-8 w-full max-w-md">
        <div className="flex gap-4 w-full">
          <button
            onClick={startVoiceAssistant}
            disabled={isListening}
            className="flex-1 px-8 py-4 rounded-lg bg-white text-[#667eea] text-lg font-bold uppercase tracking-wide cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            START
          </button>
          <button
            onClick={stopVoiceAssistant}
            disabled={!isListening}
            className="flex-1 px-8 py-4 rounded-lg bg-white/20 text-white text-lg font-bold uppercase tracking-wide cursor-pointer transition-all duration-300 hover:bg-white/30 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            PAUSE
          </button>
        </div>

        <button
          onClick={startNewConversation}
          className="w-full px-8 py-3 rounded-lg bg-red-500/90 text-white text-base font-semibold uppercase tracking-wide cursor-pointer transition-all duration-300 hover:bg-red-600 hover:translate-y-[-2px] shadow-lg"
        >
          NEW CONVERSATION
        </button>

        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className="w-full px-8 py-3 rounded-lg bg-white/10 text-white text-base font-semibold uppercase tracking-wide cursor-pointer transition-all duration-300 hover:bg-white/20 hover:translate-y-[-2px] backdrop-blur-sm border border-white/30"
        >
          {showCaptions ? 'HIDE CAPTIONS' : 'SHOW CAPTIONS'}
        </button>
      </div>

      {/* Captions Panel (Only shown when toggled) */}
      {showCaptions && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-[30px] p-6 max-h-[50vh] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease]">
          {/* Message Display */}
          <div className="mb-4 max-h-[200px] overflow-y-auto">
            <h3 className="text-[#667eea] font-bold mb-3 text-lg">Conversation:</h3>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 p-3 rounded-lg animate-[slideIn_0.3s_ease] ${
                  msg.type === 'user'
                    ? 'bg-[#667eea] text-white ml-[20%] text-right'
                    : 'bg-[#e2e8f0] text-[#334155] mr-[20%]'
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Transcript */}
          {isListening && (
            <div className="bg-[#f8fafc] rounded-[15px] p-4 text-left border-2 border-[#667eea]">
              <div className="font-semibold text-[#667eea] mb-1">You're saying:</div>
              <div className="text-[#475569]">{transcript}</div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)); }
          50% { filter: drop-shadow(0 0 40px rgba(255, 255, 255, 1)); }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
