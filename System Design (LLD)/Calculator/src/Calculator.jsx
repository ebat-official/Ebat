import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";

function Calculator() {
  const operators = new Set(["*", "+", "-", "/"]);
  const [input, setInput] = useState([]);
  const inputRef = useRef();
  const numberHandler = (num) => {
    setInput((prev) => [...prev, num]);
  };

  const operatorHandler = (operator) => {
    const tempInput = [...input];
    if (operators.has(tempInput.at(-1))) {
      tempInput.pop();
    }
    tempInput.push(operator);
    setInput(tempInput);
  };
  const evaluateHanlder = () => {
    const evalStr = input.join("");
    const res = evaluteExpression(evalStr);
    setInput([res]);
  };

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  function evaluteExpression() {
    let crntNum = "";
    let crntOp = "+";
    const opArry = [];
    let indx = 0;

    const operEval = (operator, num) => {
      if (operator === "+") {
        opArry.push(+num);
      } else if (operator === "-") {
        opArry.push(-num);
      } else if (operator === "/") {
        const frst = opArry.pop();
        opArry.push(frst / num);
      } else if (operator === "*") {
        const frst = opArry.pop();
        opArry.push(frst * num);
      }
    };

    while (indx < input.length) {
      if (operators.has(input[indx])) {
        operEval(crntOp, crntNum);
        crntNum = "";
        crntOp = input[indx];
      } else if (!isNaN(input[indx])) {
        crntNum += input[indx];
      }
      console.log(crntNum, crntOp);
      indx += 1;
    }
    operEval(crntOp, crntNum);
    console.log(opArry);
    return opArry.reduce((crnt, num) => crnt + num, 0);
  }

  return (
    <div className="flex flex-col gap-4 items-center p-6 w-80 max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl">
      {/* Display */}
      <div className="p-4 w-full bg-gray-900 rounded-xl shadow-inner">
        <input
          className="w-full font-mono text-3xl placeholder-gray-500 text-right text-white bg-transparent border-none outline-none"
          type="text"
          readOnly
          value={input.join("") || "0"}
          ref={inputRef}
          placeholder="0"
        />
      </div>
      
      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {/* Row 1: Clear, Backspace, Operators */}
        <Button className="bg-red-500 hover:bg-red-600" colSpan={2} onClick={() => setInput([])}>
          Clear
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setInput((prev) => [...prev].slice(0, -1))}>
          ⌫
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => operatorHandler("/")}>
          ÷
        </Button>
        
        {/* Row 2: 7, 8, 9, × */}
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(7)}>7</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(8)}>8</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(9)}>9</Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => operatorHandler("*")}>×</Button>
        
        {/* Row 3: 4, 5, 6, - */}
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(4)}>4</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(5)}>5</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(6)}>6</Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => operatorHandler("-")}>−</Button>
        
        {/* Row 4: 1, 2, 3, + */}
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(1)}>1</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(2)}>2</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(3)}>3</Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => operatorHandler("+")}>+</Button>
        
        {/* Row 5: 0, ., = */}
        <Button className="bg-gray-700 hover:bg-gray-600" colSpan={2} onClick={() => numberHandler(0)}>0</Button>
        <Button className="bg-gray-700 hover:bg-gray-600" onClick={() => numberHandler(".")}>.</Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => evaluateHanlder()}>=</Button>
      </div>
    </div>
  );
}

export default Calculator;
