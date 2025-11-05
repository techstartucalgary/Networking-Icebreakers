// src/components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-2xl font-semibold">Shatter</div>
      <ul className="flex gap-4">
        <li><a href="/" className="hover:text-blue-500">Home</a></li>
        <li><a href="/profile" className="hover:text-blue-500">Profile</a></li>
        <li><a href="/connections" className="hover:text-blue-500">Connections</a></li>
      </ul>
    </nav>
  );
}
