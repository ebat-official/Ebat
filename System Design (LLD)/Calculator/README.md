# Calculator Component - Low Level Design

A React Calculator component built using **custom expression evaluator** and **reusable Button components** for maximum flexibility and reusability.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 📖 Overview

This calculator component demonstrates advanced React patterns:
- **Custom Expression Evaluator** for safe mathematical operations without `eval()`
- **Reusable Button Component** with flexible styling and consistent behavior
- **React Hooks** for clean state management and lifecycle handling
- **Modern Design** with professional styling and smooth animations

## 🎯 Key Features

- ✅ **Safe Evaluation** - Custom parser without `eval()` security risks
- ✅ **Reusable Components** - Flexible Button component for consistent styling
- ✅ **Smooth Animations** - CSS transition-based interactions
- ✅ **Accessible** - Built with keyboard support and focus management
- ✅ **Modern Design** - Professional styling with Tailwind CSS

## 💻 Usage

```jsx
import Calculator from './components/Calculator'

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Calculator />
    </div>
  )
}
```

## 🏗️ Architecture

### Component Structure
```
Calculator (Main Component)
├── Display (Input/Output)
└── Button Grid
    ├── Number Buttons (0-9, .)
    ├── Operator Buttons (+, -, ×, ÷)
    └── Function Buttons (Clear, =)
```

### Design Patterns Used
- **Custom Expression Evaluator** - Safe mathematical parsing
- **Reusable Button Component** - Consistent styling and behavior
- **State Management** - React hooks for clean state handling

## 🔧 Technical Implementation

- **State Management**: React useState + useRef
- **Evaluation**: Custom parser with operator precedence
- **Styling**: Tailwind CSS with modern design
- **Accessibility**: Keyboard support and focus management

## 📚 Deep Dive

For a comprehensive technical breakdown including:
- Step-by-step implementation details
- Custom expression evaluator approach
- Reusable component patterns
- Testing strategies
- Common pitfalls and solutions

👉 **[Read the full post](https://www.ebat.dev/frontend/systemdesign/design-and-building-a-calculator-FgBfHWxg4tgzY4WlBFBD7)**

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📝 License

MIT License - feel free to use in your projects!
