# Muadib Command System Documentation

## Overview

The Muadib command system is a modular, extensible architecture that allows for easy implementation of new commands. This system uses:

- A central JSON configuration file for command metadata
- A class-based approach for command implementation
- Dynamic loading of command modules
- A command manager that handles command registration and execution

This documentation will guide you through the system architecture and explain how to add new commands.

## Contents

1. [System Architecture](01-system-architecture.md) - Overview of how the command system works
2. [Creating New Commands](02-creating-new-commands.md) - Step-by-step guide for adding new commands
3. [Command Manager Reference](03-command-manager-reference.md) - Detailed documentation of the CommandManager class
4. [JSON Configuration](04-json-configuration.md) - Guide to the command JSON structure
5. [Examples](05-examples.md) - Example command implementations

## Quick Start

To add a new command:

1. Create a new command class in the `js/commands/` directory
2. Add an entry for your command in `data/commands.json`
3. Your command will automatically be loaded and available in the UI

See [Creating New Commands](02-creating-new-commands.md) for detailed instructions.
