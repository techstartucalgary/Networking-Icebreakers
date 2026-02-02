import React, { useState, useEffect, useRef } from 'react';
import QRCard from './QRCard';

interface HeroProps {
  qrPayload?: string;
}

const Hero: React.FC<HeroProps> = ({ qrPayload = "hello" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const words = [
    { text: "Expectations", color: "#4DC4FF" },
    { text: "Boundaries", color: "#C9FAD6" },
    { text: "Awkward Interactions", color: "#F8F7DE" }
  ];

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Ice Crystals */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 13) % 100}%`,
              transform: `translate(${mousePosition.x * (20 + i * 5)}px, ${mousePosition.y * (20 + i * 5)}px)`,
              transition: 'transform 0.3s ease-out',
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <svg
              width={60 + i * 5}
              height={60 + i * 5}
              viewBox="0 0 100 100"
              className={i % 2 === 0 ? "animate-spin-slow" : "animate-spin-slower"}
            >
              <g stroke="#4DC4FF" strokeWidth="2" fill="none">
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="10" y1="50" x2="90" y2="50" />
                <line x1="20" y1="20" x2="80" y2="80" />
                <line x1="20" y1="80" x2="80" y2="20" />
                <circle cx="50" cy="50" r="8" stroke="#4DC4FF" strokeWidth="2" />
                <circle cx="50" cy="10" r="3" fill="#4DC4FF" />
                <circle cx="50" cy="90" r="3" fill="#4DC4FF" />
                <circle cx="10" cy="50" r="3" fill="#4DC4FF" />
                <circle cx="90" cy="50" r="3" fill="#4DC4FF" />
              </g>
            </svg>
          </div>
        ))}

        {/* Glowing Orbs */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #4DC4FF 0%, transparent 70%)',
            top: '20%',
            left: '10%',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, #C9FAD6 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
            transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 max-w-7xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* Main Heading with Animation */}
            <div className="space-y-4">
              <h1 
                className="text-7xl md:text-8xl lg:text-9xl font-heading font-bold text-white leading-none"
                style={{
                  transform: `translateX(${mousePosition.x * 10}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                Shatter
              </h1>
              
              {/* Animated Subheading */}
              <div className="relative h-24 md:h-32 overflow-hidden">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className={`absolute w-full transition-all duration-700 ease-in-out ${
                      index === currentWord
                        ? 'opacity-100 translate-y-0'
                        : index < currentWord
                        ? 'opacity-0 -translate-y-full'
                        : 'opacity-0 translate-y-full'
                    }`}
                  >
                    <h2
                      className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold"
                      style={{ 
                        color: word.color,
                        textShadow: `0 0 30px ${word.color}40`,
                      }}
                    >
                      {word.text}
                    </h2>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <p 
              className="text-xl md:text-2xl text-white/80 font-body max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              style={{
                transform: `translateY(${mousePosition.y * 5}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              Break the ice. Make connections. Transform networking events into 
              unforgettable experiences with interactive games and real-time engagement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/create-event"
                className="group relative px-8 py-4 rounded-full font-body font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: '#4DC4FF', color: '#ffffff' }}
              >
                <span className="relative z-10">Create Event</span>
                <div 
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                />
              </a>
              
              <button
                onClick={() => {
                  document.getElementById('about')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="px-8 py-4 rounded-full font-body font-semibold text-lg border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white">
                  100+
                </div>
                <div className="text-sm md:text-base text-white/60 font-body mt-1">
                  Events Hosted
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white">
                  5K+
                </div>
                <div className="text-sm md:text-base text-white/60 font-body mt-1">
                  Connections Made
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white">
                  98%
                </div>
                <div className="text-sm md:text-base text-white/60 font-body mt-1">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Card */}
          <div 
            className="flex-shrink-0"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${mousePosition.y * -5}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <QRCard qrPayload={qrPayload} />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
