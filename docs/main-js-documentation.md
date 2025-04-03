# Main.js Documentation

This document explains how the main JavaScript file (`main.js`) for the Muadib application works. For information on JSON data formats, please refer to the JSON Structure Guide.

## Overview

`main.js` controls the main interface of the Muadib application, implementing a command-line style interface that displays information in modal dialogs. The system loads data from JSON files, processes user commands, and renders formatted content.

## Command System

The application implements a slash command system (similar to Discord) where users can type commands prefixed with a slash (`/`) to trigger various actions.

### Core Components

1. **Command Input**: Text area where users type commands
2. **Suggestion Box**: Displays available commands as the user types
3. **Modal System**: Displays content in response to valid commands

## Data Files

The application relies on two primary JSON files:

### 1. info.json

Contains command definitions and the content to display for each command. For detailed structure information, see the JSON Structure Guide.

### 2. quotes.json

Contains quotations that can be displayed randomly with the `/quote` command. For detailed structure information, see the JSON Structure Guide.

## Special Commands

The application has two special commands that don't follow the standard format:

1. `/quote`: Displays a random quote from quotes.json
2. `/builder`: Redirects to the builder.html page

## Application Initialization

The application follows this initialization process:

1. Load JSON data from both data files
2. Process command data into a usable format
3. Set up event listeners for user interaction
4. Initialize the command input with available suggestions

## Content Rendering

When a command is executed, the content is rendered in the modal with specialized formatting based on the content type. The rendering system supports:

- Regular paragraphs with optional headers
- Bulleted lists
- Special infoboxes with background styling
- Blockquotes with border styling

## Error Handling

The application includes error handling for:
- Failed data loading
- Invalid commands
- Missing content

When a user enters an invalid command, the input field will briefly highlight with a purple outline to indicate the error.

## Performance Considerations

- JSON data is loaded once at initialization
- DOM manipulation is minimized by reusing modal elements
- Animation is handled through CSS transitions for better performance

## Related Documentation

For details on JSON data structure and formatting requirements, please refer to the JSON Structure Guide.
