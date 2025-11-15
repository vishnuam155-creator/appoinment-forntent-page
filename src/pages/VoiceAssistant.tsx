import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendVoicebotRequest } from "@/services/api";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);  // For playing bot audio responses
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
    // Stop audio playback if active
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus("Stopped");
    setTranscript("...");
  };

  const processSpeech = async (message: string) => {
    if (!message || message.trim() === '') return;

    setMessages(prev => [...prev, { type: "user", content: message }]);
    setStatus("Processing...");
    setTranscript("...");

    try {
      // Send message to voicebot API at /voicebot/api/
      const response = await sendVoicebotRequest({
        text: message,                       // Voicebot expects 'text' field
        session_id: sessionId || undefined,  // Backend uses session_id
        action: sessionId ? 'continue' : 'start',  // Start new session or continue existing
      });

      // Debug: Log the full response to see structure
      console.log('=== VOICEBOT API RESPONSE ===');
      console.log('Full response object:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response type:', typeof response);
      console.log('============================');

      // Handle response - check all possible locations for session_id
      const sessionIdFromResponse = response.session_id || (response as any).sessionId || (response as any).session;
      if (sessionIdFromResponse && !sessionId) {
        setSessionId(sessionIdFromResponse);
        console.log('✓ Session ID set:', sessionIdFromResponse);
      }

      // Voicebot returns 'response' field - check multiple possible response fields
      const botResponse = response.response
        || (response as any).message
        || (response as any).text
        || (response as any).bot_response
        || (response as any).reply
        || "I'm here to help you!";

      console.log('✓ Bot response extracted:', botResponse);

      if (!botResponse || botResponse === "I'm here to help you!") {
        console.warn('⚠️ No valid response found in:', response);
      }

      setMessages(prev => [...prev, { type: "bot", content: botResponse }]);

      // Enable bot voice response
      // If backend provides audio_url, play it; otherwise use text-to-speech
      if (response.audio_url) {
        playAudio(response.audio_url);
      } else {
        speak(botResponse);
      }

      setStatus("Listening...");
    } catch (error) {
      console.error("Error processing speech:", error);
      const fallbackResponse = "Sorry, I'm having trouble connecting to the voicebot server. Please make sure the backend is running at http://localhost:8000/voicebot/api/";
      setMessages(prev => [...prev, { type: "bot", content: fallbackResponse }]);
      speak(fallbackResponse);
      setStatus("Listening...");

      toast({
        title: "Connection Error",
        description: "Failed to connect to voicebot API.",
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

  const playAudio = (audioUrl: string) => {
    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();

    // Create or update audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    audioRef.current.play().catch(error => {
      console.error("Error playing audio:", error);
      // Fallback to text-to-speech if audio playback fails
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.type === 'bot') {
        speak(lastMessage.content);
      }
    });
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg rounded-t-[30px] p-6 max-h-[60vh] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease] border-t-2 border-white/50">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#667eea] font-bold text-lg">Conversation</h3>
            <button
              onClick={() => setShowCaptions(false)}
              className="w-10 h-10 rounded-full bg-red-500/90 text-white font-bold text-lg cursor-pointer transition-all duration-300 hover:bg-red-600 hover:scale-110 flex items-center justify-center shadow-md"
              title="Close Captions"
            >
              ✕
            </button>
          </div>

          {/* Message Display */}
          <div className="mb-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#667eea]/30 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 p-3 rounded-lg animate-[slideIn_0.3s_ease] shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-[#667eea]/90 text-white ml-[15%] text-right backdrop-blur-sm'
                    : 'bg-white/70 text-[#334155] mr-[15%] backdrop-blur-sm'
                }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Transcript */}
          {isListening && (
            <div className="bg-white/60 backdrop-blur-sm rounded-[15px] p-4 text-left border-2 border-[#667eea]/50 shadow-sm">
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
