# Command Manager Reference

The `CommandManager` class is the central component of the command system. It handles loading command definitions, initializing command objects, and executing commands.

## Class Overview

```javascript
class CommandManager {
  constructor() {
    this.commands = [];
    this.commandMap = {};
  }
  
  async loadCommands(url) { /* ... */ }
  async initializeCommands(commandsData) { /* ... */ }
  async importCommandClass(className) { /* ... */ }
  getAllCommands() { /* ... */ }
  async executeCommand(commandName) { /* ... */ }
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `commands` | Array | List of command objects with name and description for UI display |
| `commandMap` | Object | Map of command names to command instances for execution |

## Methods

### `loadCommands(url)`

Loads command definitions from a JSON file.

**Parameters:**
- `url` (string): Path to the JSON file containing command definitions

**Returns:**
- Promise<Array>: The loaded commands array

**Example:**
```javascript
const commands = await commandManager.loadCommands('data/commands.json');
```

### `initializeCommands(commandsData)`

Initializes command objects from loaded data.

**Parameters:**
- `commandsData` (Array): Array of command data objects from JSON

**Returns:**
- Promise<void>

**Example:**
```javascript
await commandManager.initializeCommands(jsonData.commands);
```

### `importCommandClass(className)`

Dynamically imports a command class.

**Parameters:**
- `className` (string): Name of the command class to import

**Returns:**
- Promise<Class>: The imported command class

**Example:**
```javascript
const CommandClass = await commandManager.importCommandClass('HelpCommand');
```

### `getAllCommands()`

Gets all available commands for UI display.

**Returns:**
- Array: Commands with name and description

**Example:**
```javascript
const commands = commandManager.getAllCommands();
commands.forEach(cmd => {
  console.log(`${cmd.name} - ${cmd.description}`);
});
```

### `executeCommand(commandName)`

Executes a command by name.

**Parameters:**
- `commandName` (string): Name of the command to execute (including the slash)

**Returns:**
- Promise<boolean>: True if command was executed, false if not found

**Example:**
```javascript
const success = await commandManager.executeCommand('/help');
if (!success) {
  console.error('Command not found');
}
```

## Extension Points

The CommandManager is designed to be extensible. Here are some ways you might extend it:

### Adding Command Context

To provide commands with access to application state or services:

```javascript
async initializeCommands(commandsData, appContext) {
  // ...existing code...
  
  const command = new CommandClass(cmdData, appContext);
  
  // ...existing code...
}
```

### Command History

To keep track of executed commands:

```javascript
async executeCommand(commandName) {
  const command = this.commandMap[commandName];
  if (command) {
    // Record in history before execution
    this.commandHistory.push({
      command: commandName,
      timestamp: new Date()
    });
    
    await command.execute();
    return true;
  }
  return false;
}

getCommandHistory() {
  return this.commandHistory;
}
```

### Command Permissions

To add permission checks:

```javascript
async executeCommand(commandName, user) {
  const command = this.commandMap[commandName];
  if (command) {
    // Check if user has permission to execute this command
    if (this.hasPermission(user, command)) {
      await command.execute();
      return true;
    } else {
      throw new Error('Permission denied');
    }
  }
  return false;
}

hasPermission(user, command) {
  // Permission checking logic
  return true;
}
```

## Error Handling

The CommandManager includes error handling throughout:

1. If JSON loading fails, errors are logged and an empty array is returned
2. If a command class fails to initialize, the error is logged and the command is skipped
3. If a command is not found during execution, false is returned

You can extend this error handling to meet your specific requirements.