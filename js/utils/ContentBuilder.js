/**
 * Utility class to build formatted DOM elements from various content types
 */
class ContentBuilder {
  /**
   * Build DOM elements from an array of content items
   * @param {Array} contentItems - Array of content data objects
   * @returns {DocumentFragment} - Document fragment containing all built elements
   */
  buildContent(contentItems) {
    const fragment = document.createDocumentFragment();
    
    for (const item of contentItems) {
      const element = this.buildContentItem(item);
      if (element) {
        fragment.appendChild(element);
      }
    }
    
    return fragment;
  }
  
  /**
   * Build a single DOM element from a content item
   * @param {Object} item - Content item data
   * @returns {HTMLElement|null} - Built DOM element or null if type is unsupported
   */
  buildContentItem(item) {
    switch(item.type) {
      case 'text':
        return this.buildTextItem(item);
      case 'list':
        return this.buildListItem(item);
      case 'infobox':
        return this.buildInfoboxItem(item);
      default:
        console.warn(`Unsupported content type: ${item.type}`);
        return null;
    }
  }
  
  /**
   * Build a text content item
   * @param {Object} item - Text content item data
   * @returns {HTMLElement} - Built text element
   */
  buildTextItem(item) {
    const container = document.createElement('div');
    container.className = 'mb-4';
    
    // Add header if present
    if (item.header) {
      const header = document.createElement('h3');
      header.className = 'text-xl font-bold mb-2';
      header.textContent = item.header;
      container.appendChild(header);
    }
    
    // Add text content with new line support
    const textLines = item.text.split('/n');
    textLines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'mb-2';
      p.textContent = line.trim();
      container.appendChild(p);
    });
    
    return container;
  }
  
  /**
   * Build a list content item
   * @param {Object} item - List content item data
   * @returns {HTMLElement} - Built list element
   */
  buildListItem(item) {
    const container = document.createElement('div');
    container.className = 'mb-4';
    
    // Add header if present
    if (item.header) {
      const header = document.createElement('h3');
      header.className = 'text-xl font-bold mb-2';
      header.textContent = item.header;
      container.appendChild(header);
    }
    
    // Create list
    const list = document.createElement('ul');
    list.className = 'list-disc pl-5 space-y-1';
    
    // Add list items
    for (const listItem of item.items) {
      const li = document.createElement('li');
      li.textContent = listItem;
      list.appendChild(li);
    }
    
    container.appendChild(list);
    
    return container;
  }
  
  /**
   * Build an infobox content item
   * @param {Object} item - Infobox content item data
   * @returns {HTMLElement} - Built infobox element
   */
  buildInfoboxItem(item) {
    const container = document.createElement('div');
    container.className = 'mb-4 p-4 bg-purple-100/30 backdrop-blur-sm rounded-lg';
    
    // Add header if present
    if (item.header) {
      const header = document.createElement('h3');
      header.className = 'text-lg font-bold mb-2';
      header.textContent = item.header;
      container.appendChild(header);
    }
    
    // Add text content with new line support
    const textLines = item.text.split('/n');
    textLines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'mb-2';
      p.textContent = line.trim();
      container.appendChild(p);
    });
    
    return container;
  }
}

export default ContentBuilder;
