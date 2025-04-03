# ContentBuilder System

The ContentBuilder system is a utility for dynamically creating formatted DOM elements from structured data. It's designed to be extensible, allowing developers to add new content types as needed.

## Overview

The `ContentBuilder` class converts structured JSON data into DOM elements, providing a standardized way to render various content types. This is particularly useful for:

- Displaying formatted content from external data sources
- Creating consistent UI elements across the application
- Adding new content types without modifying existing code

## Supported Content Types

The system currently supports the following content types:

### 1. Text
Simple text content with optional header.

**JSON Structure:**
```json
{
  "type": "text",
  "header": "Optional Title",
  "text": "Text content with /n new line support"
}
```

**Output:**
- Renders as paragraphs with optional header
- Supports new lines with `/n` delimiter

### 2. List
Ordered or unordered lists with optional header.

**JSON Structure:**
```json
{
  "type": "list",
  "header": "Optional List Title",
  "items": [
    "First item",
    "Second item",
    "Third item"
  ]
}
```

**Output:**
- Renders as a bulleted list
- Each item in the `items` array becomes a list item
- Optional header displayed above the list

### 3. Infobox
Highlighted content box with optional header.

**JSON Structure:**
```json
{
  "type": "infobox",
  "header": "Optional Info Title",
  "text": "Important information in a highlighted box /n with new line support"
}
```

**Output:**
- Renders as a visually distinct box with semi-transparent background
- Supports an optional header
- Supports new lines with `/n` delimiter

## Using the ContentBuilder

To use the ContentBuilder in your code:

```javascript
import ContentBuilder from '../utils/ContentBuilder.js';

// Create a new instance
const builder = new ContentBuilder();

// Example content array
const contentItems = [
  {
    "type": "text",
    "header": "Introduction",
    "text": "This is an introduction to our topic."
  },
  {
    "type": "list",
    "header": "Key Points",
    "items": ["Point 1", "Point 2", "Point 3"]
  }
];

// Build all content items
const fragment = builder.buildContent(contentItems);

// Add to DOM
document.getElementById('content-container').appendChild(fragment);

// Or build a single item
const singleItem = {
  "type": "infobox",
  "header": "Note",
  "text": "Important information here."
};
const infoElement = builder.buildContentItem(singleItem);
document.getElementById('note-container').appendChild(infoElement);
```

## Extending with New Content Types

To add a new content type:

1. Extend the `ContentBuilder` class or modify the existing one
2. Add a new case to the `buildContentItem` method's switch statement
3. Create a new builder method for your content type

Example of adding an "image" content type:

```javascript
// Add to ContentBuilder class
buildContentItem(item) {
  switch(item.type) {
    case 'text':
      return this.buildTextItem(item);
    case 'list':
      return this.buildListItem(item);
    case 'infobox':
      return this.buildInfoboxItem(item);
    case 'image':
      return this.buildImageItem(item); // New type
    default:
      console.warn(`Unsupported content type: ${item.type}`);
      return null;
  }
}

/**
 * Build an image content item
 * @param {Object} item - Image content item data
 * @returns {HTMLElement} - Built image element
 */
buildImageItem(item) {
  const container = document.createElement('div');
  container.className = 'mb-4 text-center';
  
  // Add header if present
  if (item.header) {
    const header = document.createElement('h3');
    header.className = 'text-xl font-bold mb-2';
    header.textContent = item.header;
    container.appendChild(header);
  }
  
  // Create image element
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.alt || '';
  img.className = 'mx-auto max-w-full rounded-lg';
  
  if (item.maxWidth) {
    img.style.maxWidth = item.maxWidth;
  }
  
  container.appendChild(img);
  
  // Add caption if present
  if (item.caption) {
    const caption = document.createElement('p');
    caption.className = 'mt-2 text-sm text-gray-600';
    caption.textContent = item.caption;
    container.appendChild(caption);
  }
  
  return container;
}
```

Usage of the new image type in your content data:

```json
{
  "type": "image",
  "header": "Arrakis Landscape",
  "src": "/images/dune-landscape.jpg",
  "alt": "Desert landscape of Arrakis",
  "caption": "The harsh desert environment of Arrakis",
  "maxWidth": "500px"
}
```

## Best Practices

1. **Consistent Styling**: Maintain consistent class naming and styling across content types
2. **Error Handling**: Always include validation for required properties in each builder method
3. **Flexibility**: Design content types to be flexible with optional properties
4. **Documentation**: Document the expected properties for each content type
5. **Extensibility**: Consider future needs when designing new content types

## Integration with Commands

The ContentBuilder is particularly useful in commands that display complex information, such as the `AboutCommand`:

```javascript
// In a command class
import ContentBuilder from '../utils/ContentBuilder.js';

class InformationCommand extends Command {
  constructor(data) {
    super(data);
    this.contentBuilder = new ContentBuilder();
  }
  
  async execute() {
    // Fetch data
    const response = await fetch('data/information.json');
    const data = await response.json();
    
    // Build content
    const fragment = this.contentBuilder.buildContent(data.content);
    
    // Display in modal
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '';
    modalContent.appendChild(fragment);
    
    // Show modal
    document.getElementById('modal-container').classList.remove('hidden');
  }
}
```

By following these guidelines, you can easily extend and utilize the ContentBuilder system to create rich, dynamic content displays throughout your application.
