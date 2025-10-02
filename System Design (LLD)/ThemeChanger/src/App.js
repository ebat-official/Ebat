import React from "react";
import { ThemeProvider } from "./ThemeContext.tsx";
import ThemeChanger from "./ThemeChanger.tsx";

function App() {
  return (
    <ThemeProvider>
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-blue-100 transition-colors duration-300 dark:bg-gray-900">
      <ThemeChanger/>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hello World</h1>
    </div>
    </ThemeProvider>
  );
}

export default App;
