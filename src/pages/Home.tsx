import { Link } from "react-router-dom";
const Home = () => {
  return <div className="min-h-screen flex justify-center items-center p-8 bg-gradient-to-br from-[#e0e7ff] to-[#f9fafb]">
      <div className="w-full max-w-[880px] rounded-[24px] shadow-lg p-[60px_50px] text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[#000a0e]/0">
        <h1 className="text-[42px] font-bold mb-3.5 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent leading-tight">
          Medical Appointment System
        </h1>
        <p className="text-[#6b7280] text-lg font-medium mb-11">
          Book your appointment with our AI-powered voice assistant or chatbot
        </p>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-11">
          

          <div className="p-[35px_25px] rounded-[18px] bg-[#f9fafb] border border-[#e5e7eb] transition-all duration-300 hover:bg-[#eef2ff] hover:-translate-y-1.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.15)]">
            <div className="text-[46px] mb-3">🤖</div>
            <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-[#4b5563] text-sm leading-relaxed">Smart system understands your symptoms</p>
          </div>

          <div className="p-[35px_25px] rounded-[18px] bg-[#f9fafb] border border-[#e5e7eb] transition-all duration-300 hover:bg-[#eef2ff] hover:-translate-y-1.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.15)]">
            <div className="text-[46px] mb-3">👨‍⚕️</div>
            <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">Expert Doctors</h3>
            <p className="text-[#4b5563] text-sm leading-relaxed">Connect with specialized doctors</p>
          </div>

          <div className="p-[35px_25px] rounded-[18px] bg-[#f9fafb] border border-[#e5e7eb] transition-all duration-300 hover:bg-[#eef2ff] hover:-translate-y-1.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.15)]">
            <div className="text-[46px] mb-3">⚡</div>
            <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">Instant Booking</h3>
            <p className="text-[#4b5563] text-sm leading-relaxed">Book appointments in minutes</p>
          </div>
        </div>
        
        <div className="flex gap-5 justify-center flex-wrap mb-5">
          <Link to="/chatbot" className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white no-underline rounded-[50px] text-lg font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)]">
              Book Appointment
          </Link>

          <Link to="/voice-assistant" className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-br from-[#f43f5e] to-[#ec4899] text-white no-underline rounded-[50px] text-lg font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(244,63,94,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(244,63,94,0.4)]">
              Voice Assistant
          </Link>
        </div>

        <div className="mt-9 text-[#6b7280] text-[15px]">
          <p>
            Staff? <Link to="/calendar" className="text-[#2563eb] font-semibold no-underline hover:text-[#1d4ed8] hover:underline">View Calendar</Link>
          </p>
        </div>
      </div>
    </div>;
};
export default Home;