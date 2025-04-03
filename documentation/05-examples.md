# Command Examples

This document provides example implementations for common command types to help you get started.

## Basic Command

A simple command that just performs an action:

```javascript
// js/commands/AlertCommand.js
import Command from './Command.js';

class AlertCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  async execute() {
    alert('This is a basic command!');
  }
}

export default AlertCommand;
```

JSON configuration:
```json
{
  "name": "/alert",
  "description": "Show a simple alert",
  "handlerClass": "AlertCommand"
}
```

## Modal Display Command

A command that shows content in the modal:

```javascript
// js/commands/InfoCommand.js
import Command from './Command.js';

class InfoCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  async execute() {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "System Information";
    modalContent.innerHTML = `
      <div class="space-y-4">
        <p>Muadib Command System</p>
        <p>Version: 1.0.0</p>
        <p>Build Date: ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    modalContainer.classList.remove('hidden');
  }
}

export default InfoCommand;
```

JSON configuration:
```json
{
  "name": "/info",
  "description": "Display system information",
  "handlerClass": "InfoCommand"
}
```

## Command with Parameters

A command that accepts and processes parameters:

```javascript
// js/commands/EchoCommand.js
import Command from './Command.js';

class EchoCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  async execute(fullCommand) {
    // Get everything after the command name
    const text = fullCommand.substring(fullCommand.indexOf(' ') + 1).trim();
    
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Echo";
    
    if (text) {
      modalContent.innerHTML = `<p>You said: "${text}"</p>`;
    } else {
      modalContent.innerHTML = `<p>You didn't say anything! Usage: /echo [text]</p>`;
    }
    
    modalContainer.classList.remove('hidden');
  }
}

export default EchoCommand;
```

JSON configuration:
```json
{
  "name": "/echo",
  "description": "Echo back your text",
  "handlerClass": "EchoCommand"
}
```

Note: To implement parameters, the command system would need to be modified to pass the full command string to the execute method.

## API Request Command

A command that fetches data from an API:

```javascript
// js/commands/WeatherCommand.js
import Command from './Command.js';

class WeatherCommand extends Command {
  constructor(data) {
    super(data);
    this.apiKey = data.apiKey || 'default-key';
  }
  
  async execute(fullCommand) {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Weather Information";
    modalContent.innerHTML = `<p>Loading weather data...</p>`;
    modalContainer.classList.remove('hidden');
    
    try {
      // Get city from command
      const parts = fullCommand.split(' ');
      const city = parts.length > 1 ? parts.slice(1).join(' ') : 'London';
      
      // Fetch weather data
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${city}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Display weather information
      modalContent.innerHTML = `
        <div class="space-y-4">
          <h3 class="text-xl font-bold">${data.location.name}, ${data.location.country}</h3>
          <p>Temperature: ${data.current.temp_c}°C / ${data.current.temp_f}°F</p>
          <p>Condition: ${data.current.condition.text}</p>
          <img src="${data.current.condition.icon}" alt="Weather icon">
        </div>
      `;
    } catch (error) {
      modalContent.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }
}

export default WeatherCommand;
```

JSON configuration:
```json
{
  "name": "/weather",
  "description": "Check the weather for a city",
  "handlerClass": "WeatherCommand",
  "apiKey": "your-api-key-here"
}
```

## Local Storage Command

A command that works with browser storage:

```javascript
// js/commands/NoteCommand.js
import Command from './Command.js';

class NoteCommand extends Command {
  constructor(data) {
    super(data);
    this.storageKey = 'muadib-notes';
  }
  
  async execute(fullCommand) {
    const parts = fullCommand.split(' ');
    const action = parts.length > 1 ? parts[1].toLowerCase() : 'list';
    
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Notes";
    
    switch (action) {
      case 'add':
        await this.addNote(parts.slice(2).join(' '));
        modalContent.innerHTML = '<p>Note added successfully!</p>';
        break;
        
      case 'list':
        await this.listNotes(modalContent);
        break;
        
      case 'clear':
        await this.clearNotes();
        modalContent.innerHTML = '<p>All notes cleared!</p>';
        break;
        
      default:
        modalContent.innerHTML = `
          <p>Unknown action: ${action}</p>
          <p>Available actions:</p>
          <ul class="list-disc pl-5">
            <li><code>/note add [text]</code> - Add a new note</li>
            <li><code>/note list</code> - List all notes</li>
            <li><code>/note clear</code> - Clear all notes</li>
          </ul>
        `;
    }
    
    modalContainer.classList.remove('hidden');
  }
  
  async addNote(text) {
    if (!text) return false;
    
    // Get existing notes
    const notes = this.getNotes();
    
    // Add new note
    notes.push({
      id: Date.now(),
      text: text,
      timestamp: new Date().toISOString()
    });
    
    // Save notes
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    
    return true;
  }
  
  async listNotes(container) {
    const notes = this.getNotes();
    
    if (notes.length === 0) {
      container.innerHTML = '<p>No notes found.</p>';
      return;
    }
    
    let html = '<div class="space-y-4">';
    
    notes.forEach(note => {
      const date = new Date(note.timestamp).toLocaleString();
      html += `
        <div class="p-3 bg-purple-100/30 rounded-lg">
          <p>${note.text}</p>
          <p class="text-xs text-gray-500">Added: ${date}</p>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  }
  
  async clearNotes() {
    localStorage.removeItem(this.storageKey);
  }
  
  getNotes() {
    try {
      const notes = localStorage.getItem(this.storageKey);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }
}

export default NoteCommand;
```

JSON configuration:
```json
{
  "name": "/note",
  "description": "Manage personal notes",
  "handlerClass": "NoteCommand"
}
```

## Interactive Command

A command with interactive UI elements:

```javascript
// js/commands/TodoCommand.js
import Command from './Command.js';

class TodoCommand extends Command {
  constructor(data) {
    super(data);
    this.storageKey = 'muadib-todos';
  }
  
  async execute() {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Todo List";
    
    // Create HTML structure
    modalContent.innerHTML = `
      <div class="space-y-4">
        <form id="todo-form" class="flex gap-2">
          <input 
            type="text" 
            id="todo-input" 
            class="flex-grow p-2 rounded-lg bg-purple-100/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Add a new task"
          >
          <button 
            type="submit"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Add
          </button>
        </form>
        
        <div id="todo-list" class="space-y-2">
          <!-- Todo items will be inserted here -->
        </div>
      </div>
    `;
    
    modalContainer.classList.remove('hidden');
    
    // After DOM is updated, add event listeners and load todos
    setTimeout(() => {
      this.setupEventListeners();
      this.renderTodos();
    }, 0);
  }
  
  setupEventListeners() {
    const form = document.getElementById('todo-form');
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (text) {
          this.addTodo(text);
          input.value = '';
          this.renderTodos();
        }
      });
    }
  }
  
  renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    const todos = this.getTodos();
    
    if (todos.length === 0) {
      todoList.innerHTML = '<p class="text-gray-500">No tasks yet. Add one above!</p>';
      return;
    }
    
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.className = 'flex items-center justify-between p-3 bg-purple-100/30 rounded-lg';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'mr-2';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => {
        this.toggleTodo(todo.id);
        this.renderTodos();
      });
      
      const textSpan = document.createElement('span');
      textSpan.className = todo.completed ? 'line-through flex-grow' : 'flex-grow';
      textSpan.textContent = todo.text;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-red-500 hover:text-red-700 ml-2';
      deleteBtn.innerHTML = '×';
      deleteBtn.addEventListener('click', () => {
        this.deleteTodo(todo.id);
        this.renderTodos();
      });
      
      todoItem.appendChild(checkbox);
      todoItem.appendChild(textSpan);
      todoItem.appendChild(deleteBtn);
      
      todoList.appendChild(todoItem);
    });
  }
  
  getTodos() {
    try {
      const todos = localStorage.getItem(this.storageKey);
      return todos ? JSON.parse(todos) : [];
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }
  
  saveTodos(todos) {
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }
  
  addTodo(text) {
    const todos = this.getTodos();
    
    todos.push({
      id: Date.now(),
      text: text,
      completed: false,
      timestamp: new Date().toISOString()
    });
    
    this.saveTodos(todos);
  }
  
  toggleTodo(id) {
    const todos = this.getTodos();
    const index = todos.findIndex(todo => todo.id === id);
    
    if (index !== -1) {
      todos[index].completed = !todos[index].completed;
      this.saveTodos(todos);
    }
  }
  
  deleteTodo(id) {
    const todos = this.getTodos();
    const newTodos = todos.filter(todo => todo.id !== id);
    this.saveTodos(newTodos);
  }
}

export default TodoCommand;
```

JSON configuration:
```json
{
  "name": "/todo",
  "description": "Manage your to-do list",
  "handlerClass": "TodoCommand"
}
```

## Command with Confirmation

A command that asks for confirmation before executing a destructive action:

```javascript
// js/commands/ResetCommand.js
import Command from './Command.js';

class ResetCommand extends Command {
  constructor(data) {
    super(data);
  }
  
  async execute() {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    modalTitle.textContent = "Reset Application";
    modalContent.innerHTML = `
      <div class="space-y-4">
        <p class="text-red-500 font-bold">Warning: This will reset all application data!</p>
        <p>All saved settings, preferences, and user data will be lost.</p>
        <p>Are you sure you want to continue?</p>
        
        <div class="flex gap-4 justify-end mt-6">
          <button id="reset-cancel" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button id="reset-confirm" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Reset Everything
          </button>
        </div>
      </div>
    `;
    
    modalContainer.classList.remove('hidden');
    
    // Add event listeners after DOM update
    setTimeout(() => {
      document.getElementById('reset-cancel').addEventListener('click', () => {
        modalContainer.classList.add('hidden');
      });
      
      document.getElementById('reset-confirm').addEventListener('click', () => {
        this.performReset();
        modalContent.innerHTML = `
          <p>Application has been reset successfully.</p>
          <p>Refresh the page to see the changes.</p>
        `;
      });
    }, 0);
  }
  
  performReset() {
    // Clear all localStorage
    localStorage.clear();
    
    // You could also reset other application state here
    console.log('Application reset performed');
  }
}

export default ResetCommand;
```

JSON configuration:
```json
{
  "name": "/reset",
  "description": "Reset all application data",
  "handlerClass": "ResetCommand"
}
```

These examples cover a wide range of common command patterns. You can use them as starting points for your own commands, adapting them to your specific requirements.
