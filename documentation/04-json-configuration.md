# JSON Configuration

Commands in the Muadib system are configured through a central JSON file. This document explains the structure of this file and how to use it effectively.

## File Location

The command configuration is stored in:

```
data/commands.json
```

## Basic Structure

The file contains a JSON object with a `commands` array:

```json
{
  "commands": [
    {
      "name": "/command1",
      "description": "Description of command 1",
      "handlerClass": "Command1Class"
    },
    {
      "name": "/command2",
      "description": "Description of command 2",
      "handlerClass": "Command2Class"
    }
  ]
}
```

## Command Properties

Each command entry must include the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | The command identifier (must start with `/`) |
| `description` | String | Brief description shown in the UI suggestion list |
| `handlerClass` | String | Name of the JavaScript class that implements the command |

## Optional Properties

You can extend the structure with additional properties that your commands might need:

```json
{
  "commands": [
    {
      "name": "/advanced",
      "description": "Advanced command example",
      "handlerClass": "AdvancedCommand",
      "icon": "advanced-icon.svg",
      "permissions": ["admin"],
      "category": "utilities",
      "help": "Detailed help text for the advanced command"
    }
  ]
}
```

Any additional properties you add will be passed to the command's constructor in the `data` parameter.

## Command Order

The order of commands in the JSON file does not affect their display in the UI. Commands are automatically sorted alphabetically by name when displayed in the suggestions list.

## Example Configuration

Here's a more comprehensive example:

```json
{
  "commands": [
    {
      "name": "/builder",
      "description": "Dune Awakening base builder",
      "handlerClass": "BuilderCommand",
      "category": "tools"
    },
    {
      "name": "/help",
      "description": "Display help information",
      "handlerClass": "HelpCommand",
      "category": "system"
    },
    {
      "name": "/settings",
      "description": "Change application settings",
      "handlerClass": "SettingsCommand",
      "category": "system",
      "permissions": ["user"]
    },
    {
      "name": "/admin",
      "description": "Administration panel",
      "handlerClass": "AdminCommand",
      "category": "admin",
      "permissions": ["admin"]
    }
  ]
}
```

## Best Practices

1. **Use descriptive names**: Command names should be intuitive and reflect their function
2. **Keep descriptions concise**: Descriptions should be short but informative
3. **Organize with categories**: Use optional properties like `category` to group related commands
4. **Match class names exactly**: The `handlerClass` must match the name of your JavaScript class
5. **Be consistent**: Use a consistent naming convention for all commands

## Updating Configuration

When you update the commands.json file:

1. The system will load the new configuration on page refresh
2. No server restart is needed (as long as static files are being served)
3. Make sure any new command classes referenced in the JSON are also created

## Validation

The system performs basic validation when loading commands:

- Commands with missing required properties will be skipped
- If a command class can't be found, the command will be skipped with an error logged
- Duplicate command names will result in the later definition overriding earlier ones
