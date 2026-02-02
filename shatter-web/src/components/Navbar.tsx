import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-4 z-50"
      style={{ backgroundColor: 'rgba(27, 37, 58, 0.85)' }}
    >
      <div className="flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <a href="/">
              <img 
                src="/src/assets/ShatterLogo_White.png" 
                alt="Shatter Logo" 
                className="w-full h-full object-contain"
              />
            </a>
          </div>
          <div className="text-2xl font-heading font-semibold text-white">Shatter</div>
        </div>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 items-center">
          {/* About */}
          <li>
            <a 
              href="#about" 
              className="px-4 py-2 text-white/90 hover:text-white transition-colors duration-200 font-body"
            >
              About
            </a>
          </li>

          {/* Create Event */}
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

          {/* Login */}
          <li>
            <a 
              href="/login" 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-body transition-all duration-200"
            >
              Login
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            /* Close Icon */
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            /* Hamburger Icon */
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-2 pt-4 border-t border-white/20">
          {/* About */}
          <li>
            <a 
              href="#about" 
              className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-body"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
          </li>

          {/* Create Event */}
          <li>
            <a 
              href="/create-event" 
              className="block px-4 py-3 rounded-lg font-body transition-all duration-200 text-center"
              style={{ backgroundColor: '#4DC4FF', color: '#ffffff' }}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Event
            </a>
          </li>

          {/* Login */}
          <li>
            <a 
              href="/login" 
              className="block px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-body transition-all duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
