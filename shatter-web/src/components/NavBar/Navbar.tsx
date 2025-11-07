// src/components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-2xl font-semibold">Shatter</div>
      <ul className="flex gap-4">
        <li><a href="/" className="hover:text-blue-500">Home</a></li>
        <li><a href="/about" className="hover:text-blue-500">About</a></li>
        <li><a href="/create-event" className="hover:text-blue-500">Create Event</a></li>
      </ul>
    </nav>
  );
}
