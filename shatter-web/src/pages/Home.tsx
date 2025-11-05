// src/pages/Home.tsx
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Footer from "../components/Footer";
import QRCode from "../components/QRCode";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8">
        <Card />
        <Card />
        <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center">
          <h2 className="font-semibold text-xl mb-4">Share Profile</h2>
          <QRCode />
        </div>
      </section>

      <Footer />
    </div>
  );
}
