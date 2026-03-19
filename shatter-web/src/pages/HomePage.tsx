import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Footer from "../components/Footer";
import EventCardComponent from "../components/EventCardComponent";

const HomePage: React.FC = () => {
  return (
    <div
      className="min-h-screen relative text-white"
      style={{
        background: "linear-gradient(to bottom, #0a0f1a, #1B253A, #0a0f1a)",
      }}
    >
      <Navbar />

      <main className="pt-16 lg:pt-24">
        <Hero qrPayload="13932624" />
        <section className="my-16 flex justify-center">
          <EventCardComponent name="Tech Meetup Calgary" joinCode="13932624" />
        </section>
        <About />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
