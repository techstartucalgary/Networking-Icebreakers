import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuthStatus();

    // Listen for storage changes (logout from another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    // Custom event for login/logout within the same tab
    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update state
    setIsLoggedIn(false);
    
    // Dispatch custom event for other components to react
    window.dispatchEvent(new Event('authChange'));
    
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // Redirect to home page
    navigate('/');
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
          <a href="/" className="text-2xl font-heading font-semibold text-white hover:opacity-80 transition-opacity">
            Shatter
          </a>
        </div>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 items-center">
          {/* About */}
          <li>
            <button
              onClick={() => {
                if (window.location.pathname !== "/") {
                  navigate("/");
                  // wait for HomePage to render
                  setTimeout(() => {
                    document.getElementById("about")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                } else {
                  document.getElementById("about")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
              className="px-4 py-2 rounded-full font-body transition-all duration-200 border border-transparent"
              style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F7DE";
                e.currentTarget.style.color = "#1B253A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#4DC4FF";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              About
            </button>
          </li>



          {/* Create Event */}
          <li>
            <button
              onClick={() => {
                const token = localStorage.getItem("token");

                if (!token) {
                  // Not logged in → go to login
                  navigate("/login");
                } else {
                  // Logged in → go to create event
                  navigate("/create-event");
                }
              }}
              className="px-4 py-2 rounded-full font-body transition-all duration-200 border border-transparent"
              style={{ backgroundColor: "#4DC4FF", color: "#ffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F7DE";
                e.currentTarget.style.color = "#1B253A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#4DC4FF";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Create Event
            </button>
          </li>


          {/* Conditional Login/Sign Out */}
          {isLoggedIn ? (
            <>
              {/* Dashboard - Optional */}
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
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
                  Dashboard
                </button>
              </li>


              {/* Sign Out */}
              <li>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-white/10 hover:bg-red-500/20 backdrop-blur-sm border border-white/30 hover:border-red-400/50 rounded-full text-white font-body transition-all duration-200"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            /* Login */
            <li>
              <a 
                href="/login" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-body transition-all duration-200"
              >
                Login
              </a>
            </li>
          )}
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
              className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-body"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Event
            </a>
          </li>

          {/* Conditional Login/Sign Out for Mobile */}
          {isLoggedIn ? (
            <>
              {/* Dashboard - Optional */}
              <li>
                <a 
                  href="/dashboard" 
                  className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-body"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </a>
              </li>

              {/* Sign Out */}
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 bg-white/10 hover:bg-red-500/20 backdrop-blur-sm border border-white/30 hover:border-red-400/50 rounded-lg text-white font-body transition-all duration-200"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            /* Login */
            <li>
              <a 
                href="/login" 
                className="block px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-body transition-all duration-200 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
