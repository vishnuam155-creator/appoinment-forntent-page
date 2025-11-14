import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const processSpeech = (message: string) => {
    if (!message || message.trim() === '') return;

    setMessages(prev => [...prev, { type: "user", content: message }]);
    setStatus("Processing...");
    setTranscript("...");

    // Simulate AI response
    setTimeout(() => {
      const response = "I understand you need to book an appointment. Let me help you with that. What date would you prefer?";
      setMessages(prev => [...prev, { type: "bot", content: response }]);
      speak(response);
      setStatus("Listening...");
    }, 1500);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#667eea] to-[#764ba2] overflow-hidden">
      <div className="w-full max-w-[600px] p-5 text-center">
        <div className="bg-[rgba(255,255,255,0.95)] rounded-[30px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <h1 className="text-[#667eea] text-3xl mb-2.5">🤖 MediBot Voice Assistant</h1>
          <p className="text-[#666] text-base mb-8">Your AI-Powered Medical Appointment Booking Assistant</p>

          {/* Wave Animation */}
          <div className="w-[200px] h-[200px] mx-auto mb-8 relative flex justify-center items-center">
            <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-40 animate-[pulse_2s_ease-in-out_infinite]" />
            <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-30 animate-[pulse_2s_ease-in-out_infinite_0.3s]" />
            <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-20 animate-[pulse_2s_ease-in-out_infinite_0.6s]" />
            <div className={`relative z-10 text-6xl transition-all duration-300 ${isListening ? 'text-[#f43f5e] animate-[glow_1.5s_ease-in-out_infinite]' : 'text-[#667eea]'}`}>
              🎤
            </div>
          </div>

          {/* Status */}
          <div className={`text-lg font-semibold mb-5 min-h-[30px] ${isListening ? 'text-[#f43f5e]' : 'text-[#667eea]'}`}>
            {status}
          </div>

          {/* Message Display */}
          <div className="bg-[#f8fafc] rounded-[15px] p-5 mb-5 min-h-[100px] max-h-[200px] overflow-y-auto text-left">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`mb-4 p-3 rounded-lg animate-[slideIn_0.3s_ease] ${
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
          <div className="bg-[#f8fafc] rounded-[15px] p-4 mb-5 text-left text-sm text-[#64748b]">
            <div className="font-semibold text-[#475569] mb-1">You're saying:</div>
            <div>{transcript}</div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={startVoiceAssistant}
              disabled={isListening}
              className="px-8 py-4 rounded-[25px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(102,126,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>▶️</span> Start
            </button>
            <button 
              onClick={stopVoiceAssistant}
              disabled={!isListening}
              className="px-8 py-4 rounded-[25px] bg-[#e2e8f0] text-[#334155] text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2.5 hover:bg-[#cbd5e1] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>⏹️</span> Stop
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px #f43f5e); }
          50% { filter: drop-shadow(0 0 20px #f43f5e); }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
