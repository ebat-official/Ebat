import React, { useContext, useState, createContext } from "react"

const AccordianContext = createContext({ open: false })

function Accordian({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <AccordianContext.Provider value={{ open, setOpen }}>
      <div className="relative overflow-y-hidden">

      {children}
      </div>
    </AccordianContext.Provider>
  )
}

function Title({ children }) {
  const { setOpen } = useContext(AccordianContext)
  return (
    <div  onClick={() => setOpen((prev) => !prev)} role="button" className="bg-green-400 min-w-64">
      {children}
    </div>
  )
}

function Content({ children }) {
  const { open } = useContext(AccordianContext)
  return (

      <div className={`absolute bottom-0 left-0 bg-red-400  ${open?"translate-y-full":""}`}>
        {children}
      </div>
      )
}
      Accordian.Title=Title
      Accordian.Content=Content

      export default Accordian