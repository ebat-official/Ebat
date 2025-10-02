import React from "react";
import Calculator from "./Calculator";

const App = () => {
  return (
    <div className="flex justify-center items-center p-4 w-full min-h-screen bg-gradient-to-br via-purple-900 from-slate-900 to-slate-900">
      <div className="flex flex-col items-center w-full">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Calculator</h1>
          <p className="text-gray-300">Modern & Responsive</p>
        </div>
        <Calculator />
      </div>
    </div>
  );
};

export default App;
