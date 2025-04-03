/**
 * Manages all available commands and handles their execution
 */
class CommandManager {
  constructor() {
    this.commands = [];
    this.commandMap = {};
  }
  
  /**
   * Load commands from a JSON file
   * @param {string} url - URL to the commands JSON file
   * @returns {Promise<Array>} - The loaded commands
   */
  async loadCommands(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch commands: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      await this.initializeCommands(data.commands);
      return this.commands;
    } catch (error) {
      console.error('Error loading commands:', error);
      return [];
    }
  }
  
  /**
   * Initialize command objects from the loaded data
   * @param {Array} commandsData - Array of command data objects
   */
  async initializeCommands(commandsData) {
    this.commands = [];
    this.commandMap = {};
    
    for (const cmdData of commandsData) {
      try {
        // Dynamically import the command class
        const CommandClass = await this.importCommandClass(cmdData.handlerClass);
        const command = new CommandClass(cmdData);
        
        this.commands.push({
          name: command.name,
          description: command.description
        });
        
        this.commandMap[command.name] = command;
      } catch (error) {
        console.error(`Failed to initialize command ${cmdData.name}:`, error);
      }
    }
    
    // Sort commands alphabetically by name
    this.commands.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Dynamically import a command class
   * @param {string} className - Name of the command class to import
   * @returns {Promise<Class>} - The imported command class
   */
  async importCommandClass(className) {
    const module = await import(`./commands/${className}.js`);
    return module.default;
  }
  
  /**
   * Get all available commands
   * @returns {Array} - Array of command objects with name and description
   */
  getAllCommands() {
    return this.commands;
  }
  
  /**
   * Execute a command by name
   * @param {string} commandName - Name of the command to execute
   * @returns {Promise<boolean>} - True if command was executed, false if not found
   */
  async executeCommand(commandName) {
    const command = this.commandMap[commandName];
    if (command) {
      await command.execute();
      return true;
    }
    return false;
  }
}

export default CommandManager;
