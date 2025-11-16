// src/components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-4 flex justify-between items-center z-50"
         style={{ backgroundColor: 'rgba(27, 37, 58, 0.85)' }}>
      <div className="flex items-center gap-3">
        {/* Shatter Logo */}
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src="/src/assets/ShatterLogo_Blue.png" 
            alt="Shatter Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-2xl font-heading font-semibold text-white">Shatter</div>
      </div>
      
      <ul className="flex gap-4 items-center">
        <li>
          <a 
            href="#about" 
            className="px-4 py-2 text-white/90 hover:text-white transition-colors duration-200 font-body"
          >
            About
          </a>
        </li>
        <li>
          <a 
            href="/create-event" 
            className="px-4 py-2 rounded-full font-body transition-all duration-200 border border-transparent"
            style={{ backgroundColor: '#4DC4FF', color: '#ffffff' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8F7DE';
              e.currentTarget.style.color = '#1B253A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4DC4FF';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            Create Event
          </a>
        </li>
        <li>
          <a 
            href="/login" 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-body transition-all duration-200"
          >
            Login
          </a>
        </li>
      </ul>
    </nav>
  );
}
