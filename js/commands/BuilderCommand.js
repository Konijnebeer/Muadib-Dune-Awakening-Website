import Command from './Command.js';

/**
 * Command that handles the builder functionality
 */
class BuilderCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  /**
   * Redirects the user to the builder page
   */
  async execute() {
    window.location.href = "builder.html";
  }
}

export default BuilderCommand;
