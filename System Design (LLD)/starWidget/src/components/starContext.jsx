import { createContext, useContext } from "react";

const StarContext = createContext({
  activeStar: 0,
  hoverStar: 0,
  starClickHandler: () => {},
  starHoverHandler: () => {},
});

function StarContextProvider({ children, value }) {
  return <StarContext.Provider value={value}>{children}</StarContext.Provider>;
}
const useStarContext = () => useContext(StarContext);

export { StarContextProvider, useStarContext };
