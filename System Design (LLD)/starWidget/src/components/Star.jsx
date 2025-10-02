import { useStarContext } from "./starContext";
function Star({ indx }) {
  const { activeStar, hoverStar, starClickHandler, starHoverHandler } =
    useStarContext();
  const emptyColor = "grey";
  const fillColor = "#edaa10";
  return (
    <label
      onMouseEnter={() => starHoverHandler(indx)}
      onMouseLeave={() => starHoverHandler(0)}
      onClick={() => starClickHandler(indx)}
      className="relative"
      aria-label="star rating"
    >
      <svg
        fill={(hoverStar || activeStar) >= indx ? fillColor : emptyColor}
        height={40}
        viewBox="0 0 25 25"
        width={40}
      >
        <polygon
          strokeWidth="0"
          points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78"
        />
      </svg>
      <input
        type="radio"
        name="star"
        value={indx}
        onChange={() => starClickHandler(indx)}
        className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0 left-1/2 top-1/2 outline-0"
      />
    </label>
  );
}
export default Star;
