# Builder.js Documentation

This document explains the functionality and structure of the `builder.js` file, which powers the Muadib Builder interface.

## Overview

The Muadib Builder is a canvas-based design tool that allows users to create structures using geometric shapes. It features shape placement, movement, rotation, and snapping mechanisms to facilitate precise designs. The builder also includes save/load functionality, undo/redo capabilities, and various viewing options.

## Core Components

### 1. Canvas System

The builder uses an HTML5 Canvas element for rendering shapes and interactions. The canvas includes:

- **Zoom and Pan Controls**: Allows users to navigate the canvas
- **Grid System**: Provides alignment guides with customizable display options
- **Shape Rendering**: Handles drawing and styling of shapes

### 2. Shape Management

The builder supports three basic shape types:
- Squares
- Equilateral Triangles
- Right Triangles

Each shape has:
- Position (x, y)
- Rotation (in radians)
- Size (based on grid)
- Selection state

### 3. User Interaction Modes

The builder supports these interaction modes:
- **Shape Placement**: Adding new shapes to the canvas
- **Selection**: Selecting one or multiple shapes
- **Movement**: Dragging shapes to reposition them
- **Rotation**: Using scroll wheel or keyboard to rotate shapes

## Data Structures

### Shape Definitions

Shapes are defined with vertices in unit space (centered at origin with normalized size):

```javascript
const shapeDefinitions = {
    square: {
        vertices: [
            {x: -0.5, y: -0.5}, {x: 0.5, y: -0.5}, 
            {x: 0.5, y: 0.5}, {x: -0.5, y: 0.5}
        ],
        sides: [1, 1, 1, 1] // All sides equal length
    },
    // Additional shapes...
};
```

### Placed Shapes

Shapes on the canvas are stored in the `placedShapes` array, with each shape having:

```javascript
{
    type: 'square', // or 'triangle', 'rightTriangle'
    x: 250, // Canvas x-coordinate
    y: 300, // Canvas y-coordinate
    rotation: 0, // Rotation in radians
    size: 50 // Size in pixels
}
```

### Groups

Shapes can be grouped together for collective manipulation:

```javascript
// groups is an array of arrays
// Each inner array contains indices of shapes that are grouped together
groups = [
    [0, 1, 2], // Group 1 contains shapes at indices 0, 1, and 2
    [4, 5]     // Group 2 contains shapes at indices 4 and 5
];
```

## Key Functionalities

### 1. Shape Manipulation

#### Adding Shapes
Shapes are added by:
1. Selecting a shape type
2. Clicking on the canvas
3. The shape is added at the grid position nearest to the click

#### Selecting Shapes
Users can select shapes by:
- Clicking on a shape
- Ctrl+Click for multiple selection
- Drag-selecting an area
- Clicking on a grouped shape selects the entire group

#### Moving Shapes
Selected shapes can be moved by:
- Dragging with the mouse
- Shapes snap to grid positions
- Groups maintain their relative positions

#### Rotating Shapes
Shapes can be rotated by:
- Using the mouse wheel when shapes are selected
- Using R/Shift+R keyboard shortcuts
- Group rotation occurs around the group's center

### 2. Advanced Features

#### Snapping Mechanism
The snapping system helps align shapes precisely:

1. When moving or rotating shapes, the system checks if any side is close to another shape's side
2. If sides are compatible (same length or mathematical relationship), the shape adjusts to align perfectly
3. Different shape combinations have specific snapping rules (e.g., triangles can form hexagons)

```javascript
function checkForSnapping(shapeIndex) {
    // Complex logic that analyzes shapes and their sides
    // to determine if snapping should occur
    // ...
}
```

#### Grouping
Users can group shapes using:
- Ctrl+G keyboard shortcut after selecting multiple shapes
- Groups behave as a single unit when moved or selected
- Groups can be ungrouped by selecting all shapes in a group and pressing Ctrl+G again

#### Undo/Redo
The builder maintains an undo/redo stack:
- Each state change (adding, moving, deleting shapes) is tracked
- Ctrl+Z undoes the last action
- Ctrl+Y or Ctrl+Shift+Z redoes an undone action

### 3. Save/Load System

The builder uses localStorage to save and load designs:

#### Saving
```javascript
function saveToLocalStorage(name, data) {
    // Stores the current state with a user-provided name
    // ...
}
```

#### Loading
```javascript
function loadFromLocalStorage(name) {
    // Retrieves a saved state by name
    // ...
}
```

#### Saved Data Format
```javascript
{
    name: "Design Name",
    shapes: [ /* array of shape objects */ ],
    timestamp: "2023-01-01T12:00:00.000Z"
}
```

## UI Components

### Modals
The builder includes several modal dialogs:
- **Save Modal**: For naming and saving designs
- **Load Modal**: For selecting saved designs
- **Settings Modal**: For adjusting display options
- **Name Prompt Modal**: For naming new canvases

### Tutorial Panel
A collapsible tutorial panel provides instructions for users, explaining:
- Shape placement
- Movement and rotation
- Keyboard shortcuts
- Other features

## Keyboard Shortcuts

The builder supports numerous keyboard shortcuts:
- **1-4**: Select different tools (shapes or select mode)
- **R/Shift+R**: Rotate clockwise/counterclockwise
- **Backspace**: Delete selected shape(s)
- **Ctrl+C/Ctrl+V**: Copy/paste shapes
- **Ctrl+Z/Ctrl+Y**: Undo/redo
- **Ctrl+G**: Group/ungroup selected shapes

## Grid and Display Options

The builder offers two display modes:
1. **Fief Outline**: Shows a 5x5 center outline
2. **Advanced Fief Grid**: Shows a 10x10 repeating grid pattern

These can be toggled in the settings modal.

## Initialization and Setup

On page load, the builder:
1. Sets up the canvas and calculates appropriate dimensions
2. Initializes event listeners for all UI components
3. Sets up the tutorial panel
4. Prepares the undo/redo system

## Best Practices for Extension

When extending the builder functionality:

1. **Adding Shape Types**:
   - Add shape definition to `shapeDefinitions` object
   - Create UI button and keyboard shortcut
   - Implement any special snapping rules

2. **Adding Features**:
   - Store feature state in appropriate variables
   - Save feature state to localStorage if persistence is needed
   - Add UI controls in a consistent manner

3. **Performance Considerations**:
   - Use requestAnimationFrame for animations
   - Minimize canvas redraws
   - Optimize shape calculations for large numbers of objects
