# Star Rating Component - Low Level Design

A React Star Rating component built using the **Context API** and **custom SVG graphics** for maximum flexibility and reusability.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📖 Overview

This star rating component demonstrates advanced React patterns:
- **Context API** for clean state management
- **Custom SVG Graphics** for crisp, scalable icons
- **Interactive Hover Effects** with smooth animations
- **Accessibility** with proper ARIA roles

## 🎯 Key Features

- ✅ **Flexible API** - Customizable star count and styling
- ✅ **No Prop Drilling** - Context-based state management
- ✅ **Smooth Animations** - CSS transition-based interactions
- ✅ **Accessible** - Built with ARIA support
- ✅ **Customizable** - Easy to style and extend

## 💻 Usage

```jsx
import StarWidget from './components/starWidget'

function App() {
  return (
    <StarWidget
      changeHandler={(rating) => console.log(rating)}
      selectedVal={0}
      starCount={5}
    />
  )
}
```

## 🏗️ Architecture

### Component Structure
```
StarWidget (Provider)
└── Star (Consumer)
```

### Design Patterns Used
- **Context API Pattern** - Eliminates prop drilling
- **Custom SVG Graphics** - Crisp, scalable visuals
- **Composition over Configuration** - Flexible and extensible

## 🔧 Technical Implementation

- **State Management**: React Context + useState
- **Graphics**: Custom SVG with polygon paths
- **Styling**: Tailwind CSS
- **Accessibility**: ARIA roles and keyboard support

## 📚 Deep Dive

For a comprehensive technical breakdown including:
- Step-by-step implementation details
- Context API pattern explanations
- Custom SVG graphics approach
- Testing strategies
- Common pitfalls and solutions

👉 **[Read the full post](https://www.ebat.dev/frontend/systemdesign/reusable-star-rating-component-TQAIVWqTTK7yi4WEbxoAi)**

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📝 License

MIT License - feel free to use in your projects!
