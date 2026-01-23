import { Routes, Route } from "react-router-dom";
import EventPage from "./pages/EventPage";
import HomePage from "./pages/HomePage";
// import CreateEventPage from "./pages/CreateEventPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/create-event" element={<CreateEventPage />} /> */}
      <Route path="/events/:joinCode" element={<EventPage />} />
    </Routes>
  );
}