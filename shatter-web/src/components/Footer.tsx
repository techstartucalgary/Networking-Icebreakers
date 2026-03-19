import React from 'react';

const Footer: React.FC = () => (
  <footer 
    className="container mx-auto mt-20 mb-8 py-6 flex flex-col md:flex-row justify-between items-center backdrop-blur-lg rounded-2xl px-6 border border-white/10"
    style={{ backgroundColor: 'rgba(27, 37, 58, 0.5)' }}
  >
    <div>
      <h4 className="font-heading font-semibold text-white text-lg">Shatter — Networking, reimagined</h4>
      <p className="text-sm text-white/60 font-body mt-1">© {new Date().getFullYear()} Shatter Inc.</p>
    </div>
    
    <div className="flex gap-6 mt-4 md:mt-0">
      <a 
        href="#terms" 
        className="text-white/70 hover:text-white text-sm font-body transition-colors"
      >
        Terms
      </a>
      <a 
        href="#privacy" 
        className="text-white/70 hover:text-white text-sm font-body transition-colors"
      >
        Privacy
      </a>
      <a 
        href="#contact" 
        className="text-white/70 hover:text-white text-sm font-body transition-colors"
      >
        Contact
      </a>
    </div>
  </footer>
);

export default Footer;
