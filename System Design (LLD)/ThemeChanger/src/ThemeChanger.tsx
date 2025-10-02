import React, { FC } from 'react'
import { useTheme } from './ThemeContext.tsx';

interface ThemeChangerProps {
  
}

const ThemeChanger: FC<ThemeChangerProps> = () => {
    const {toggleTheme,theme}=useTheme()
    return (
      <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <button 
          onClick={()=>toggleTheme('light')}
          className={`px-4 py-2 rounded-md transition-all duration-200 ${
            theme === 'light' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ☀️ Light
        </button>
        <button 
          onClick={()=>toggleTheme('dark')}
          className={`px-4 py-2 rounded-md transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🌙 Dark
        </button>
      </div>
    )
}

export default ThemeChanger;