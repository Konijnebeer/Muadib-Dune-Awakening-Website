import CommandManager from './CommandManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM element references
    const elements = {
        commandInput: document.getElementById('command-input'),
        suggestionBox: document.getElementById('suggestion-box'),
        suggestionsList: document.getElementById('suggestions'),
        modalContainer: document.getElementById('modal-container'),
        modalTitle: document.getElementById('modal-title'),
        modalContent: document.getElementById('modal-content'),
        closeModalBtn: document.getElementById('close-modal'),
        modalBackdrop: document.getElementById('modal-backdrop'),
        modalDialog: document.querySelector('.modal-dialog')
    };
    
    // Initialize the command manager
    const commandManager = new CommandManager();
    
    // Initialize the application
    async function initializeApp() {
        try {
            // Load commands from JSON and wait for them to complete loading
            await commandManager.loadCommands('data/commands.json');
            
            // Show all suggestions immediately after commands are loaded
            showAllSuggestions();
            
            // Initialize input
            resetCommandInput();
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
    
    // Function to reset input
    function resetCommandInput() {
        elements.commandInput.value = "";
        // Note: We don't call updateSuggestions() here anymore to avoid double-showing suggestions
    }
    
    // Function to display all available commands
    function showAllSuggestions() {
        elements.suggestionsList.innerHTML = '';
        commandManager.getAllCommands().forEach(cmd => {
            appendSuggestionItem(cmd);
        });
        elements.suggestionBox.classList.remove('hidden');
    }
    
    // Helper function to create and append a suggestion item
    function appendSuggestionItem(cmd) {
        const li = document.createElement('li');
        li.className = 'p-2 cursor-pointer rounded';
        
        // Create separate spans for command name and description with different styling
        const commandSpan = document.createElement('span');
        commandSpan.textContent = cmd.name;
        
        const descSpan = document.createElement('span');
        descSpan.textContent = ` - ${cmd.description}`;
        descSpan.className = 'normal-font font-bold';
        
        li.appendChild(commandSpan);
        li.appendChild(descSpan);
        
        li.addEventListener('click', () => {
            elements.commandInput.value = cmd.name.substring(1); // Remove the "/" prefix
            elements.suggestionBox.classList.add('hidden');
            elements.commandInput.focus(); // Keep focus on the input
        });
        
        elements.suggestionsList.appendChild(li);
    }
    
    // Function to update suggestions based on input
    function updateSuggestions() {
        const inputValue = elements.commandInput.value.trim();
        
        if (inputValue === "") {
            // Show all available commands when input is empty
            showAllSuggestions();
        } else {
            const prefixedInput = "/" + inputValue;
            // Find matching commands
            const matchedCommands = commandManager.getAllCommands().filter(cmd => 
                cmd.name.startsWith(prefixedInput.toLowerCase())
            );
            
            if (matchedCommands.length > 0) {
                elements.suggestionsList.innerHTML = '';
                matchedCommands.forEach(cmd => {
                    appendSuggestionItem(cmd);
                });
                elements.suggestionBox.classList.remove('hidden');
            } else {
                elements.suggestionBox.classList.add('hidden');
            }
        }
    }
    
    // Function to execute a command
    async function executeCommand(command) {
        const executed = await commandManager.executeCommand(command);
        
        if (!executed) {
            // Invalid command feedback
            elements.commandInput.classList.add('invalid-command');
            setTimeout(() => {
                elements.commandInput.classList.remove('invalid-command');
            }, 800);
        }
    }
    
    // Function to close modal
    function closeModal() {
        elements.modalContainer.classList.add('hidden');
        resetCommandInput();
    }
    
    // Event Listeners
    elements.commandInput.addEventListener('input', updateSuggestions);
    
    elements.commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = "/" + elements.commandInput.value.trim().toLowerCase();
            executeCommand(command);
        }
    });
    
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modalContainer.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Explicitly ensure suggestions are shown when app is initialized
    await initializeApp();
});