# Building a Reusable Star Rating Component: From Basic UI to Production-Ready

![Star Rating Component](https://via.placeholder.com/800x400/edaa10/ffffff?text=Modern+Star+Rating+Component)

In modern React development, we often strive for the holy grail: components that are both **flexible** enough to handle diverse use cases and **maintainable** enough to not become a development bottleneck. But let's be honest, building a simple UI element like a Star Rating often leads to tightly coupled, rigid code that's a pain to customize.

Today, we're going to break that cycle. We'll explore how to build a robust Star Rating component using the powerful **Context API** combined with **custom SVG graphics**. This approach delivers an exceptional developer experience, clean state management, and a beautiful separation of concerns.

## What We're Building

Our end product will be a highly composable Star Rating featuring:
- **Context API** for clean, global state management within the component boundary.
- **Custom SVG Graphics** for crisp, scalable star icons.
- **Interactive Hover Effects** with smooth visual feedback.
- **Accessibility features** with proper ARIA roles.
- **Tailwind CSS** for rapid, utility-first styling.

## The Problem with Traditional Approaches

Before diving into the solution, it's worth highlighting why the traditional "prop-heavy" approach to components often fails:

```javascript
// ❌ Traditional approach - rigid and inflexible
<StarRating 
  value={3} 
  onChange={handleChange}
  size="large"
  color="yellow"
  disabled={false}
/>
```

**The Issues:**
1. **Limited Customization:** Want to change the star shape or add animations? Good luck with predefined props.
2. **Tightly Coupled:** The parent component owns all the styling and behavior logic.
3. **Poor Developer Experience:** The component's internal structure is hidden, limiting the developer's control.

## Our Solution: The Context API Pattern

The Context API is a game-changer for complex UI interactions. It allows us to create components that implicitly work together while maintaining their independence. Think of it like native HTML elements: the `<select>` and `<option>` tags are separate but achieve nothing without each other.

### **Step 1: Planning & Requirements**

Planning the right components and state structure is crucial at the start. We only have about 45 minutes to design and code, so changing the plan mid-way will cost precious time.

**Requirements:**
- The star rating should work independently.
- Multiple star ratings can exist on the same page.
- It should support hover effects for better UX.
- Each star should be clickable and show visual feedback.
- Smooth transitions when hovering and clicking.

### **Step 2: Setting Up the Context**

The Context API is the glue that binds our separate components together. It allows us to share the essential state—specifically, which star is active and which is being hovered—without drilling props down the component tree.

```javascript
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
```

**Why Context?**
- It **eliminates prop drilling**, keeping the component tree clean.
- It provides a **single source of truth** for state management within the Star Rating.
- It **enables composition**, allowing any child component to tap into the state.

### **Step 3: The Main Star Widget Component**

The main `StarWidget` component is primarily a **Context Provider** and a state manager. It defines the behavior for all its children.

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import Star from "./Star";
import { StarContextProvider } from "./starContext";

function StarWidget({ changeHandler, selectedVal, starCount = 5 }) {
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
      <div className="flex gap-2" role="radiogroup" aria-label="Star rating">
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
```

**Key Design Decisions:**
- **Local State:** Simple `useState` manages the active and hover states for this specific instance.
- **External Integration:** `changeHandler` prop allows parent components to react to rating changes.
- **Flexible Configuration:** `starCount` prop allows customization of the number of stars.
- **Context Provider:** Wraps all stars with shared state and handlers.

### **Step 4: The Individual Star Component**

The `Star` component is responsible for rendering and user interaction—it must display the correct state and handle clicks.

```javascript
import { useStarContext } from "./starContext";

function Star({ indx }) {
  const { activeStar, hoverStar, starClickHandler, starHoverHandler } = useStarContext();
  
  const emptyColor = "grey";
  const fillColor = "#edaa10";
  
  return (
    <label
      onMouseEnter={() => starHoverHandler(indx)}
      onMouseLeave={() => starHoverHandler(0)}
      onClick={() => starClickHandler(indx)}
      className="relative cursor-pointer transition-transform duration-200 hover:scale-110"
      aria-label={`Rate ${indx} star${indx > 1 ? 's' : ''}`}
    >
      <svg
        fill={(hoverStar || activeStar) >= indx ? fillColor : emptyColor}
        height={40}
        viewBox="0 0 25 25"
        width={40}
        className="transition-colors duration-200"
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
        aria-hidden="true"
      />
    </label>
  );
}

export default Star;
```

**The Magic:** It only consumes the state and handlers from the context. It doesn't know *how* the state is managed, only *that* it can access it.

**Key Features:**
- **Custom SVG:** Crisp, scalable graphics that work at any size
- **Context Integration:** Uses shared state without prop drilling
- **Accessibility:** Proper ARIA labels and hidden radio inputs
- **Smooth Animations:** CSS transitions for hover and click effects
- **Visual Feedback:** Color changes based on active and hover states

## Usage Example: A Beautiful API

The final usage is elegant and highly readable, delivering that "HTML-like" experience we were aiming for.

```javascript
import StarWidget from "./components/starWidget";

function App() {
  const handleRatingChange = (rating) => {
    console.log(`User rated: ${rating} stars`);
    // Handle the rating change (save to database, update state, etc.)
  };

  return (
    <div className="container flex items-center justify-center w-screen h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Rate Your Experience</h2>
        <StarWidget
          changeHandler={handleRatingChange}
          selectedVal={0}
          starCount={5}
        />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Click on a star to rate
        </p>
      </div>
    </div>
  );
}

export default App;
```

## Why This Design Works So Well

### 1. **Flexibility is Baked In**

The context-based state management allows for unlimited customization. You are not restricted by simple props.

```javascript
// Easy to customize each part
<StarWidget
  changeHandler={handleRating}
  selectedVal={currentRating}
  starCount={10} // Custom number of stars
>
  {/* Additional content can be added here */}
</StarWidget>
```

### 2. **Effortless Composability**

Since each `StarWidget` component manages its own isolated state, you can drop multiple instances anywhere in your application, and they will all function independently.

```javascript
// Multiple star ratings work independently
<StarWidget changeHandler={handleProductRating} selectedVal={productRating} />
<StarWidget changeHandler={handleServiceRating} selectedVal={serviceRating} />
<StarWidget changeHandler={handleDeliveryRating} selectedVal={deliveryRating} />
```

### 3. **High Maintainability**

- **Single Responsibility:** Each component has one clear job (manage state, render stars, handle interactions).
- **Simple to Test:** You can unit test the logic of `Star` without worrying about how `StarWidget` manages state.
- **Easy to Extend:** Adding new features, like custom animations or different star shapes, is as simple as modifying the `Star` component.

## Advanced Features & Performance Considerations

While our initial implementation is functional, let's look at how we'd productionize it.

### **Animation and Accessibility**

We can dramatically improve the user experience by adding CSS transition properties and proper ARIA attributes:

```javascript
// Enhanced Star component with better styling
function Star({ indx, size = 40 }) {
  const { activeStar, hoverStar, starClickHandler, starHoverHandler } = useStarContext();
  
  const emptyColor = "#d1d5db";
  const fillColor = "#f59e0b";
  const hoverColor = "#fbbf24";
  
  const isActive = (hoverStar || activeStar) >= indx;
  const isHovered = hoverStar >= indx;
  
  return (
    <label
      onMouseEnter={() => starHoverHandler(indx)}
      onMouseLeave={() => starHoverHandler(0)}
      onClick={() => starClickHandler(indx)}
      className="relative cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label={`Rate ${indx} star${indx > 1 ? 's' : ''}`}
    >
      <svg
        fill={isActive ? (isHovered ? hoverColor : fillColor) : emptyColor}
        height={size}
        viewBox="0 0 25 25"
        width={size}
        className="transition-all duration-200 drop-shadow-sm"
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
        aria-hidden="true"
      />
    </label>
  );
}
```

### **Performance Considerations**

Context often gets a bad rap for performance due to unnecessary re-renders. We can mitigate this with standard React optimizations:

```javascript
// Memoize context value to prevent unnecessary re-renders
const contextValue = useMemo(() => ({ 
  activeStar, 
  hoverStar, 
  starClickHandler, 
  starHoverHandler 
}), [activeStar, hoverStar]) 

// Or, memoize components that don't need frequent updates
const Star = React.memo(({ indx }) => {
  // Component implementation
})
```

## Testing Strategy: Confidence in Interactions

Testing the Context API pattern is straightforward because of the clean separation of concerns.

### 1. **Unit Tests (Focusing on Behavior)**

We test the `Star` component's core behavior—does it respond to context changes?

```javascript
test('Star responds to context changes', () => {
  const mockContext = {
    activeStar: 3,
    hoverStar: 0,
    starClickHandler: jest.fn(),
    starHoverHandler: jest.fn()
  };
  
  render(
    <StarContext.Provider value={mockContext}>
      <Star indx={2} />
    </StarContext.Provider>
  );
  
  const star = screen.getByLabelText('Rate 2 stars');
  expect(star).toHaveStyle('fill: #f59e0b'); // Should be filled
});
```

### 2. **Integration Tests (Focusing on the Full Flow)**

We test the full interaction flow to ensure the components work together as intended.

```javascript
test('Star rating updates when clicked', () => {
  const mockChangeHandler = jest.fn();
  
  render(
    <StarWidget 
      changeHandler={mockChangeHandler}
      selectedVal={0}
    />
  );
  
  const thirdStar = screen.getByLabelText('Rate 3 stars');
  fireEvent.click(thirdStar);
  
  expect(mockChangeHandler).toHaveBeenCalledWith(3);
});
```

## Conclusion

The Context API, combined with custom SVG graphics, is a robust pattern for building reusable, flexible components that truly scale. Our Star Rating implementation serves as a perfect demonstration of its power:

- **Clean API Design:** Intuitive and easy for developers to grasp.
- **Separation of Concerns:** Each part is simple to understand, test, and maintain.
- **Flexibility:** Star appearance and behavior can be entirely customized without touching the core logic.

This pattern is a foundational tool for building professional-grade design systems. It achieves a balance between exposing internal controls and maintaining component integrity, resulting in a developer experience that feels as natural and intuitive as working with native HTML.

**View / Download the complete solution from [`github`](https://github.com/ebat-official/Ebat/tree/main/frontend-system-design/starWidget)**