import { Routes, Route } from "react-router-dom";
import EventPage from "./pages/EventPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:joinCode" element={<EventPage />} />
    </Routes>
  );
}

export default App;
