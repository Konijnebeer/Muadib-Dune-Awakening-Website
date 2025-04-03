import Command from './Command.js';
import ContentBuilder from '../utils/ContentBuilder.js';

/**
 * Command that displays information and credits from about.json
 */
class AboutCommand extends Command {
  constructor(data) {
    super(data);
    this.contentBuilder = new ContentBuilder();
  }
  
  /**
   * Load and display about information in the modal
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      // Get modal elements
      const modalTitle = document.getElementById('modal-title');
      const modalContent = document.getElementById('modal-content');
      const modalContainer = document.getElementById('modal-container');
      
      // Show loading state
      modalTitle.textContent = "Loading...";
      modalContent.innerHTML = '<p>Loading about information...</p>';
      modalContainer.classList.remove('hidden');
      
      // Fetch the about.json file
      const response = await fetch('data/about.json');
      if (!response.ok) {
        throw new Error(`Failed to load about data: ${response.status} ${response.statusText}`);
      }
      
      const aboutData = await response.json();
      
      // Set the modal title
      modalTitle.textContent = aboutData.title || "About";
      
      // Clear previous content
      modalContent.innerHTML = '';
      
      // Build and add content elements
      if (aboutData.content && Array.isArray(aboutData.content)) {
        const contentElements = this.contentBuilder.buildContent(aboutData.content);
        modalContent.appendChild(contentElements);
      } else {
        modalContent.innerHTML = '<p>No about information available.</p>';
      }
      
    } catch (error) {
      console.error('Error in AboutCommand:', error);
      
      // Show error in modal
      const modalTitle = document.getElementById('modal-title');
      const modalContent = document.getElementById('modal-content');
      
      modalTitle.textContent = "Error";
      modalContent.innerHTML = `<p class="text-red-500">Failed to load about information: ${error.message}</p>`;
    }
  }
}

export default AboutCommand;
