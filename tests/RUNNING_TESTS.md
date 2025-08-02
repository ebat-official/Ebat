# Running Playwright Tests - Live Testing Guide

## 🚀 Quick Start

### Prerequisites
1. **Install dependencies**: `npm install`
2. **Install Playwright browsers**: `npx playwright install`
3. **Start your development server**: `npm run dev` (in a separate terminal)

## 🎯 Running Tests in Different Modes

### 1. **Headed Mode (See Browser Live)**
```bash
# Run all tests with visible browser
npx playwright test --headed

# Run specific test file with visible browser
npx playwright test auth/userRegistration.spec.ts --headed

# Run specific test with visible browser
npx playwright test --grep "REG-001" --headed
```

### 2. **Debug Mode (Step-by-Step)**
```bash
# Run tests in debug mode with browser inspector
npx playwright test --debug

# Debug specific test
npx playwright test auth/userRegistration.spec.ts --debug

# Debug with specific browser
npx playwright test --debug --project=chromium
```

### 3. **UI Mode (Interactive)**
```bash
# Open Playwright UI for interactive testing
npx playwright test --ui

# Open UI with specific test file
npx playwright test --ui auth/userRegistration.spec.ts
```

### 4. **Watch Mode (Auto-rerun on changes)**
```bash
# Run tests in watch mode
npx playwright test --watch

# Watch specific test file
npx playwright test auth/userRegistration.spec.ts --watch
```

### 5. **Trace Viewer (Detailed Analysis)**
```bash
# Run tests and open trace viewer
npx playwright test --trace on

# Open trace viewer for last run
npx playwright show-trace
```

## 📊 Test Reports

### HTML Report
```bash
# Generate HTML report
npx playwright test --reporter=html

# Open HTML report
npx playwright show-report
```

### JSON Report
```bash
# Generate JSON report
npx playwright test --reporter=json
```

## 🎨 Visual Testing

### Screenshot Comparison
```bash
# Take screenshots
npx playwright test --screenshot=on

# Compare screenshots
npx playwright test --screenshot=only-on-failure
```

### Video Recording
```bash
# Record videos
npx playwright test --video=on

# Record only on failure
npx playwright test --video=retain-on-failure
```

## 🔧 Browser-Specific Testing

### Chrome/Chromium
```bash
npx playwright test --project=chromium
npx playwright test --project=chromium --headed
```

### Firefox
```bash
npx playwright test --project=firefox
npx playwright test --project=firefox --headed
```

### Safari/WebKit
```bash
npx playwright test --project=webkit
npx playwright test --project=webkit --headed
```

## 🎯 Specific Test Commands

### Run Authentication Tests Only
```bash
npx playwright test auth/ --headed
```

### Run Specific Test Case
```bash
npx playwright test --grep "REG-001" --headed
```

### Run Tests with Specific Pattern
```bash
npx playwright test --grep "Register.*valid" --headed
```

### Run Tests in Parallel
```bash
npx playwright test --workers=4
```

## 🐛 Debugging Commands

### Pause Execution
```typescript
// Add this line in your test to pause execution
await page.pause();
```

### Slow Down Execution
```bash
# Run tests in slow motion (1 second delay between actions)
npx playwright test --headed --timeout=30000
```

### Open Browser DevTools
```bash
# Run with devtools open
npx playwright test --headed --devtools
```

## 📱 Mobile Testing

### Mobile Chrome
```bash
npx playwright test --project="Mobile Chrome" --headed
```

### Mobile Safari
```bash
npx playwright test --project="Mobile Safari" --headed
```

## 🔍 Advanced Debugging

### 1. **Browser Inspector Mode**
```bash
# This opens browser inspector alongside your test
npx playwright test --debug --headed
```

### 2. **Step-by-Step Debugging**
```bash
# Run with step-by-step debugging
npx playwright test --debug --headed --timeout=0
```

### 3. **Console Logging**
```typescript
// Add console logs in your tests
console.log('Current URL:', await page.url());
console.log('Element text:', await page.locator('[data-testid="title"]').textContent());
```

### 4. **Screenshot Debugging**
```typescript
// Take screenshots at specific points
await page.screenshot({ path: 'debug-screenshot.png' });
```

## 🎯 Live Testing Workflow

### Step 1: Start Development Server
```bash
# Terminal 1: Start your app
npm run dev
```

### Step 2: Run Tests in Headed Mode
```bash
# Terminal 2: Run tests with visible browser
npx playwright test auth/userRegistration.spec.ts --headed
```

### Step 3: Debug Specific Test
```bash
# Debug a specific test case
npx playwright test --grep "REG-001" --debug --headed
```

### Step 4: Use UI Mode for Interactive Testing
```bash
# Open Playwright UI for interactive testing
npx playwright test --ui
```

## 📋 Common Commands Cheat Sheet

```bash
# 🎯 Basic Commands
npx playwright test                    # Run all tests
npx playwright test --headed          # Run with visible browser
npx playwright test --debug           # Debug mode
npx playwright test --ui              # UI mode

# 🎯 Specific Tests
npx playwright test auth/             # Run auth tests only
npx playwright test --grep "REG-001" # Run specific test
npx playwright test --grep "Register" # Run tests with pattern

# 🎯 Browser Specific
npx playwright test --project=chromium --headed
npx playwright test --project=firefox --headed
npx playwright test --project=webkit --headed

# 🎯 Debugging
npx playwright test --debug --headed
npx playwright test --headed --timeout=30000
npx playwright test --headed --devtools

# 🎯 Reports
npx playwright test --reporter=html
npx playwright show-report
npx playwright show-trace

# 🎯 Watch Mode
npx playwright test --watch
npx playwright test auth/ --watch
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests not finding elements**
   ```bash
   # Run with slower execution
   npx playwright test --headed --timeout=30000
   ```

2. **Browser not starting**
   ```bash
   # Reinstall browsers
   npx playwright install
   ```

3. **Tests timing out**
   ```bash
   # Increase timeout
   npx playwright test --timeout=60000
   ```

4. **Development server not ready**
   ```bash
   # Wait for server to be ready
   npx playwright test --headed --timeout=120000
   ```

## 📊 Performance Testing

### Run Tests with Performance Metrics
```bash
# Run with performance tracking
npx playwright test --headed --timeout=30000
```

### Monitor Network Requests
```bash
# Run with network monitoring
npx playwright test --headed --devtools
```

## 🎯 Best Practices for Live Testing

1. **Use `--headed` for development** to see what's happening
2. **Use `--debug` for step-by-step debugging**
3. **Use `--ui` for interactive testing**
4. **Use `--watch` for continuous testing during development**
5. **Use `--timeout=30000` for slower execution when debugging**

## 📱 Mobile Testing Live

### Test on Mobile Viewports
```bash
# Test mobile Chrome
npx playwright test --project="Mobile Chrome" --headed

# Test mobile Safari
npx playwright test --project="Mobile Safari" --headed
```

### Test Responsive Design
```bash
# Test different viewport sizes
npx playwright test --headed --viewport-size=375,667  # iPhone
npx playwright test --headed --viewport-size=768,1024 # iPad
npx playwright test --headed --viewport-size=1920,1080 # Desktop
``` 