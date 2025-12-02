# 🎨 UI Features Guide - AI Career Agent

## 🌟 Key Visual Features

### 1. **Dark Theme Design**
```
Background: Deep blue-slate gradient
Cards: Elevated with subtle shadows
Text: High contrast white/gray
Accents: Vibrant indigo, green, amber
```

### 2. **Mode Buttons**
- **Inactive**: Gray border, transparent background
- **Hover**: Blue border, slight lift, shimmer effect
- **Active**: Gradient background (indigo), white text, shadow

### 3. **Message Types**

#### User Messages
- Right-aligned
- Green gradient background
- White text
- Rounded corners

#### Bot Messages
- Left-aligned
- Dark card background
- Light text
- Blue avatar

#### System Messages
- Amber/yellow tint
- Information icon
- Centered content

#### Error Messages
- Red tint
- Warning icon
- Clear error state

### 4. **Interactive Elements**

#### Buttons
```
Default: Subtle background
Hover: Lift effect + shadow
Active: Pressed state
Disabled: Faded appearance
```

#### Input Field
```
Default: Dark with border
Focus: Blue ring glow
Typing: Active state
```

#### Upload Button
```
Default: Green gradient
Hover: Lift + enhanced shadow
Click: Scale down
```

### 5. **Animations**

#### Message Appearance
```
Duration: 0.4s
Effect: Slide up + fade in
Easing: Cubic bezier
```

#### Mode Switch
```
Duration: 0.3s
Effect: Fade out/in
Smooth transition
```

#### Typing Indicator
```
Duration: 1.4s
Effect: Pulsing dots
Infinite loop
```

#### Notifications
```
Duration: 0.3s
Effect: Slide from right
Auto-dismiss: 3s
```

### 6. **Status Indicators**

#### AI Agent Status
- Bottom right corner
- Green gradient
- Pulsing dot
- "Online" text

#### Typing Indicator
- Bottom center
- Three animated dots
- Dark card background

### 7. **Scrollbar**
```
Width: 8px
Track: Dark background
Thumb: Gray, turns blue on hover
Smooth scrolling
```

## 🎯 User Interactions

### Hover Effects
1. **Mode Buttons**: Border glow + lift
2. **Send Button**: Scale up + shadow
3. **Upload Button**: Lift + shadow
4. **History Items**: Slide right + highlight

### Click Effects
1. **Buttons**: Scale down briefly
2. **Mode Switch**: Fade transition
3. **Send Message**: Smooth scroll

### Focus States
1. **Input Field**: Blue ring glow
2. **Buttons**: Outline visible
3. **File Input**: Visual feedback

## 📱 Responsive Behavior

### Desktop (>768px)
- Sidebar visible
- Three-column layout
- Full mode buttons

### Mobile (<768px)
- Sidebar hidden
- Single column
- Stacked mode buttons
- Larger touch targets

## 🎨 Color Usage

### Primary Actions
- **Send**: Indigo gradient
- **Upload**: Green gradient
- **Active Mode**: Indigo gradient

### Status Colors
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)
- **Info**: Indigo (#6366f1)

### Text Colors
- **Primary**: Light gray (#f1f5f9)
- **Secondary**: Medium gray (#94a3b8)
- **Accent**: White (#ffffff)

## 🔧 Accessibility Features

### Contrast Ratios
- Text: 7:1 (AAA)
- Buttons: 4.5:1 (AA)
- Icons: High contrast

### Interactive Elements
- Min size: 44x44px
- Clear focus states
- Keyboard navigation
- Screen reader friendly

## 💡 Pro Tips

### For Best Experience
1. Use on desktop for full features
2. Dark mode friendly
3. Smooth on 60Hz+ displays
4. Works in all modern browsers

### Performance
- Hardware accelerated animations
- Optimized CSS
- Minimal repaints
- Smooth 60fps

## 🎬 Animation Timeline

### Page Load
```
0ms: Page appears
500ms: Welcome message slides in
```

### Mode Switch
```
0ms: Fade out messages
300ms: Clear and fade in new message
```

### Send Message
```
0ms: Message appears
100ms: Scroll to bottom
```

### File Upload
```
0ms: System message appears
Xms: Analysis in progress
Xms: Result slides in
Xms: Notification appears
3s: Notification fades out
```

## 🎨 Design Tokens

```css
/* Spacing */
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px

/* Border Radius */
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1)
--shadow-md: 0 4px 12px rgba(0,0,0,0.2)
--shadow-lg: 0 8px 24px rgba(0,0,0,0.3)

/* Transitions */
--transition-fast: 0.2s
--transition-base: 0.3s
--transition-slow: 0.4s
```

## 🚀 Quick Reference

### Most Used Classes
- `.mode-btn` - Mode switcher buttons
- `.message` - Message container
- `.message-content` - Message text
- `.send-btn` - Send button
- `.upload-btn` - Upload button

### Most Used Animations
- `slideIn` - Message appearance
- `typing` - Typing indicator
- `pulse` - Status indicator
- `slideInRight` - Notifications

---

**Design System**: Complete
**Accessibility**: WCAG 2.1 AA
**Performance**: 60fps animations
**Browser Support**: All modern browsers
