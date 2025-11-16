import React, { useState, useEffect } from 'react';
import QRCard from './QRCard';

interface HeroProps {
  qrPayload?: string;
}

const Hero: React.FC<HeroProps> = ({ qrPayload = "hello" }) => {
  const subtitles = [
    "Expectations",
    "Boundaries",
    "Awkward Barriers"
  ];
  
  const [currentSubtitle, setCurrentSubtitle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitle((prev) => (prev + 1) % subtitles.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Ice Snowflakes Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Snowflake 1 */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-20">
            <g stroke="#4DC4FF" strokeWidth="2" fill="none">
              <line x1="40" y1="10" x2="40" y2="70" />
              <line x1="10" y1="40" x2="70" y2="40" />
              <line x1="20" y1="20" x2="60" y2="60" />
              <line x1="20" y1="60" x2="60" y2="20" />
              <circle cx="40" cy="40" r="8" stroke="#4DC4FF" strokeWidth="2" />
              <circle cx="40" cy="10" r="3" fill="#4DC4FF" />
              <circle cx="40" cy="70" r="3" fill="#4DC4FF" />
              <circle cx="10" cy="40" r="3" fill="#4DC4FF" />
              <circle cx="70" cy="40" r="3" fill="#4DC4FF" />
              <circle cx="20" cy="20" r="3" fill="#4DC4FF" />
              <circle cx="60" cy="60" r="3" fill="#4DC4FF" />
              <circle cx="20" cy="60" r="3" fill="#4DC4FF" />
              <circle cx="60" cy="20" r="3" fill="#4DC4FF" />
            </g>
          </svg>
        </div>

        {/* Snowflake 2 */}
        <div className="absolute top-40 right-20 animate-float-medium">
          <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-15">
            <g stroke="#4DC4FF" strokeWidth="1.5" fill="none">
              <line x1="30" y1="5" x2="30" y2="55" />
              <line x1="5" y1="30" x2="55" y2="30" />
              <line x1="12" y1="12" x2="48" y2="48" />
              <line x1="12" y1="48" x2="48" y2="12" />
              <circle cx="30" cy="30" r="6" />
            </g>
          </svg>
        </div>

        {/* Snowflake 3 */}
        <div className="absolute bottom-32 left-1/4 animate-float-fast">
          <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-10">
            <g stroke="#4DC4FF" strokeWidth="2.5" fill="none">
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="10" y1="50" x2="90" y2="50" />
              <line x1="20" y1="20" x2="80" y2="80" />
              <line x1="20" y1="80" x2="80" y2="20" />
              <circle cx="50" cy="50" r="10" />
            </g>
          </svg>
        </div>

        {/* Snowflake 4 */}
        <div className="absolute top-1/2 right-1/3 animate-float-slow">
          <svg width="70" height="70" viewBox="0 0 70 70" className="opacity-25">
            <g stroke="#4DC4FF" strokeWidth="1.8" fill="none">
              <line x1="35" y1="8" x2="35" y2="62" />
              <line x1="8" y1="35" x2="62" y2="35" />
              <line x1="16" y1="16" x2="54" y2="54" />
              <line x1="16" y1="54" x2="54" y2="16" />
              <circle cx="35" cy="35" r="7" />
            </g>
          </svg>
        </div>

        {/* Snowflake 5 */}
        <div className="absolute bottom-20 right-10 animate-float-medium">
          <svg width="90" height="90" viewBox="0 0 90 90" className="opacity-12">
            <g stroke="#4DC4FF" strokeWidth="2" fill="none">
              <line x1="45" y1="10" x2="45" y2="80" />
              <line x1="10" y1="45" x2="80" y2="45" />
              <line x1="18" y1="18" x2="72" y2="72" />
              <line x1="18" y1="72" x2="72" y2="18" />
              <circle cx="45" cy="45" r="9" />
            </g>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-16 relative z-10 max-w-5xl">
        {/* Left Side - Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-7xl md:text-8xl font-heading font-semibold text-white leading-tight mb-6">
            Shatter
          </h1>
          
          {/* Rotating Subtitle */}
          <div className="h-16 flex items-center justify-center md:justify-start">
            <p 
              key={currentSubtitle}
              className="text-2xl md:text-3xl font-body animate-fade-in"
              style={{ color: '#4DC4FF' }}
            >
              {subtitles[currentSubtitle]}
            </p>
          </div>
        </div>

        {/* Right Side - QR Card */}
        <div className="flex-shrink-0">
          <QRCard qrPayload={qrPayload} />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(120deg); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(240deg); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default Hero;
