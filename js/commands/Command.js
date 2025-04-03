/**
 * Base Command class that defines the interface for all commands
 */
class Command {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
  }
  
  /**
   * Execute the command
   * @returns {Promise<void>}
   */
  async execute() {
    throw new Error('Command.execute() must be implemented by subclasses');
  }
}

export default Command;
