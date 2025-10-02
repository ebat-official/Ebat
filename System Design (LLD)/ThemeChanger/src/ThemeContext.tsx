
import React, { createContext, useContext, useEffect, useState } from "react";

const LIGHT = "light"
const DARK = "dark"

interface ThemeContextType {
  toggleTheme: (theme: string) => void;
  theme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(DARK)

  useEffect(()=>{
    const savedTheme=localStorage.getItem('theme')
    if(savedTheme) setTheme(savedTheme)
    else{
      const sysPref=window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT
      setTheme(sysPref)
    }
  },[])

  useEffect(() => {
    if (theme === DARK) {
      document.querySelector('body').classList.add(DARK)
    }
    else {
      document.querySelector('body').classList.remove(DARK)
    }
    localStorage.setItem('theme',theme)

  }, [theme])

  function toggleTheme(theme: string) {
    setTheme(theme)
  }

  return (<ThemeContext.Provider value={{ toggleTheme,theme }}>
    {children}
  </ThemeContext.Provider>)
}

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
export { useTheme, ThemeProvider }
