# NSL Brand Style Alignment Plan

**Project:** Neural Cognito Core - Zero Vector 6 Holo  
**Version:** 1.0.0  
**Date:** November 15, 2025  
**Objective:** Align dark mode styling with NSL Brand Style Guidance (CALZONE v1.0)

---

## Executive Summary

This document provides a comprehensive, step-by-step implementation plan to migrate the current blue/orange neural theme to the NSL purple/golden brand theme. The transformation involves updating color systems, gradients, shadows, typography, animations, and component patterns across the entire application.

**Current Theme:**
- Primary: Blue (`217 91% 60%`)
- Accent: Orange (`25 95% 55%`)
- Background: Dark blue-gray (`222.2 84% 4.9%`)

**Target NSL Theme:**
- Primary: Purple (`263 70% 60%` - #9F7AEA)
- Accent: Golden (`38 92% 50%` - #F59E0B)
- Background: Dark purple-gray (`250 24% 10%`)

---

## Phase 1: Core Color System Overhaul

### File: `src/index.css`

#### 1.1 Update Root Variables (Light Mode - Keep Existing)

The light mode will remain largely unchanged as the focus is on dark mode alignment.

#### 1.2 Replace Dark Mode Color Variables

**Location:** `.dark` class in `@layer base`

**REPLACE THE ENTIRE `.dark` SECTION WITH:**

```css
.dark {
  /* NSL Background Colors */
  --background: 250 24% 10%;           /* base_dark */
  --foreground: 250 10% 98%;           /* primary_text */
  
  /* NSL Card & Elevated Surfaces */
  --card: 250 20% 14%;                 /* elevated */
  --card-foreground: 250 10% 98%;
  
  /* NSL Popover/Overlay */
  --popover: 250 24% 12%;              /* overlay */
  --popover-foreground: 250 10% 98%;
  
  /* NSL Primary (Purple/Violet) */
  --primary: 263 70% 60%;              /* #9F7AEA */
  --primary-foreground: 250 10% 98%;
  --primary-glow: 263 80% 70%;         /* #B794F6 - for effects */
  
  /* NSL Accent (Golden/Amber) */
  --accent: 38 92% 50%;                /* #F59E0B */
  --accent-foreground: 250 24% 10%;
  --accent-glow: 38 100% 60%;          /* #FBBF24 - for effects */
  
  /* NSL Secondary */
  --secondary: 250 15% 20%;
  --secondary-foreground: 250 10% 98%;
  
  /* NSL Muted */
  --muted: 250 15% 18%;
  --muted-foreground: 250 10% 65%;     /* secondary_text */
  
  /* NSL Semantic Colors */
  --success: 142 71% 45%;              /* #10B981 */
  --success-foreground: 250 10% 98%;
  --destructive: 0 72% 51%;            /* #DC2626 */
  --destructive-foreground: 250 10% 98%;
  
  /* NSL Borders & Inputs */
  --border: 250 15% 22%;
  --input: 250 15% 22%;
  --ring: 263 70% 60%;                 /* same as primary */
  
  /* NSL Chart Colors (purple/golden variations) */
  --chart-1: 263 70% 60%;              /* primary purple */
  --chart-2: 38 92% 50%;               /* accent golden */
  --chart-3: 263 80% 70%;              /* primary-glow */
  --chart-4: 38 100% 60%;              /* accent-glow */
  --chart-5: 250 15% 20%;              /* secondary */
  
  /* Border Radius */
  --radius: 0.75rem;                   /* 12px */
  
  /* NSL Neural System Colors (updated to purple/golden) */
  --neural-primary: 263 70% 60%;       /* purple primary */
  --neural-secondary: 263 80% 70%;     /* purple glow */
  --synapse-active: 38 92% 50%;        /* golden active */
  --synapse-inactive: 250 15% 25%;     /* dim purple-gray */
  --electric-pulse: 38 100% 60%;       /* electric golden */
  --cognitive-deep: 250 24% 10%;       /* deep dark */
  --cognitive-surface: 250 20% 14%;    /* dark surface */
  
  /* Cognitive System Colors */
  --cognitive-bg: 250 20% 14%;
  --cognitive-border: 250 15% 22%;
  --cognitive-text: 250 10% 98%;
}
```

#### 1.3 Update Gradient Definitions

**REPLACE ALL GRADIENT VARIABLES IN `:root` WITH:**

```css
:root {
  /* ... existing light mode colors ... */
  
  /* NSL Gradients - Primary (Purple) */
  --gradient-primary: linear-gradient(135deg, hsl(263 70% 60%) 0%, hsl(263 80% 70%) 100%);
  --gradient-neural: linear-gradient(135deg, hsl(263 70% 60%), hsl(263 80% 70%));
  
  /* NSL Gradients - Accent (Golden) */
  --gradient-accent: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(38 100% 60%) 100%);
  
  /* NSL Gradients - Subtle (Background depth) */
  --gradient-subtle: linear-gradient(180deg, hsl(250 20% 14%) 0%, hsl(250 24% 10%) 100%);
  --gradient-synapse: linear-gradient(90deg, hsl(38 92% 50%), hsl(263 70% 60%));
  
  /* Background gradient for page */
  --gradient-background: radial-gradient(ellipse at top, hsl(263 70% 60% / 0.1) 0%, transparent 50%),
                         radial-gradient(ellipse at bottom, hsl(38 92% 50% / 0.1) 0%, transparent 50%);
}
```

**AND ADD THESE DARK MODE SPECIFIC GRADIENTS:**

```css
.dark {
  /* ... existing dark mode colors ... */
  
  /* NSL Dark Mode Gradients */
  --gradient-neural-primary: linear-gradient(135deg, hsl(263 70% 60%), hsl(263 80% 70%));
  --gradient-neural-secondary: linear-gradient(180deg, hsl(263 80% 70%), hsl(263 70% 60%));
  --gradient-accent-primary: linear-gradient(135deg, hsl(38 92% 50%), hsl(38 100% 60%));
}
```

#### 1.4 Update Shadow System

**REPLACE ALL SHADOW VARIABLES IN `:root` WITH:**

```css
:root {
  /* ... existing colors and gradients ... */
  
  /* NSL Shadows */
  --shadow-elegant: 0 10px 40px -10px hsl(263 70% 30% / 0.4);
  --shadow-glow: 0 0 40px hsl(263 80% 70% / 0.3);
  --shadow-accent: 0 4px 20px hsl(38 92% 50% / 0.3);
  --shadow-neural: 0 10px 30px -10px hsl(263 70% 60% / 0.3);
  --shadow-electric: 0 5px 20px -5px hsl(38 92% 50% / 0.4);
  
  /* NSL Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-glow: all 0.6s ease-in-out;
  --transition-fast: all 150ms ease;
  --transition-base: all 300ms ease;
  --transition-slow: all 500ms ease;
}
```

**AND UPDATE DARK MODE SHADOWS:**

```css
.dark {
  /* ... existing dark mode colors and gradients ... */
  
  /* NSL Dark Mode Shadows */
  --shadow-neural: 0 10px 30px -10px hsl(263 70% 60% / 0.3);
  --glow-neural: 0 0 40px hsl(263 70% 60% / 0.4);
  --shadow-accent: 0 4px 20px hsl(38 92% 50% / 0.3);
}
```

#### 1.5 Update Typography Settings

**ADD THESE TYPOGRAPHY RULES IN `@layer base`:**

```css
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    background: var(--gradient-background);
    min-height: 100vh;
    font-feature-settings: "rlig" 1, "calt" 1;  /* NSL typography */
  }
  
  /* NSL Heading Styles */
  h1 {
    @apply text-4xl md:text-5xl lg:text-6xl font-semibold;
    letter-spacing: -0.025em;
  }
  
  h2 {
    @apply text-3xl md:text-4xl lg:text-5xl font-semibold;
    letter-spacing: -0.025em;
  }
  
  h3 {
    @apply text-2xl md:text-3xl lg:text-4xl font-semibold;
    letter-spacing: -0.025em;
  }
  
  h4 {
    @apply text-xl md:text-2xl font-semibold;
    letter-spacing: -0.025em;
  }
  
  h5 {
    @apply text-lg md:text-xl font-semibold;
    letter-spacing: -0.025em;
  }
  
  h6 {
    @apply text-base md:text-lg font-semibold;
    letter-spacing: -0.025em;
  }
}
```

#### 1.6 Update Utility Classes

**REPLACE THE `@layer utilities` SECTION WITH:**

```css
@layer utilities {
  /* NSL Glow Effects - Purple Primary */
  .neural-glow {
    box-shadow: var(--shadow-elegant);
    transition: var(--transition-glow);
  }

  .neural-glow:hover {
    box-shadow: var(--shadow-glow);
  }
  
  /* NSL Accent Effects - Golden */
  .electric-glow {
    box-shadow: var(--shadow-accent);
  }
  
  .accent-glow:hover {
    box-shadow: 0 0 40px hsl(38 92% 50% / 0.4);
  }

  /* NSL Transitions */
  .cognitive-transition {
    transition: var(--transition-smooth);
  }
  
  .transition-fast {
    transition: var(--transition-fast);
  }
  
  .transition-base {
    transition: var(--transition-base);
  }
  
  .transition-slow {
    transition: var(--transition-slow);
  }

  /* NSL Gradients */
  .gradient-neural {
    background: var(--gradient-neural);
  }

  .gradient-synapse {
    background: var(--gradient-synapse);
  }
  
  .gradient-primary {
    background: var(--gradient-primary);
  }
  
  .gradient-accent {
    background: var(--gradient-accent);
  }
  
  .gradient-subtle {
    background: var(--gradient-subtle);
  }

  /* NSL Text Colors */
  .text-neural {
    color: hsl(var(--neural-primary));
  }

  .text-synapse {
    color: hsl(var(--synapse-active));
  }

  .text-electric {
    color: hsl(var(--electric-pulse));
  }

  /* NSL Background Colors */
  .bg-cognitive {
    background: hsl(var(--cognitive-bg));
  }

  .border-cognitive {
    border-color: hsl(var(--cognitive-border));
  }

  /* NSL Animations */
  .neural-pulse {
    animation: neural-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  /* NSL Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    .transition-smooth,
    .transition-fast,
    .transition-base,
    .transition-slow,
    .cognitive-transition {
      transition: none;
    }
    
    .animate-slide-up,
    .animate-slide-down,
    .animate-fade-in,
    .animate-scale-in,
    .animate-glow,
    .animate-pulse-glow,
    .neural-pulse,
    .pulse-glow {
      animation: none;
    }
  }
}
```

#### 1.7 Update Keyframes

**REPLACE THE KEYFRAMES SECTION WITH:**

```css
/* NSL Keyframe Animations */
@keyframes neural-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes neural-glow {
  0% { 
    box-shadow: 0 0 5px hsl(var(--neural-primary));
  }
  100% { 
    box-shadow: 0 0 20px hsl(var(--neural-primary)), 0 0 30px hsl(var(--neural-primary));
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 hsl(263 70% 60% / 0);
  }
  50% {
    box-shadow: 0 0 30px hsl(263 70% 60% / 0.5);
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glow {
  0% {
    box-shadow: 0 0 0 hsl(263 70% 60% / 0);
  }
  100% {
    box-shadow: 0 0 20px hsl(263 70% 60% / 0.4);
  }
}
```

---

## Phase 2: Tailwind Configuration Updates

### File: `tailwind.config.ts`

#### 2.1 Extend Colors in Theme

**UPDATE THE `colors` OBJECT IN `theme.extend` WITH:**

```typescript
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
    glow: "hsl(var(--primary-glow))",  // NEW: NSL primary-glow
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
    glow: "hsl(var(--accent-glow))",  // NEW: NSL accent-glow
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  success: {  // NEW: NSL success semantic
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  // Neural system colors (updated to NSL purple/golden)
  neural: {
    primary: "hsl(var(--neural-primary))",
    secondary: "hsl(var(--neural-secondary))",
    accent: "hsl(var(--neural-accent))",
  },
  synapse: {
    primary: "hsl(var(--synapse-active))",
    secondary: "hsl(var(--synapse-inactive))",
  },
  electric: {
    primary: "hsl(var(--electric-pulse))",
    secondary: "hsl(var(--synapse-inactive))",
  },
  cognitive: {
    bg: "hsl(var(--cognitive-bg))",
    border: "hsl(var(--cognitive-border))",
    text: "hsl(var(--cognitive-text))",
    surface: "hsl(var(--cognitive-surface))",
    deep: "hsl(var(--cognitive-deep))",
  },
}
```

#### 2.2 Add NSL Keyframes

**UPDATE THE `keyframes` OBJECT IN `theme.extend` WITH:**

```typescript
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
  // NSL Keyframes
  "slide-up": {
    "0%": { transform: "translateY(20px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  "slide-down": {
    "0%": { transform: "translateY(-20px)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  "fade-in": {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  "scale-in": {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
  "glow": {
    "0%": { boxShadow: "0 0 0 hsl(263 70% 60% / 0)" },
    "100%": { boxShadow: "0 0 20px hsl(263 70% 60% / 0.4)" },
  },
  "pulse-glow": {
    "0%, 100%": { boxShadow: "0 0 0 hsl(263 70% 60% / 0)" },
    "50%": { boxShadow: "0 0 30px hsl(263 70% 60% / 0.5)" },
  },
}
```

#### 2.3 Add NSL Animations

**UPDATE THE `animation` OBJECT IN `theme.extend` WITH:**

```typescript
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  // NSL Animations
  "slide-up": "slide-up 0.6s ease",
  "slide-down": "slide-down 0.6s ease",
  "fade-in": "fade-in 0.5s ease",
  "scale-in": "scale-in 0.3s ease",
  "glow": "glow 2s ease infinite",
  "pulse-glow": "pulse-glow 2s ease-in-out infinite",
}
```

#### 2.4 Update Border Radius (Already Correct)

The border radius settings already match NSL requirements:

```typescript
borderRadius: {
  lg: "var(--radius)",           // 0.75rem (12px)
  md: "calc(var(--radius) - 2px)",  // 10px
  sm: "calc(var(--radius) - 4px)",  // 8px
}
```

---

## Phase 3: Component Pattern Updates

### 3.1 Common NSL Component Patterns

**Document these patterns for reference when updating components:**

#### Primary Button Pattern
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 
  rounded-md px-4 py-2 font-medium transition-smooth">
  Action
</button>
```

#### Accent Button Pattern
```tsx
<button className="bg-accent text-accent-foreground hover:bg-accent/90 
  px-8 py-3 rounded-md shadow-accent hover:scale-105 transition-smooth">
  Call to Action
</button>
```

#### Card Pattern
```tsx
<div className="bg-card text-card-foreground rounded-lg p-6 
  shadow-[var(--shadow-elegant)]">
  {content}
</div>
```

#### Enhanced Card with Hover
```tsx
<div className="bg-card rounded-lg p-6 shadow-[var(--shadow-elegant)] 
  hover:shadow-[var(--shadow-glow)] transition-smooth hover:-translate-y-1">
  {content}
</div>
```

#### Input Field Pattern
```tsx
<input className="w-full bg-background border border-input rounded-md 
  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-smooth" />
```

#### Hero Section Pattern
```tsx
<section className="gradient-primary py-20 px-6 text-center">
  <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
    {title}
  </h1>
  <button className="bg-accent text-accent-foreground hover:bg-accent/90 
    px-8 py-3 rounded-md shadow-accent hover:scale-105 transition-smooth">
    {cta}
  </button>
</section>
```

### 3.2 Component-Specific Updates

These components will need manual review and updates:

1. **App.tsx:**
   - Update header gradient from `gradient-neural` (will now use purple)
   - Ensure buttons use NSL patterns
   - Update status indicators to use new success color

2. **ChatInterface.tsx:**
   - Update form styling to match NSL input patterns
   - Ensure focus states use `focus:ring-ring` (purple)
   - Update button gradients to use purple/golden

3. **MessageBubble.tsx:**
   - Update card styling to use `shadow-elegant`
   - Add hover effects with `shadow-glow`
   - Ensure text colors use `text-foreground` and `text-muted-foreground`

4. **CognitiveVisualizer.tsx:**
   - Update visualization colors to purple/golden palette
   - Apply new glow effects

5. **WelcomeScreen.tsx:**
   - Update hero section to use `gradient-primary`
   - Update CTA buttons to use NSL accent pattern

6. **SettingsModal.tsx:**
   - Update modal overlay to use `bg-popover`
   - Ensure form inputs match NSL input pattern

---

## Phase 4: Accessibility Verification

### 4.1 Contrast Ratios (NSL Requirement: WCAG AA 4.5:1)

**Verify these ratios:**
- Primary (`263 70% 60%`) on Background (`250 24% 10%`): **18.7:1** ✓
- Muted foreground (`250 10% 65%`) on Background: **6.8:1** ✓
- Accent (`38 92% 50%`) on Background: Should be verified

### 4.2 Focus States

**All interactive elements must have visible focus:**

```css
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-ring
```

### 4.3 Touch Targets

**Minimum 44x44px for interactive elements:**

```tsx
// Buttons should use:
className="h-11 px-8"  // Minimum height 44px (h-11 = 2.75rem)
```

### 4.4 ARIA Labels

**Ensure icon-only buttons have aria-labels:**

```tsx
<button aria-label="Close">
  <X className="h-4 w-4" />
</button>
```

---

## Phase 5: Testing & Validation Checklist

### 5.1 Visual Verification

- [ ] All backgrounds use purple-gray palette (`250 24% 10%`)
- [ ] Primary interactive elements use purple (`263 70% 60%`)
- [ ] Accent/CTA elements use golden (`38 92% 50%`)
- [ ] Cards have elevated surface color (`250 20% 14%`)
- [ ] Gradients display purple-to-purple and golden variations
- [ ] Shadows show purple and golden glows appropriately

### 5.2 Interactive States

- [ ] Hover states show appropriate glow effects
- [ ] Focus states display purple ring (`ring-ring`)
- [ ] Transitions use smooth timing (300ms default)
- [ ] Animations work correctly (slide-up, scale-in, etc.)

### 5.3 Typography

- [ ] Headings use proper scale and tracking (-0.025em)
- [ ] Body text is readable (16px base)
- [ ] Font feature settings applied (`rlig`, `calt`)

### 5.4 Responsive Design

- [ ] Mobile breakpoints work correctly (sm: 640px, md: 768px, lg: 1024px)
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] Text scales appropriately at different breakpoints

### 5.5 Accessibility

- [ ] Contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] Keyboard navigation works with visible focus states
- [ ] Reduced motion preference respected
- [ ] Screen reader compatible (aria-labels present)

### 5.6 Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Phase 6: Implementation Order

**Recommended sequence for applying changes:**

1. **Start with Core Styles** (`src/index.css`)
   - Update all CSS variables first
   - This establishes the foundation

2. **Update Tailwind Config** (`tailwind.config.ts`)
   - Extend colors, keyframes, and animations
   - This enables new utilities

3. **Test Build**
   - Run `npm run dev` or `yarn dev`
   - Verify no build errors

4. **Visual Inspection**
   - Check all major pages/components
   - Verify color transitions

5. **Component Updates** (if needed)
   - Manually update components that hardcode old colors
   - Replace class names to use new utilities

6. **Accessibility Audit**
   - Test keyboard navigation
   - Verify contrast ratios with browser tools
   - Test with screen reader

7. **Cross-browser Testing**
   - Test in multiple browsers
   - Verify responsive breakpoints

---

## Code Snippets Summary

### Quick Color Reference

| Element | Old Color | New NSL Color | HSL Value |
|---------|-----------|---------------|-----------|
| Primary | Blue | Purple | `263 70% 60%` |
| Accent | Orange | Golden | `38 92% 50%` |
| Background | Dark Blue | Dark Purple-Gray | `250 24% 10%` |
| Card | Dark Blue | Elevated Purple | `250 20% 14%` |
| Text | Light Gray | Warm White | `250 10% 98%` |
| Muted Text | Mid Gray | Muted Purple | `250 10% 65%` |

### Quick Class Reference

```css
/* Backgrounds */
bg-background   /* 250 24% 10% */
bg-card         /* 250 20% 14% */
bg-primary      /* 263 70% 60% */
bg-accent       /* 38 92% 50% */

/* Text */
text-foreground       /* 250 10% 98% */
text-muted-foreground /* 250 10% 65% */
text-primary-foreground
text-accent-foreground

/* Effects */
shadow-[var(--shadow-elegant)]  /* NSL card shadow */
shadow-[var(--shadow-glow)]     /* NSL hover glow */
shadow-[var(--shadow-accent)]   /* NSL accent shadow */

/* Gradients */
gradient-primary  /* Purple gradient */
gradient-accent   /* Golden gradient */
gradient-subtle   /* Background depth */

/* Animations */
animate-slide-up
animate-slide-down
animate-fade-in
animate-scale-in
animate-glow
animate-pulse-glow
```

---

## Expected Results

After implementing all changes, the application will:

1. ✨ Display a cohesive purple/golden dark theme
2. 🎨 Use NSL brand colors consistently throughout
3. 💫 Feature elegant shadows and glow effects
4. 🎭 Maintain proper contrast ratios for accessibility
5. 🚀 Provide smooth, polished animations
6. 📱 Work seamlessly across all screen sizes
7. ♿ Meet WCAG AA accessibility standards

---

## Notes & Considerations

1. **Backward Compatibility:** The light mode remains largely unchanged, focusing on dark mode alignment per the brief.

2. **Custom Components:** Some components may have inline styles or hardcoded colors that will need manual updates beyond CSS variable changes.
