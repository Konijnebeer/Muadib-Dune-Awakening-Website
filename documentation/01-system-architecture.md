# System Architecture

## Overview

The Muadib command system is built with a modular architecture that separates command configuration from implementation, making it easy to add, modify, or remove commands without changing the core application logic.

## Key Components

### 1. Command Configuration (JSON)

Commands are configured in `data/commands.json`. This file contains metadata for each command, including:
- Name: The command identifier (e.g., "/builder")
- Description: Short description shown in the suggestions list
- HandlerClass: The name of the JavaScript class that implements the command

### 2. Command Base Class

The `Command` class (`js/commands/Command.js`) serves as the base class for all commands. It defines:
- Constructor for initializing command properties
- An abstract `execute()` method that command implementations must override

### 3. Command Implementations

Individual command classes in the `js/commands/` directory implement specific command functionality:
- Each command extends the base `Command` class
- Each command must implement the `execute()` method
- Commands can implement additional methods as needed

### 4. Command Manager

The `CommandManager` class (`js/CommandManager.js`) manages all commands:
- Loads command configurations from JSON
- Dynamically imports command implementation classes
- Maintains a registry of available commands
- Provides methods to access and execute commands

### 5. Main Application Logic

The main application (`js/main.js`):
- Initializes the command manager
- Handles UI interactions and command input
- Displays command suggestions
- Executes commands when triggered

## Flow of Execution

1. On page load, `main.js` creates a new `CommandManager` instance
2. The command manager loads command configurations from `commands.json`
3. For each command configuration, the corresponding command class is dynamically imported
4. When a user enters a command, the application validates it and passes it to the command manager
5. The command manager finds the appropriate command object and calls its `execute()` method

## Diagram

```
┌─────────────────┐     loads      ┌──────────────────┐
│  commands.json  │◄──────────────►│  CommandManager  │
└─────────────────┘                └──────────────────┘
                                          │
                                          │ imports
                                          ▼
┌─────────────────┐               ┌──────────────────┐
│     main.js     │◄──────────────►│  Command classes │
└─────────────────┘    executes    └──────────────────┘
```

This architecture ensures a clean separation of concerns, making the system easy to maintain and extend.
