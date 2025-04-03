# Muadib Styling Guidelines

This document outlines the styling conventions and rules for the Muadib application. Following these guidelines ensures visual consistency across the project.

## Core Styling Principles

### 1. Tailwind CSS First

- **Always use Tailwind CSS utility classes when possible**
- Avoid writing custom CSS except for specialized effects
- Use Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`) for responsive design

```html
<!-- Good: Using Tailwind classes -->
<div class="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-6 shadow-lg">
  <h2 class="text-xl mb-4 text-purple-900">Title</h2>
</div>

<!-- Avoid: Using custom classes when Tailwind alternatives exist -->
<div class="custom-container">
  <h2 class="custom-title">Title</h2>
</div>
```

### 2. Color Palette

- Primary: Purple (`text-purple-900`, `bg-purple-600`, etc.)
- Secondary: White with transparency for glass effects
- Accent: Orange-red for selections (`#ff5733`)
- Background: Image with cream-colored overlays (`#f8f4e5`)

### 3. Glass Effect Standards

All glass/frosted glass effects must use these standard Tailwind utility combinations:

```html
<!-- Standard glass panel -->
<div class="bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-lg">
  <!-- Content -->
</div>

<!-- Enhanced glass modal with animation -->
<div class="bg-white bg-opacity-15 backdrop-blur-md border border-white border-opacity-25 rounded-lg animate-purpleGlow">
  <!-- Content -->
</div>

<!-- Modal backdrop -->
<div class="bg-transparent backdrop-blur-md">
  <!-- Content -->
</div>
```

## Custom CSS Classes

Only use these custom classes when necessary:

### 1. Layout Classes

- `header-styles`: Standard header styling
- `footer-styles`: Standard footer styling
- `command-input-container`: Container for command inputs with prefix styling

### 2. Animation Classes

- `purple-glow`: Adds animated purple glow effect
- `animate-purpleGlow`: Tailwind-compatible version of the purple glow animation
- `invalid-command`: Styling for invalid command input with pulse animation

## Button Styling

Standard button styling:

```html
<button class="px-4 py-2 bg-purple-600 text-white rounded-md 
               hover:bg-purple-700 transition-colors">
  Button Text
</button>
```

Icon buttons:

```html
<button class="flex items-center justify-center w-[60px] h-[60px] mx-2 p-3 
               bg-white bg-opacity-20 backdrop-blur-md rounded-lg 
               border border-white border-opacity-20 
               transition-all duration-300 hover:bg-opacity-30 hover:-translate-y-0.5 
               shadow-md">
  <!-- SVG icon -->
</button>
```

## Form Elements

Input fields should use this styling:

```html
<input type="text" class="w-full px-4 py-2 rounded-md 
                         border border-purple-300 
                         focus:outline-none focus:ring-2 focus:ring-purple-500">
```

Text areas should use this styling:

```html
<textarea class="w-full p-2 rounded-lg bg-purple-200 bg-opacity-50 
                focus:outline-none focus:ring-2 focus:ring-purple-500 purple-glow"></textarea>
```

## Component Organization

Organize components in this order:

1. Page header
2. Main content (with appropriate sectioning)
3. Modals and dialogs
4. Footer

Following these guidelines ensures that the Muadib application maintains a consistent visual language and makes future development and collaboration smoother.
