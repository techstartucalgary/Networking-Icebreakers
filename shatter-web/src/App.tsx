import { useState } from "react";
import TestComponent from "./components/TestComponent.tsx";
import QRCodeDisplay from "./components/QRCodeDisplay.tsx";
function App() {
  return (
    <>
      <div className="bg-red-500">
        <p>This is the first component</p>
        <TestComponent />
        <QRCodeDisplay />
      </div>
    </>
  );
}

export default App;
