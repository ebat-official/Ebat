import React from "react";
import Accordian from "./Accordian";

function App() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-blue-100 ">
              <Accordian>
          <Accordian.Title>
            <span>accordian 1</span>
          </Accordian.Title>
          <Accordian.Content>
          <span>accordian 1 content</span>
          <span>accordian 1 content</span>
          <span>accordian 1 content</span>
          <span>accordian 1 content</span>
          <span>accordian 1 content</span>
          </Accordian.Content>
          </Accordian>
    </div>
  );
}

export default App;
