import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div 
      className="min-h-screen relative text-white"
      style={{ 
        background: 'linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)'
      }}
    >
      <Navbar />
      
      <main>
        <Hero qrPayload="Test" />
        <About />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
