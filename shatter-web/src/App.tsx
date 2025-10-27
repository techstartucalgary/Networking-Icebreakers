import { useState } from "react";

import TestComponent from "./components/TestComponent.tsx";

function App() {
  return (
    <>
      <div className="bg-red-500">
        <p>This is the first component</p>
        <TestComponent />
      </div>
    </>
  );
}

export default App;
