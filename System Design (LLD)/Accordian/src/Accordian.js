import React, { useContext, useState, createContext } from "react"

const AccordianContext = createContext({ open: false })

function Accordian({ children, className = "" }) {
  const [open, setOpen] = useState(false)

  return (
    <AccordianContext.Provider value={{ open, setOpen }}>
      <div className={`overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {children}
      </div>
    </AccordianContext.Provider>
  )
}

function Title({ children }) {
  const { open, setOpen } = useContext(AccordianContext)
  return (
    <div 
      onClick={() => setOpen((prev) => !prev)} 
      role="button" 
      tabIndex={0}
      className="flex justify-between items-center p-4 bg-gray-50 transition-colors duration-200 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen((prev) => !prev)
        }
      }}
    >
      <div className="flex-1">
        {children}
      </div>
      <div className={`ml-4 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}>
        <svg 
          className="w-5 h-5 text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

function Content({ children }) {
  const { open } = useContext(AccordianContext)
  return (
    <div 
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="p-4 bg-white border-t border-gray-200">
        {children}
      </div>
    </div>
  )
}

Accordian.Title = Title
Accordian.Content = Content

export default Accordian