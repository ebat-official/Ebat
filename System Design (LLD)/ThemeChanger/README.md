👉 **[Read the full post](https://www.ebat.dev/frontend/systemdesign/lld/build-theme-changer-component-in-react-yFfaZAhQBCpPkdfEqs2Lf)**

# Theme Changer Component - Low Level Design

A React Theme Changer component built using the **Context API** and **Tailwind CSS** for seamless light/dark mode switching with persistence and system preference detection.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 📖 Overview

This theme changer component demonstrates advanced React patterns:
- **Context API** for global theme state management
- **localStorage Integration** for persistent user preferences
- **System Preference Detection** using `prefers-color-scheme` media query
- **Smooth Theme Transitions** with Tailwind CSS animations
- **TypeScript Support** for type safety and better developer experience

## 🎯 Key Features

- ✅ **Persistent Themes** - Remembers user preference across sessions
- ✅ **System Integration** - Automatically detects user's system preference
- ✅ **Smooth Transitions** - CSS animations for professional feel
- ✅ **TypeScript Safety** - Full type safety with proper interfaces
- ✅ **Accessibility** - Built with ARIA labels and keyboard support
- ✅ **Extensible** - Easy to add new themes and customize

## 💻 Usage

```jsx
import { ThemeProvider } from './ThemeContext'
import ThemeChanger from './ThemeChanger'

function App() {
  return (
    <ThemeProvider>
      <div className="bg-blue-100 dark:bg-gray-900">
        <ThemeChanger />
      </div>
    </ThemeProvider>
  )
}
```

## 🏗️ Architecture

### Component Structure
```
ThemeProvider (Context Provider)
└── ThemeChanger (Consumer)
    ├── Light Button
    └── Dark Button
```

### Design Patterns Used
- **Context API Pattern** - Global theme state management
- **Custom Hook Pattern** - Clean API with `useTheme()`
- **Persistence Pattern** - localStorage integration
- **System Integration** - Media query detection

## 🔧 Technical Implementation

- **State Management**: React Context + useState + useEffect
- **Persistence**: localStorage with fallback to system preference
- **Styling**: Tailwind CSS with `darkMode: 'class'` configuration
- **TypeScript**: Full type safety with interfaces and error handling
- **Accessibility**: ARIA labels and keyboard support

## 🎨 Theme System

### Supported Themes
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes for low-light usage
- **System Preference** - Automatically follows user's OS setting

### Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',  // Essential for theme switching
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 🚨 Common Issues & Solutions

**Issue**: Theme switching doesn't work visually
**Solution**: Ensure `darkMode: 'class'` is in `tailwind.config.js`

**Issue**: TypeScript errors with `useTheme`
**Solution**: Add proper `ThemeContextType` interface and error handling

**Issue**: Import errors with `.tsx` files
**Solution**: Use explicit file extensions: `import { useTheme } from './ThemeContext.tsx'`

## 📚 Deep Dive

For a comprehensive technical breakdown including:
- Step-by-step implementation details
- Context API pattern explanations
- Tailwind CSS dark mode configuration
- TypeScript type safety implementation
- Testing strategies
- Common pitfalls and solutions

👉 **[Read the full technical blog post](https://www.ebat.dev/frontend/systemdesign/lld/build-theme-changer-component-in-react-yFfaZAhQBCpPkdfEqs2Lf)**

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

## 🎯 Interview LLD Focus

This component demonstrates key concepts for frontend LLD interviews:

### React Patterns
- **Context API** for global state management
- **Custom Hooks** for clean component APIs
- **useEffect** for side effects and lifecycle management

### UX Considerations
- **Persistence** for better user experience
- **System Integration** for accessibility
- **Smooth Transitions** for professional feel

### Production Readiness
- **TypeScript** for type safety
- **Error Handling** with proper boundaries
- **Accessibility** with ARIA support
- **Performance** with optimized re-renders

## 📝 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ for frontend LLD interviews**