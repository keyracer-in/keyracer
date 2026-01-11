# Design System Quick Reference

## Files

- **`design-system.css`** - Core design system (import this first!)
- **`ai-career-agent-enhanced.css`** - Component styles (imports design system)

## Quick Start

### 1. Import in HTML

```html
<head>
  <!-- Design System Foundation (import first) -->
  <link rel="stylesheet" href="../styles/design-system.css">
  
  <!-- Component Styles -->
  <link rel="stylesheet" href="../styles/ai-career-agent-enhanced.css">
</head>
```

### 2. Add Theme Manager

```html
<body>
  <!-- Your content -->
  
  <!-- Scripts (theme manager loads first) -->
  <script src="../scripts/theme-manager.js"></script>
  <script src="../scripts/theme-toggle-ui.js"></script>
  <script src="../scripts/your-app.js"></script>
</body>
```

### 3. Use Design Tokens

```css
.my-component {
  /* Colors */
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  
  /* Typography */
  font-family: var(--font-family);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  
  /* Spacing */
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-8);
  
  /* Border Radius */
  border-radius: var(--radius-lg);
  
  /* Shadows */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--transition-base);
}
```

## Common Patterns

### Button
```css
.btn {
  padding: var(--space-3) var(--space-6);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Card
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

### Input
```css
.input {
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
}

.input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}
```

## Theme Management

### JavaScript API

```javascript
// Set theme
window.themeManager.setTheme('dark');  // 'light', 'dark', or 'auto'

// Toggle theme
window.themeManager.toggle();

// Get current theme
const theme = window.themeManager.getCurrentTheme();

// Check if dark mode
if (window.themeManager.isDarkMode()) {
  // Do something
}

// Listen for changes
window.addEventListener('themechange', (e) => {
  console.log('Theme:', e.detail.actual);
});
```

## Responsive Design

```css
/* Mobile first */
.component {
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    width: 33.333%;
  }
}
```

## Color Reference

### Light Mode
- Primary: `#7c3aed` (purple)
- Secondary: `#06b6d4` (cyan)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)

### Dark Mode
- Primary: `#a78bfa` (light purple)
- Secondary: `#22d3ee` (bright cyan)
- Success: `#34d399` (bright green)
- Warning: `#fbbf24` (bright amber)
- Error: `#f87171` (bright red)

## Testing

Open `design-system-test.html` to see all components and test theme switching.

## Documentation

See `keyracer/docs/design-system-guide.md` for complete documentation.
