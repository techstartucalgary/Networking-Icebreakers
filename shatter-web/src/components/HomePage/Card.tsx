// src/components/Card.tsx
export default function Card() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center">
      <img
        src="https://randomuser.me/api/portraits/women/44.jpg"
        alt="Jane Doe"
        className="w-20 h-20 rounded-full mb-4"
      />
      <h2 className="font-semibold text-xl">Jane Doe</h2>
      <p className="text-gray-700 mb-4">Software Engineer</p>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
        Connect
      </button>
    </div>
  );
}
