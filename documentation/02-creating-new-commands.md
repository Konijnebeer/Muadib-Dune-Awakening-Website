# Creating New Commands

This guide walks you through the process of adding a new command to the Muadib system.

## Step 1: Create a Command Class

First, create a new JavaScript file in the `js/commands/` directory. Name the file after your command, following the pattern `YourCommandName.js`.

For example, to create a "help" command:

```javascript
// js/commands/HelpCommand.js
import Command from './Command.js';

/**
 * Command that displays help information
 */
class HelpCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  /**
   * Displays help information
   */
  async execute() {
    // Implementation goes here
    // For example, displaying help content in a modal:
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Help";
    modalContent.innerHTML = `
      <div class="space-y-4">
        <p>Type a command to begin. Available commands:</p>
        <ul class="list-disc pl-5">
          <li><strong>/builder</strong> - Open the Dune Awakening base builder</li>
          <li><strong>/help</strong> - Display this help information</li>
        </ul>
      </div>
    `;
    
    modalContainer.classList.remove('hidden');
  }
}

export default HelpCommand;
```

Important requirements:
- Your class must extend the base `Command` class
- You must implement the `execute()` method
- Your class must be the default export

## Step 2: Add Command to JSON Configuration

Next, add your command to the `data/commands.json` file:

```json
{
  "commands": [
    {
      "name": "/builder",
      "description": "Dune Awakening base builder",
      "handlerClass": "BuilderCommand"
    },
    {
      "name": "/help",
      "description": "Display help information",
      "handlerClass": "HelpCommand"
    }
  ]
}
```

Note:
- `name` should include the leading slash (/)
- `description` should be concise but descriptive
- `handlerClass` must match your command class name exactly

## Step 3: Test Your Command

Refresh the application and test your command:
1. Your command should appear in the suggestions list
2. Typing its name should filter the suggestions
3. Pressing Enter or clicking the command should execute it

## Advanced Command Features

### Command with Parameters

If your command needs parameters, you can add parsing logic in the execute method:

```javascript
async execute(fullCommand) {
  // Extract parameters from the full command string
  const params = fullCommand.split(' ').slice(1);
  
  // Use parameters in your command logic
  if (params.length > 0) {
    // Handle params
  } else {
    // Default behavior
  }
}
```

### Accessing Application State

If your command needs access to application state, you can use the constructor to store references:

```javascript
constructor(data, appContext) {
  super(data);
  this.appContext = appContext;
}

async execute() {
  // Access app context
  const { state, services } = this.appContext;
  // Use context in command implementation
}
```

Note: This would require updating the CommandManager to pass context to commands when initializing them.

### Command with Custom UI

If your command needs custom UI beyond the modal system, you can implement DOM manipulation in your execute method:

```javascript
async execute() {
  // Create custom UI elements
  const container = document.createElement('div');
  // ...setup UI...
  
  // Add to document
  document.body.appendChild(container);
  
  // Optionally return a cleanup function
  return () => {
    document.body.removeChild(container);
  };
}
```

## Best Practices

1. **Keep commands focused**: Each command should do one thing well
2. **Handle errors gracefully**: Use try/catch and provide feedback when things go wrong
3. **Provide clear feedback**: Let users know when a command has executed successfully
4. **Document your command**: Include JSDoc comments explaining what your command does
5. **Follow naming conventions**: Use descriptive names for your command and handler class
