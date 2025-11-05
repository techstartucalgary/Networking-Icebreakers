// src/components/Hero.tsx
export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-semibold text-blue-700 mb-4">Welcome to Shatter</h1>
      <p className="text-lg text-gray-800 mb-6">
        Making professional networking easier and exciting! 
      </p>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
        Get Started
      </button>
    </section>
  );
}
