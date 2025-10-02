import { createContext, useContext, useEffect, useState } from "react";
import Star from "./Star";
import { StarContextProvider } from "./starContext";

function StarWidget({ changeHandler, selectedVal }) {
  const starCount = 5;
  const [activeStar, setActiveStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);

  const starClickHandler = (indx) => {
    setActiveStar(indx);
    if (changeHandler) changeHandler(indx);
  };
  const starHoverHandler = (indx) => {
    setHoverStar(indx);
  };

  useEffect(() => {
    if (selectedVal) setActiveStar(selectedVal);
  }, [selectedVal]);

  return (
    <StarContextProvider
      value={{ activeStar, hoverStar, starClickHandler, starHoverHandler }}
    >
      <div className="flex gap-2">
        {Array(starCount)
          .fill(0)
          .map((star, indx) => (
            <Star key={indx} indx={indx + 1} />
          ))}
      </div>
    </StarContextProvider>
  );
}

export default StarWidget;
