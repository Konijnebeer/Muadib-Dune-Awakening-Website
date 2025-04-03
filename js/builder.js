document.addEventListener('DOMContentLoaded', function() {
    // Initialize canvas
    const canvas = document.getElementById('builder-canvas');
    const ctx = canvas.getContext('2d');
    
    // Colors
    const creamColor = '#f8f4e5';
    const purpleColor = '#7e22ce';
    const purpleFillColor = 'rgba(126, 34, 206, 0.2)'; // Semi-transparent fill
    const selectedColor = '#ff5733'; // Reddish-orange highlight color for selected shape
    const selectionBoxColor = 'rgba(255, 87, 51, 0.2)'; // Semi-transparent selection box
    const selectionBorderColor = 'rgba(255, 87, 51, 0.8)'; // Selection box border
    
    // State variables
    let selectedShapeType = null;
    let placedShapes = [];
    let selectedShapeIndex = -1;
    let selectedShapes = []; // Array of indices for multiple selection
    let isDragging = false;
    let isPanning = false; // For right-click panning
    let isSelecting = false; // For drag-to-select box
    let isInSelectMode = false; // Whether we're in select mode
    let lastMousePos = { x: 0, y: 0 };
    let selectionStart = { x: 0, y: 0 }; // Start of selection box
    let gridSize = 0; // Will be calculated based on canvas height
    
    // Canvas view state
    let zoomLevel = 1.0;
    let canvasOffsetX = 0;
    let canvasOffsetY = 0;
    
    // Tutorial state
    let tutorialVisible = true;
    
    // Settings state
    let fiefOutlineEnabled = false;
    let advancedFiefGridEnabled = false;
    
    // Undo/Redo stacks
    let undoStack = [];
    let redoStack = [];
    
    // Group tracking
    let groups = []; // Array of arrays, each inner array contains shape indices that are grouped
    
    // Get button elements
    const squareBtn = document.getElementById('square-btn');
    const triangleBtn = document.getElementById('triangle-btn');
    const rightTriangleBtn = document.getElementById('right-triangle-btn');
    const selectBtn = document.getElementById('select-btn');
    
    // Get modal elements
    const saveModal = document.getElementById('save-modal');
    const loadModal = document.getElementById('load-modal');
    const settingsModal = document.getElementById('settings-modal');
    const namePromptModal = document.getElementById('name-prompt-modal');
    const saveForm = document.getElementById('save-form');
    const saveNameInput = document.getElementById('save-name');
    const savedList = document.getElementById('saved-list');
    const newCanvasForm = document.getElementById('new-canvas-form');
    const canvasNameInput = document.getElementById('canvas-name');
    
    // Settings elements
    const fiefOutlineToggle = document.getElementById('fief-outline-toggle');
    const advancedFiefGridToggle = document.getElementById('advanced-fief-grid-toggle');
    
    // Save/Load button elements
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const cancelSaveBtn = document.getElementById('cancel-save');
    const cancelLoadBtn = document.getElementById('cancel-load');
    const newCanvasBtn = document.getElementById('new-canvas-btn');
    const cancelNewCanvasBtn = document.getElementById('cancel-new-canvas');
    const closeSettingsBtn = document.getElementById('close-settings');
    
    // New UI elements
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const understoodBtn = document.getElementById('understood-btn');
    const tutorialPanel = document.getElementById('tutorial-panel');
    const builderContent = document.getElementById('builder-content');
    
    // Current loaded save name (if any)
    let currentSaveName = null;
    
    // Shape definitions with unit vertices and side lengths
    const shapeDefinitions = {
        square: {
            vertices: [
                {x: -0.5, y: -0.5}, {x: 0.5, y: -0.5}, 
                {x: 0.5, y: 0.5}, {x: -0.5, y: 0.5}
            ],
            sides: [1, 1, 1, 1] // All sides equal length
        },
        triangle: {
            vertices: [
                {x: 0, y: -0.5773502692}, // Top vertex, height = √3/3
                {x: 0.5, y: 0.2886751346}, // Bottom right vertex
                {x: -0.5, y: 0.2886751346}  // Bottom left vertex
            ],
            sides: [1, 1, 1] // Equilateral triangle with sides of exactly length 1
        },
        rightTriangle: {
            vertices: [
                {x: -0.5, y: -0.5}, {x: 0.5, y: -0.5}, {x: -0.5, y: 0.5}
            ],
            sides: [1, Math.sqrt(2), 1] // Right triangle with hypotenuse = √2
        }
    };
    
    // Helper function to save current state to undo stack
    function saveToUndoStack() {
        undoStack.push({
            shapes: JSON.parse(JSON.stringify(placedShapes)),
            groups: JSON.parse(JSON.stringify(groups))
        });
        // Clear redo stack when new action is taken
        redoStack = [];
        
        // Limit undo stack size to prevent memory issues
        if (undoStack.length > 30) {
            undoStack.shift();
        }
    }
    
    // Undo the last action
    function undo() {
        if (undoStack.length === 0) return;
        
        // Save current state to redo stack
        redoStack.push({
            shapes: JSON.parse(JSON.stringify(placedShapes)),
            groups: JSON.parse(JSON.stringify(groups))
        });
        
        // Restore previous state
        const prevState = undoStack.pop();
        placedShapes = prevState.shapes;
        groups = prevState.groups;
        
        // Clear selection
        selectedShapeIndex = -1;
        selectedShapes = [];
        
        redrawCanvas();
    }
    
    // Redo the previously undone action
    function redo() {
        if (redoStack.length === 0) return;
        
        // Save current state to undo stack
        undoStack.push({
            shapes: JSON.parse(JSON.stringify(placedShapes)),
            groups: JSON.parse(JSON.stringify(groups))
        });
        
        // Restore next state
        const nextState = redoStack.pop();
        placedShapes = nextState.shapes;
        groups = nextState.groups;
        
        // Clear selection
        selectedShapeIndex = -1;
        selectedShapes = [];
        
        redrawCanvas();
    }
    
    // Set canvas size and calculate grid
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 600; // Taller canvas
        
        // Calculate grid size to fit at least 20 squares in height (making shapes larger)
        gridSize = Math.floor(canvas.height / 20);
        
        redrawCanvas();
    }
    
    // Handle tutorial visibility and canvas resize accordingly
    function toggleTutorial() {
        tutorialVisible = !tutorialVisible;
        
        if (tutorialVisible) {
            tutorialPanel.classList.remove('hidden');
            builderContent.classList.remove('w-full');
            builderContent.classList.add('w-3/4');
        } else {
            tutorialPanel.classList.add('hidden');
            builderContent.classList.remove('w-3/4');
            builderContent.classList.add('w-full');
        }
        
        // Resize canvas after DOM update
        setTimeout(resizeCanvas, 100);
    }
    
    // Initial setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Add event listeners for zoom controls
    zoomInBtn.addEventListener('click', function() {
        zoomCanvas(0.1); // Zoom in by 10%
    });
    
    zoomOutBtn.addEventListener('click', function() {
        zoomCanvas(-0.1); // Zoom out by 10%
    });
    
    // Add event listener for tutorial close button
    understoodBtn.addEventListener('click', toggleTutorial);
    
    // Button event listeners
    squareBtn.addEventListener('click', function() {
        selectShapeType('square');
    });
    
    triangleBtn.addEventListener('click', function() {
        selectShapeType('triangle');
    });
    
    rightTriangleBtn.addEventListener('click', function() {
        selectShapeType('rightTriangle');
    });
    
    selectBtn.addEventListener('click', function() {
        enterSelectMode();
    });
    
    // Save/Load event listeners
    saveBtn.addEventListener('click', openSaveModal);
    loadBtn.addEventListener('click', openLoadModal);
    settingsBtn.addEventListener('click', openSettingsModal);
    cancelSaveBtn.addEventListener('click', () => saveModal.classList.add('hidden'));
    cancelLoadBtn.addEventListener('click', () => loadModal.classList.add('hidden'));
    newCanvasBtn.addEventListener('click', openNamePromptModal);
    cancelNewCanvasBtn.addEventListener('click', () => namePromptModal.classList.add('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    saveForm.addEventListener('submit', handleSave);
    newCanvasForm.addEventListener('submit', handleNewCanvas);
    
    // Settings toggle listeners
    fiefOutlineToggle.addEventListener('click', function() {
        fiefOutlineEnabled = !fiefOutlineEnabled;
        if (fiefOutlineEnabled) {
            advancedFiefGridEnabled = false;
        }
        updateFiefToggleUI();
        redrawCanvas();
    });
    
    advancedFiefGridToggle.addEventListener('click', function() {
        advancedFiefGridEnabled = !advancedFiefGridEnabled;
        if (advancedFiefGridEnabled) {
            fiefOutlineEnabled = false;
        }
        updateFiefToggleUI();
        redrawCanvas();
    });
    
    // Function to update the toggle UI based on current settings
    function updateFiefToggleUI() {
        // Get all checkmark elements inside toggle buttons
        const fiefOutlineCheckmark = fiefOutlineToggle.querySelector('.fief-checkmark');
        const advancedFiefGridCheckmark = advancedFiefGridToggle.querySelector('.fief-checkmark');
        
        // Toggle active style and checkmark visibility based on state
        if (fiefOutlineEnabled) {
            fiefOutlineToggle.classList.add('shadow-lg', 'shadow-purple-300/50');
            fiefOutlineCheckmark.classList.remove('hidden');
        } else {
            fiefOutlineToggle.classList.remove('shadow-lg', 'shadow-purple-300/50');
            fiefOutlineCheckmark.classList.add('hidden');
        }
        
        if (advancedFiefGridEnabled) {
            advancedFiefGridToggle.classList.add('shadow-lg', 'shadow-purple-300/50');
            advancedFiefGridCheckmark.classList.remove('hidden');
        } else {
            advancedFiefGridToggle.classList.remove('shadow-lg', 'shadow-purple-300/50');
            advancedFiefGridCheckmark.classList.add('hidden');
        }
    }
    
    // Function to enter select mode
    function enterSelectMode() {
        isInSelectMode = true;
        selectedShapeType = null;
        updateButtonStyles();
    }
    
    // Function to select shape type and update buttons
    function selectShapeType(type) {
        selectedShapeType = type;
        isInSelectMode = false;
        updateButtonStyles();
        deselectShape();
    }
    
    // Update button styles based on selection
    function updateButtonStyles() {
        // Remove active style from all buttons
        squareBtn.classList.remove('shadow-lg', 'shadow-purple-300/50');
        triangleBtn.classList.remove('shadow-lg', 'shadow-purple-300/50');
        rightTriangleBtn.classList.remove('shadow-lg', 'shadow-purple-300/50');
        selectBtn.classList.remove('shadow-lg', 'shadow-purple-300/50');
        
        // Add active style to selected button
        if (selectedShapeType === 'square') {
            squareBtn.classList.add('shadow-lg', 'shadow-purple-300/50');
        } else if (selectedShapeType === 'triangle') {
            triangleBtn.classList.add('shadow-lg', 'shadow-purple-300/50');
        } else if (selectedShapeType === 'rightTriangle') {
            rightTriangleBtn.classList.add('shadow-lg', 'shadow-purple-300/50');
        } else if (isInSelectMode) {
            selectBtn.classList.add('shadow-lg', 'shadow-purple-300/50');
        }
    }
    
    // Copy selected shapes
    function copySelectedShapes() {
        if (selectedShapes.length === 0) return null;
        
        return selectedShapes.map(index => JSON.parse(JSON.stringify(placedShapes[index])));
    }
    
    // Paste shapes at mouse position
    function pasteShapes(copiedShapes, mousePos) {
        if (!copiedShapes || copiedShapes.length === 0) return;
        
        // Calculate center of copied shapes
        let centerX = 0;
        let centerY = 0;
        
        copiedShapes.forEach(shape => {
            centerX += shape.x;
            centerY += shape.y;
        });
        
        centerX /= copiedShapes.length;
        centerY /= copiedShapes.length;
        
        // Calculate offset from center to mouse position
        const offsetX = mousePos.x - centerX;
        const offsetY = mousePos.y - centerY;
        
        // Save current state for undo
        saveToUndoStack();
        
        // Add new shapes with offset and clear previous selection
        selectedShapes = [];
        const startIndex = placedShapes.length;
        
        copiedShapes.forEach(shape => {
            const newShape = JSON.parse(JSON.stringify(shape));
            newShape.x += offsetX;
            newShape.y += offsetY;
            placedShapes.push(newShape);
            selectedShapes.push(placedShapes.length - 1);
        });
        
        // If pasted shapes were in a group, maintain that relationship
        if (selectedShapes.length > 1) {
            groups.push([...selectedShapes]);
        }
        
        redrawCanvas();
    }
    
    // Group selected shapes
    function groupSelectedShapes() {
        if (selectedShapes.length <= 1) return;
        
        // Save current state for undo
        saveToUndoStack();
        
        // Check if all selected shapes are from a single existing group
        let existingGroup = null;
        let allFromSameGroup = true;
        
        // Find if there's a group containing the first selected shape
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].includes(selectedShapes[0])) {
                existingGroup = groups[i];
                break;
            }
        }
        
        // If we found a group, check if all selected shapes are from this group
        if (existingGroup) {
            // Check if all selected shapes are in this group
            allFromSameGroup = selectedShapes.every(index => existingGroup.includes(index));
            
            // Check if we've selected all shapes from the group
            const allGroupShapesSelected = existingGroup.every(index => selectedShapes.includes(index));
            
            // If all selected shapes are from the same group and all group shapes are selected
            // then this is an ungroup operation
            if (allFromSameGroup && allGroupShapesSelected) {
                // Remove the group
                groups = groups.filter(group => group !== existingGroup);
                redrawCanvas();
                return;
            }
        }
        
        // If we get here, we're creating a new group or merging groups
        
        // Remove selected shapes from any existing groups
        for (let i = 0; i < groups.length; i++) {
            groups[i] = groups[i].filter(index => !selectedShapes.includes(index));
        }
        
        // Remove empty groups
        groups = groups.filter(group => group.length > 1);
        
        // Create new group with selected shapes
        groups.push([...selectedShapes]);
        
        redrawCanvas();
    }
    
    // Find all shapes in the same group as the given shape
    function findGroupForShape(shapeIndex) {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].includes(shapeIndex)) {
                return groups[i];
            }
        }
        return null;
    }
    
    // Toggle a shape's selection state
    function toggleShapeSelection(shapeIndex, isCtrlPressed) {
        // Check if shape is part of a group
        const group = findGroupForShape(shapeIndex);
        
        if (group && !isCtrlPressed) {
            // If clicking a grouped shape and not holding Ctrl, select the whole group
            selectedShapes = [...group];
            selectedShapeIndex = shapeIndex;
        } else {
            // Normal selection behavior with Ctrl
            const selectionIndex = selectedShapes.indexOf(shapeIndex);
            
            if (selectionIndex === -1) {
                // Add to selection if Ctrl is pressed, otherwise replace selection
                if (isCtrlPressed) {
                    selectedShapes.push(shapeIndex);
                } else {
                    selectedShapes = [shapeIndex];
                }
                selectedShapeIndex = shapeIndex;
            } else if (isCtrlPressed) {
                // Remove from selection if Ctrl is pressed and already selected
                selectedShapes.splice(selectionIndex, 1);
                selectedShapeIndex = selectedShapes.length > 0 ? selectedShapes[0] : -1;
            }
        }
    }
    
    // Add keyboard shortcuts for quick shape selection and other actions
    document.addEventListener('keydown', function(e) {
        // Prevent browser defaults for app keyboard shortcuts
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z' || 
            e.key === 'y' || e.key === 'Y' || 
            (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
            e.preventDefault();
        }
        
        // Number keys 1-4 for tool selection
        if (e.key === '1') {
            selectShapeType('square');
        } else if (e.key === '2') {
            selectShapeType('triangle');
        } else if (e.key === '3') {
            selectShapeType('rightTriangle');
        } else if (e.key === '4') {
            enterSelectMode();
        }
        // Rotation with R and Shift+R
        else if (e.key === 'r' || e.key === 'R') {
            if (selectedShapes.length > 0) {
                // Save current state for undo
                saveToUndoStack();
                
                // Rotation step in radians (15 degrees)
                const rotationStep = Math.PI / 12;
                
                // Determine rotation direction based on shift key
                const direction = e.shiftKey ? -1 : 1;
                
                if (selectedShapes.length === 1) {
                    // Single shape rotation
                    const index = selectedShapes[0];
                    placedShapes[index].rotation += direction * rotationStep;
                    
                    // Normalize rotation
                    placedShapes[index].rotation = 
                        (placedShapes[index].rotation + 2 * Math.PI) % (2 * Math.PI);
                    
                    // Check for snapping
                    checkForSnapping(index);
                } else {
                    // Calculate center of selection
                    let centerX = 0;
                    let centerY = 0;
                    
                    selectedShapes.forEach(index => {
                        centerX += placedShapes[index].x;
                        centerY += placedShapes[index].y;
                    });
                    
                    centerX /= selectedShapes.length;
                    centerY /= selectedShapes.length;
                    
                    // Rotate each shape around the center
                    selectedShapes.forEach(index => {
                        // Get relative position to center
                        const relX = placedShapes[index].x - centerX;
                        const relY = placedShapes[index].y - centerY;
                        
                        // Apply rotation to position
                        const cos = Math.cos(direction * rotationStep);
                        const sin = Math.sin(direction * rotationStep);
                        
                        placedShapes[index].x = centerX + (relX * cos - relY * sin);
                        placedShapes[index].y = centerY + (relX * sin + relY * cos);
                        
                        // Rotate the shape itself
                        placedShapes[index].rotation += direction * rotationStep;
                        placedShapes[index].rotation = 
                            (placedShapes[index].rotation + 2 * Math.PI) % (2 * Math.PI);
                    });
                }
                
                redrawCanvas();
            }
        }
        // Backspace for shape deletion
        else if (e.key === 'Backspace' && selectedShapes.length > 0) {
            // Save current state for undo
            saveToUndoStack();
            
            // Sort indices in descending order to avoid shifting issues
            const indicesToRemove = [...selectedShapes].sort((a, b) => b - a);
            
            // Remove the selected shapes
            indicesToRemove.forEach(index => {
                placedShapes.splice(index, 1);
                
                // Update groups to reflect removed shapes
                for (let i = 0; i < groups.length; i++) {
                    // Remove the index from the group
                    const groupIndex = groups[i].indexOf(index);
                    if (groupIndex !== -1) {
                        groups[i].splice(groupIndex, 1);
                    }
                    
                    // Adjust indices greater than the removed index
                    groups[i] = groups[i].map(groupIndex => 
                        groupIndex > index ? groupIndex - 1 : groupIndex
                    );
                }
            });
            
            // Remove empty groups
            groups = groups.filter(group => group.length > 1);
            
            // Deselect
            selectedShapeIndex = -1;
            selectedShapes = [];
            
            // Redraw canvas
            redrawCanvas();
        }
        // Ctrl+C to copy
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            window.copiedShapes = copySelectedShapes();
        }
        // Ctrl+V to paste
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            if (window.copiedShapes) {
                // Get current mouse position
                const rect = canvas.getBoundingClientRect();
                const mouseX = lastMousePos.x || rect.width / 2;
                const mouseY = lastMousePos.y || rect.height / 2;
                const canvasCoords = screenToCanvas(mouseX + rect.left, mouseY + rect.top);
                
                pasteShapes(window.copiedShapes, canvasCoords);
            }
        }
        // Ctrl+Z to undo
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
            e.preventDefault(); // Prevent browser default
            undo();
        }
        // Ctrl+Y or Ctrl+Shift+Z to redo
        else if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || 
                 (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
            e.preventDefault(); // Prevent browser default
            redo();
        }
        // Ctrl+G to group selected shapes
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
            groupSelectedShapes();
        }
    }, { capture: true });
    
    // Function to zoom canvas
    function zoomCanvas(delta) {
        // Calculate new zoom level with limits
        const newZoom = Math.max(0.5, Math.min(3.0, zoomLevel + delta));
        
        // If no change (at limit), return
        if (newZoom === zoomLevel) return;
        
        // Calculate zoom center (focus on canvas center)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Adjust offset to maintain center point
        canvasOffsetX = centerX - ((centerX - canvasOffsetX) * newZoom / zoomLevel);
        canvasOffsetY = centerY - ((centerY - canvasOffsetY) * newZoom / zoomLevel);
        
        // Set new zoom level
        zoomLevel = newZoom;
        
        // Redraw canvas
        redrawCanvas();
    }
    
    // Canvas event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // Prevent context menu from appearing on right-click
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Convert screen coordinates to canvas coordinates (accounting for zoom and pan)
    function screenToCanvas(screenX, screenY) {
        const rect = canvas.getBoundingClientRect();
        const x = (screenX - rect.left - canvasOffsetX) / zoomLevel;
        const y = (screenY - rect.top - canvasOffsetY) / zoomLevel;
        return { x, y };
    }
    
    // Convert canvas coordinates to screen coordinates
    function canvasToScreen(canvasX, canvasY) {
        const rect = canvas.getBoundingClientRect();
        const x = canvasX * zoomLevel + canvasOffsetX + rect.left;
        const y = canvasY * zoomLevel + canvasOffsetY + rect.top;
        return { x, y };
    }
    
    function deselectShape() {
        selectedShapeIndex = -1;
        selectedShapes = [];
        redrawCanvas();
    }
    
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Handle right-click for panning
        if (e.button === 2) {
            isPanning = true;
            lastMousePos = { x: mouseX, y: mouseY };
            canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Convert screen coordinates to canvas coordinates
        const canvasCoords = screenToCanvas(e.clientX, e.clientY);
        
        // Check if clicking on an existing shape
        const clickedShapeIndex = findShapeAtPosition(canvasCoords.x, canvasCoords.y);
        
        if (isInSelectMode) {
            if (clickedShapeIndex === -1) {
                // Start a selection box if not clicking on a shape
                isSelecting = true;
                selectionStart = { x: canvasCoords.x, y: canvasCoords.y };
                // Clear selection if not holding Ctrl
                if (!e.ctrlKey) {
                    selectedShapes = [];
                    selectedShapeIndex = -1;
                }
            } else {
                // Toggle selection for the clicked shape
                toggleShapeSelection(clickedShapeIndex, e.ctrlKey);
                
                // Allow dragging the selected shapes
                if (selectedShapes.includes(clickedShapeIndex)) {
                    isDragging = true;
                    // Store the initial canvas coordinates for dragging
                    lastMousePos = canvasCoords;
                }
            }
        } else if (clickedShapeIndex === -1 && selectedShapeType) {
            // Save current state for undo
            saveToUndoStack();
            
            // Place a new shape at grid position
            const gridX = Math.floor(canvasCoords.x / gridSize) * gridSize + gridSize/2;
            const gridY = Math.floor(canvasCoords.y / gridSize) * gridSize + gridSize/2;
            
            placedShapes.push({
                type: selectedShapeType,
                x: gridX,
                y: gridY,
                rotation: 0,
                size: gridSize
            });
            
            // Select the newly placed shape
            selectedShapeIndex = placedShapes.length - 1;
            selectedShapes = [selectedShapeIndex];
        } else if (clickedShapeIndex !== -1) {
            // Select the clicked shape if not already selected
            if (!selectedShapes.includes(clickedShapeIndex) && !e.ctrlKey) {
                selectedShapeIndex = clickedShapeIndex;
                selectedShapes = [clickedShapeIndex];
            }
            
            // Enable dragging
            isDragging = true;
            // Store the initial canvas coordinates for dragging
            lastMousePos = canvasCoords;
        }
        
        redrawCanvas();
    }
    
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert screen coordinates to canvas coordinates
        const canvasCoords = screenToCanvas(e.clientX, e.clientY);
        
        // Handle panning with right-click
        if (isPanning) {
            // Calculate movement delta in screen coordinates
            const dx = mouseX - lastMousePos.x;
            const dy = mouseY - lastMousePos.y;
            
            // Update canvas offset
            canvasOffsetX += dx;
            canvasOffsetY += dy;
            
            // Update last mouse position in screen coordinates
            lastMousePos = { x: mouseX, y: mouseY };
            
            // Redraw canvas
            redrawCanvas();
            return;
        }
        
        // Handle selection box
        if (isSelecting) {
            redrawCanvas();
            
            // Draw selection box
            // Convert canvas coordinates back to screen for drawing
            const startScreen = canvasToScreen(selectionStart.x, selectionStart.y);
            
            // Draw selection rectangle
            ctx.save();
            ctx.fillStyle = selectionBoxColor;
            ctx.strokeStyle = selectionBorderColor;
            ctx.lineWidth = 1;
            
            const x = Math.min(startScreen.x - rect.left, mouseX);
            const y = Math.min(startScreen.y - rect.top, mouseY);
            const width = Math.abs(startScreen.x - rect.left - mouseX);
            const height = Math.abs(startScreen.y - rect.top - mouseY);
            
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
            ctx.restore();
            
            return;
        }
        
        // Handle dragging of shapes
        if (isDragging && selectedShapes.length > 0) {
            // Calculate movement delta in canvas coordinates
            const dx = canvasCoords.x - lastMousePos.x;
            const dy = canvasCoords.y - lastMousePos.y;
            
            if (dx !== 0 || dy !== 0) {
                // If this is the first movement in the drag, save state for undo
                if (!window.dragStarted) {
                    saveToUndoStack();
                    window.dragStarted = true;
                }
                
                // Update position of all selected shapes
                selectedShapes.forEach(index => {
                    placedShapes[index].x += dx;
                    placedShapes[index].y += dy;
                    
                    // Check for snapping only if it's a single shape and ctrl isn't pressed
                    if (selectedShapes.length === 1 && !e.ctrlKey) {
                        checkForSnapping(index);
                    }
                });
                
                // Update last mouse position in canvas coordinates
                lastMousePos = canvasCoords;
                
                redrawCanvas();
            }
        }
    }
    
    function handleMouseUp(e) {
        // Reset cursor and panning state if right-click was used
        if (e.button === 2) {
            isPanning = false;
            canvas.style.cursor = 'default';
        } else {
            // Handle selection box completion
            if (isSelecting) {
                isSelecting = false;
                
                // Convert selection box to canvas coordinates
                const rect = canvas.getBoundingClientRect();
                const currentCoords = screenToCanvas(e.clientX, e.clientY);
                
                // Calculate selection box bounds
                const minX = Math.min(selectionStart.x, currentCoords.x);
                const minY = Math.min(selectionStart.y, currentCoords.y);
                const maxX = Math.max(selectionStart.x, currentCoords.x);
                const maxY = Math.max(selectionStart.y, currentCoords.y);
                
                // Find shapes within the selection box
                placedShapes.forEach((shape, index) => {
                    // Check if shape is in selection box
                    if (shape.x >= minX && shape.x <= maxX && 
                        shape.y >= minY && shape.y <= maxY) {
                        
                        // Only add if not already selected
                        if (!selectedShapes.includes(index)) {
                            selectedShapes.push(index);
                        }
                    }
                });
                
                // Update selectedShapeIndex to first selected shape if any
                if (selectedShapes.length > 0) {
                    selectedShapeIndex = selectedShapes[0];
                }
                
                redrawCanvas();
            }
            
            // Reset dragging state
            isDragging = false;
            window.dragStarted = false;
        }
    }
    
    function handleWheel(e) {
        if (selectedShapes.length === 0) {
            // If no shape is selected, use wheel for zooming
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            zoomCanvas(delta);
            return;
        }
        
        // If shapes are selected, handle rotation
        e.preventDefault();
        
        // Save current state for undo
        saveToUndoStack();
        
        // Rotation step in radians (15 degrees)
        const rotationStep = Math.PI / 12;
        
        if (selectedShapes.length === 1) {
            // Single shape rotation
            const index = selectedShapes[0];
            
            // Rotate based on wheel direction
            if (e.deltaY > 0) {
                placedShapes[index].rotation += rotationStep;
            } else {
                placedShapes[index].rotation -= rotationStep;
            }
            
            // Normalize rotation to 0-2π range
            placedShapes[index].rotation = 
                (placedShapes[index].rotation + 2 * Math.PI) % (2 * Math.PI);
            
            // Check if rotation creates a valid snap
            checkForSnapping(index);
        } else {
            // Calculate center of selection
            let centerX = 0;
            let centerY = 0;
            
            selectedShapes.forEach(index => {
                centerX += placedShapes[index].x;
                centerY += placedShapes[index].y;
            });
            
            centerX /= selectedShapes.length;
            centerY /= selectedShapes.length;
            
            // Determine rotation direction
            const direction = e.deltaY > 0 ? 1 : -1;
            
            // Rotate each shape around the center
            selectedShapes.forEach(index => {
                // Get relative position to center
                const relX = placedShapes[index].x - centerX;
                const relY = placedShapes[index].y - centerY;
                
                // Apply rotation to position
                const cos = Math.cos(direction * rotationStep);
                const sin = Math.sin(direction * rotationStep);
                
                placedShapes[index].x = centerX + (relX * cos - relY * sin);
                placedShapes[index].y = centerY + (relX * sin + relY * cos);
                
                // Rotate the shape itself
                placedShapes[index].rotation += direction * rotationStep;
                placedShapes[index].rotation = 
                    (placedShapes[index].rotation + 2 * Math.PI) % (2 * Math.PI);
            });
        }
        
        redrawCanvas();
    }
    
    // Open settings modal
    function openSettingsModal() {
        // Update toggle UI to match current settings before showing modal
        updateFiefToggleUI();
        settingsModal.classList.remove('hidden');
    }
    
    // Open name prompt modal
    function openNamePromptModal() {
        canvasNameInput.value = '';
        namePromptModal.classList.remove('hidden');
        loadModal.classList.add('hidden');
    }
    
    // Handle new canvas creation
    function handleNewCanvas(e) {
        e.preventDefault();
        
        const name = canvasNameInput.value.trim();
        if (!name) return;
        
        // Create new empty canvas
        placedShapes = [];
        selectedShapeIndex = -1;
        selectedShapes = [];
        groups = [];
        
        // Clear undo/redo stacks
        undoStack = [];
        redoStack = [];
        
        // Set current save name
        currentSaveName = name;
        
        // Hide modal
        namePromptModal.classList.add('hidden');
        
        // Redraw canvas
        redrawCanvas();
    }
    
    // Find which shape is at a given position
    function findShapeAtPosition(x, y) {
        // Check in reverse order (top shapes first)
        for (let i = placedShapes.length - 1; i >= 0; i--) {
            if (isPointInShape(x, y, placedShapes[i])) {
                return i;
            }
        }
        return -1;
    }
    
    function isPointInShape(x, y, shape) {
        // For polygons, use point-in-polygon algorithm
        const vertices = getTransformedVertices(shape);
        return isPointInPolygon(x, y, vertices);
    }
    
    function isPointInPolygon(x, y, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    // Get vertices after applying rotation, scale, and translation
    function getTransformedVertices(shape) {
        const def = shapeDefinitions[shape.type];
        const cos = Math.cos(shape.rotation);
        const sin = Math.sin(shape.rotation);
        
        return def.vertices.map(v => {
            // Scale, rotate, and translate vertex
            const rotatedX = v.x * cos - v.y * sin;
            const rotatedY = v.x * sin + v.y * cos;
            
            return {
                x: shape.x + rotatedX * shape.size,
                y: shape.y + rotatedY * shape.size
            };
        });
    }
    
    // Get shape sides with start/end points and length
    function getSides(shape) {
        const def = shapeDefinitions[shape.type];
        const vertices = getTransformedVertices(shape);
        const sides = [];
        
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            
            // Calculate the side length directly from vertices
            const sideLength = Math.sqrt(
                Math.pow(vertices[j].x - vertices[i].x, 2) + 
                Math.pow(vertices[j].y - vertices[i].y, 2)
            );
            
            // Calculate normalized direction vector for this side
            const dx = (vertices[j].x - vertices[i].x) / sideLength;
            const dy = (vertices[j].y - vertices[i].y) / sideLength;
            
            sides.push({
                start: vertices[i],
                end: vertices[j],
                length: def.sides[i] * shape.size,
                // Calculate the perpendicular direction vector pointing outward from the shape
                normal: {
                    x: dy,
                    y: -dx
                },
                // Store the direction vector as well
                direction: {
                    x: dx,
                    y: dy
                }
            });
        }
        
        return sides;
    }
    
    // Check if shape can snap to any other shape
    function checkForSnapping(shapeIndex) {
        const shape = placedShapes[shapeIndex];
        const shapeSides = getSides(shape);
        const snapThreshold = gridSize * 0.3; // How close sides need to be to snap
        
        // Check against all other shapes
        for (let i = 0; i < placedShapes.length; i++) {
            if (i === shapeIndex) continue;
            
            const otherShape = placedShapes[i];
            const otherSides = getSides(otherShape);
            
            // Check each side against each other side
            for (let s = 0; s < shapeSides.length; s++) {
                for (let o = 0; o < otherSides.length; o++) {
                    const side = shapeSides[s];
                    const otherSide = otherSides[o];
                    
                    // Only consider sides of equal length (or one is root 2)
                    if (Math.abs(side.length - otherSide.length) < 0.1 ||
                        (Math.abs(side.length - Math.sqrt(2) * otherSide.length) < 0.1) ||
                        (Math.abs(otherSide.length - Math.sqrt(2) * side.length) < 0.1)) {
                        
                        // Calculate midpoint and angle of the sides
                        const midX1 = (side.start.x + side.end.x) / 2;
                        const midY1 = (side.start.y + side.end.y) / 2;
                        const angle1 = Math.atan2(side.end.y - side.start.y, side.end.x - side.start.x);
                        
                        const midX2 = (otherSide.start.x + otherSide.end.x) / 2;
                        const midY2 = (otherSide.start.y + otherSide.end.y) / 2;
                        const angle2 = Math.atan2(otherSide.start.y - otherSide.end.y, otherSide.start.x - otherSide.end.x);
                        
                        // Calculate distance between midpoints
                        const distance = Math.sqrt(
                            Math.pow(midX1 - midX2, 2) + 
                            Math.pow(midY1 - midY2, 2)
                        );
                        
                        // If sides are close enough to snap
                        if (distance < snapThreshold) {
                            // For triangles forming a hexagon, we need special handling
                            const isTriangleHexagonCase = 
                                (shape.type === 'triangle' && otherShape.type === 'triangle') && 
                                (Math.abs(angle1 - angle2) > Math.PI * 0.8 && Math.abs(angle1 - angle2) < Math.PI * 1.2);
                            
                            // Determine if sides should be perpendicular or parallel
                            let shouldBePerp = shouldBePerpendicular(shape.type, s, otherShape.type, o);
                            
                            // Override for triangle-to-triangle hexagon formation
                            if (isTriangleHexagonCase) {
                                shouldBePerp = false; // Force parallel for triangle hexagon
                            }
                            
                            // Current angle between the sides (0 means parallel, PI/2 means perpendicular)
                            let currentAngleDiff = Math.abs(angle1 - angle2) % Math.PI;
                            if (currentAngleDiff > Math.PI/2) {
                                currentAngleDiff = Math.PI - currentAngleDiff;
                            }
                            
                            // Calculate target angle difference (0 for parallel, PI/2 for perpendicular)
                            const targetAngleDiff = shouldBePerp ? Math.PI/2 : 0;
                            
                            // How close the angles are to the desired alignment
                            const angleAlignmentError = Math.abs(currentAngleDiff - targetAngleDiff);
                            
                            // If angles are approximately aligned as they should be
                            if (angleAlignmentError < 0.3) {
                                // Calculate rotation adjustment needed
                                let rotationAdjustment = 0;
                                
                                if (shouldBePerp) {
                                    // For perpendicular alignment, we want angle1 - angle2 = ±PI/2
                                    const currentDiff = (angle1 - angle2 + 2*Math.PI) % Math.PI;
                                    if (Math.abs(currentDiff - Math.PI/2) < 0.3) {
                                        // Close to PI/2, minor adjustment
                                        rotationAdjustment = Math.PI/2 - currentDiff;
                                    } else if (Math.abs(currentDiff - Math.PI*3/2) < 0.3 || Math.abs(currentDiff + Math.PI/2) < 0.3) {
                                        // Close to -PI/2 (or 3PI/2), minor adjustment
                                        rotationAdjustment = -Math.PI/2 - currentDiff;
                                    } else {
                                        // Need major adjustment, determine direction
                                        rotationAdjustment = Math.abs(angle1 - (angle2 + Math.PI/2)) < 
                                                            Math.abs(angle1 - (angle2 - Math.PI/2)) ? 
                                                            (angle2 + Math.PI/2) - angle1 : 
                                                            (angle2 - Math.PI/2) - angle1;
                                    }
                                } else {
                                    // For parallel alignment, we want angle1 - angle2 = 0 or PI
                                    const diff = Math.abs(angle1 - angle2) % Math.PI;
                                    
                                    if (isTriangleHexagonCase) {
                                        // For hexagon formation, we want exact 180 degree alignment
                                        rotationAdjustment = angle2 + Math.PI - angle1;
                                    } else if (diff < 0.3) {
                                        // Close to 0, minor adjustment
                                        rotationAdjustment = angle2 - angle1;
                                    } else if (Math.abs(diff - Math.PI) < 0.3) {
                                        // Close to PI, minor adjustment
                                        rotationAdjustment = angle2 + Math.PI - angle1;
                                    } else {
                                        // Need major adjustment, determine closest direction
                                        rotationAdjustment = Math.abs(angle1 - angle2) < 
                                                            Math.abs(angle1 - (angle2 + Math.PI)) ? 
                                                            angle2 - angle1 : 
                                                            angle2 + Math.PI - angle1;
                                    }
                                }
                                
                                // Apply rotation adjustment
                                shape.rotation = (shape.rotation + rotationAdjustment + 2 * Math.PI) % (2 * Math.PI);
                                
                                // Recalculate sides after rotation adjustment
                                const updatedShapeSides = getSides(shape);
                                const updatedSide = updatedShapeSides[s];
                                
                                // Adjust offset for triangle hexagon formation
                                let outwardOffset = 0.05; // Default small offset
                                
                                if (isTriangleHexagonCase) {
                                    // For hexagon, ensure perfect alignment with no gap
                                    outwardOffset = 0; // No offset for perfect alignment
                                    
                                    // Calculate exact alignment position
                                    const alignX = midX2 - (updatedSide.start.x + updatedSide.end.x) / 2;
                                    const alignY = midY2 - (updatedSide.start.y + updatedSide.end.y) / 2;
                                    
                                    // Apply exact alignment
                                    shape.x += alignX;
                                    shape.y += alignY;
                                } else {
                                    // Normal case - use anti-overlap logic
                                    const updatedMidX1 = (updatedSide.start.x + updatedSide.end.x) / 2;
                                    const updatedMidY1 = (updatedSide.start.y + updatedSide.end.y) / 2;
                                    
                                    // Use the normal vectors to ensure shapes are properly aligned
                                    // This pushes the shape slightly away from the other shape to prevent overlap
                                    const alignX = midX2 - updatedMidX1 + (updatedSide.normal.x + otherSide.normal.x) * outwardOffset * gridSize;
                                    const alignY = midY2 - updatedMidY1 + (updatedSide.normal.y + otherSide.normal.y) * outwardOffset * gridSize;
                                    
                                    // Adjust position to snap sides together
                                    shape.x += alignX;
                                    shape.y += alignY;
                                }
                                
                                return; // Once snapped, we're done
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Function to determine if sides should be perpendicular based on shape types and side indices
    function shouldBePerpendicular(shapeType1, sideIndex1, shapeType2, sideIndex2) {
        // Special case for right triangle hypotenuse
        if (shapeType1 === 'rightTriangle' && sideIndex1 === 1) {
            // Hypotenuse should connect perpendicular to other shapes
            return true;
        }
        if (shapeType2 === 'rightTriangle' && sideIndex2 === 1) {
            // Hypotenuse should connect perpendicular to other shapes
            return true;
        }
        
        // For a square connecting to a right triangle's right angle
        if ((shapeType1 === 'square' && shapeType2 === 'rightTriangle' && 
             (sideIndex2 === 0 || sideIndex2 === 2)) ||
            (shapeType2 === 'square' && shapeType1 === 'rightTriangle' && 
             (sideIndex1 === 0 || sideIndex1 === 2))) {
            // These sides should be perpendicular
            return true;
        }
        
        // Default to parallel alignment for other cases
        return false;
    }
    
    function redrawCanvas() {
        // Clear canvas
        ctx.fillStyle = creamColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Save the context state
        ctx.save();
        
        // Apply zoom and pan transforms
        ctx.translate(canvasOffsetX, canvasOffsetY);
        ctx.scale(zoomLevel, zoomLevel);
        
        // Draw grid
        drawGrid();
        
        // Draw all shapes
        placedShapes.forEach((shape, index) => {
            drawShape(shape, selectedShapes.includes(index));
        });
        
        // Restore the context state
        ctx.restore();
    }
    
    function drawGrid() {
        // Default grid
        ctx.strokeStyle = 'rgba(126, 34, 206, 0.1)';
        ctx.lineWidth = 0.5;
        
        // Calculate grid boundaries based on zoom and pan
        const startX = -canvasOffsetX / zoomLevel;
        const startY = -canvasOffsetY / zoomLevel;
        const endX = (canvas.width - canvasOffsetX) / zoomLevel;
        const endY = (canvas.height - canvasOffsetY) / zoomLevel;
        
        // Round to nearest grid line
        const gridStartX = Math.floor(startX / gridSize) * gridSize;
        const gridStartY = Math.floor(startY / gridSize) * gridSize;
        
        // Vertical lines
        for (let x = gridStartX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = gridStartY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
        
        // Draw fief outline or advanced fief grid if enabled
        if (fiefOutlineEnabled) {
            drawFiefOutline();
        } else if (advancedFiefGridEnabled) {
            drawAdvancedFiefGrid();
        }
    }
    
    // Draw 5x5 fief outline
    function drawFiefOutline() {
        const fiefSize = 5 * gridSize;
        
        // Calculate center of the canvas
        const canvasCenterX = canvas.width / (2 * zoomLevel) - canvasOffsetX / zoomLevel;
        const canvasCenterY = canvas.height / (2 * zoomLevel) - canvasOffsetY / zoomLevel;
        
        // Calculate top-left corner of the fief
        const fiefStartX = Math.round(canvasCenterX / gridSize) * gridSize - fiefSize / 2;
        const fiefStartY = Math.round(canvasCenterY / gridSize) * gridSize - fiefSize / 2;
        
        // Draw the outline
        ctx.strokeStyle = 'rgba(126, 34, 206, 0.5)';  // Darker purple
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(fiefStartX, fiefStartY, fiefSize, fiefSize);
        ctx.stroke();
    }
    
    // Draw 10x10 advanced fief grid
    function drawAdvancedFiefGrid() {
        const fiefSize = 10 * gridSize;
        
        // Calculate center of the canvas
        const canvasCenterX = canvas.width / (2 * zoomLevel) - canvasOffsetX / zoomLevel;
        const canvasCenterY = canvas.height / (2 * zoomLevel) - canvasOffsetY / zoomLevel;
        
        // Calculate grid offset to get repeating cells
        const offsetX = Math.floor(canvasCenterX / fiefSize) * fiefSize;
        const offsetY = Math.floor(canvasCenterY / fiefSize) * fiefSize;
        
        // Draw the grid lines (repeating)
        ctx.strokeStyle = 'rgba(126, 34, 206, 0.5)';  // Darker purple
        ctx.lineWidth = 2;
        
        // Calculate grid boundaries
        const startX = -canvasOffsetX / zoomLevel;
        const startY = -canvasOffsetY / zoomLevel;
        const endX = (canvas.width - canvasOffsetX) / zoomLevel;
        const endY = (canvas.height - canvasOffsetY) / zoomLevel;
        
        // Find starting points for the grid lines
        const gridStartX = Math.floor((startX - offsetX) / fiefSize) * fiefSize + offsetX;
        const gridStartY = Math.floor((startY - offsetY) / fiefSize) * fiefSize + offsetY;
        
        // Draw vertical lines
        for (let x = gridStartX; x <= endX; x += fiefSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = gridStartY; y <= endY; y += fiefSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }
    
    function drawShape(shape, isSelected) {
        // Set styles based on selection state
        ctx.strokeStyle = isSelected ? selectedColor : purpleColor;
        ctx.fillStyle = purpleFillColor;
        ctx.lineWidth = 2;
        
        // Draw polygon
        const vertices = getTransformedVertices(shape);
        
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw center point if selected
        if (isSelected) {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = selectedColor;
            ctx.fill();
        }
    }
    
    // Save/Load functionality
    function openSaveModal() {
        // If we're editing an existing save, pre-fill the name
        if (currentSaveName) {
            saveNameInput.value = currentSaveName;
        } else {
            saveNameInput.value = '';
        }
        
        saveModal.classList.remove('hidden');
        saveNameInput.focus();
    }
    
    function openLoadModal() {
        // Update the list of saved canvases
        updateSavedList();
        
        loadModal.classList.remove('hidden');
    }
    
    function handleSave(e) {
        e.preventDefault();
        
        const name = saveNameInput.value.trim();
        if (!name) return;
        
        // Create save object
        const saveData = {
            name: name,
            shapes: placedShapes,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        saveToLocalStorage(name, saveData);
        
        // Update current save name
        currentSaveName = name;
        
        // Hide the modal
        saveModal.classList.add('hidden');
    }
    
    function updateSavedList() {
        // Clear current list
        savedList.innerHTML = '';
        
        // Get all saves from localStorage
        const saves = getAllSaves();
        
        if (saves.length === 0) {
            savedList.innerHTML = '<p class="text-gray-500 text-center py-4">No saved canvases found</p>';
            return;
        }
        
        // Create and append save items
        saves.forEach(save => {
            const saveItem = document.createElement('div');
            saveItem.className = 'bg-white bg-opacity-60 p-3 rounded-md hover:bg-opacity-80 cursor-pointer transition-colors flex justify-between items-center';
            
            const saveInfo = document.createElement('div');
            
            const saveName = document.createElement('h4');
            saveName.className = 'font-medium text-purple-900';
            saveName.textContent = save.name;
            
            const saveDate = document.createElement('p');
            saveDate.className = 'text-xs text-gray-600';
            saveDate.textContent = new Date(save.timestamp).toLocaleString();
            
            saveInfo.appendChild(saveName);
            saveInfo.appendChild(saveDate);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-red-500 hover:text-red-700 p-1';
            deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            
            // Stop event propagation to prevent immediate loading when clicking delete
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSave(save.name);
                updateSavedList();
            });
            
            saveItem.appendChild(saveInfo);
            saveItem.appendChild(deleteBtn);
            
            // Load this save when clicked
            saveItem.addEventListener('click', () => {
                loadSave(save.name);
                loadModal.classList.add('hidden');
            });
            
            savedList.appendChild(saveItem);
        });
    }
    
    // LocalStorage operations
    function saveToLocalStorage(name, data) {
        try {
            // Get existing saves
            let savedCanvases = JSON.parse(localStorage.getItem('muadibCanvases')) || {};
            
            // Add or update this save
            savedCanvases[name] = data;
            
            // Save back to localStorage
            localStorage.setItem('muadibCanvases', JSON.stringify(savedCanvases));
            
            return true;
        } catch (err) {
            console.error('Error saving to localStorage:', err);
            return false;
        }
    }
    
    function loadFromLocalStorage(name) {
        try {
            // Get saves from localStorage
            const savedCanvases = JSON.parse(localStorage.getItem('muadibCanvases')) || {};
            
            // Return the requested save
            return savedCanvases[name] || null;
        } catch (err) {
            console.error('Error loading from localStorage:', err);
            return null;
        }
    }
    
    function deleteSave(name) {
        try {
            // Get existing saves
            let savedCanvases = JSON.parse(localStorage.getItem('muadibCanvases')) || {};
            
            // Delete this save
            if (savedCanvases[name]) {
                delete savedCanvases[name];
                
                // Save back to localStorage
                localStorage.setItem('muadibCanvases', JSON.stringify(savedCanvases));
                
                // Reset current save name if we're deleting the loaded save
                if (currentSaveName === name) {
                    currentSaveName = null;
                }
            }
            
            return true;
        } catch (err) {
            console.error('Error deleting save:', err);
            return false;
        }
    }
    
    function getAllSaves() {
        try {
            // Get saves from localStorage
            const savedCanvases = JSON.parse(localStorage.getItem('muadibCanvases')) || {};
            
            // Convert to array and sort by timestamp (newest first)
            return Object.values(savedCanvases).sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        } catch (err) {
            console.error('Error getting all saves:', err);
            return [];
        }
    }
    
    function loadSave(name) {
        const saveData = loadFromLocalStorage(name);
        
        if (saveData && saveData.shapes) {
            // Update current save name
            currentSaveName = name;
            
            // Load shapes
            placedShapes = JSON.parse(JSON.stringify(saveData.shapes)); // Deep clone
            
            // Deselect any shape
            selectedShapeIndex = -1;
            selectedShapes = [];
            
            // Redraw canvas
            redrawCanvas();
        }
    }
});
