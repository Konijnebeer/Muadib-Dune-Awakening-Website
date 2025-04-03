document.addEventListener('DOMContentLoaded', () => {
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
    
    // Variables to store command data
    let commands = [];
    let commandContent = {};
    let quotes = [];
    
    // Improved utility function to fetch data with better error handling
    function fetchData(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error loading data from ${url}:`, error);
                return null; // Return null on error to allow handling
            });
    }

    // Initialize the application by loading all required data
    function initializeApp() {
        Promise.all([
            fetchData('data/info.json'),
            fetchData('data/quotes.json')
        ]).then(([infoData, quotesData]) => {
            if (infoData) {
                processCommandData(infoData);
            }
            
            if (quotesData) {
                quotes = quotesData.quotes;
                
                // Add quote command content
                commandContent["/quote"] = {
                    title: "Random Dune Quote",
                    content: [] // Will be generated dynamically
                };
            }
            
            // Initialize suggestions after all data is loaded
            resetCommandInput();
        });
    }
    
    // Process command data from JSON
    function processCommandData(data) {
        // Create basic command list
        commands = data.commands.map(cmd => ({
            name: cmd.name, 
            description: cmd.description
        }));
        
        // Add special commands
        commands.push({
            name: "/quote",
            description: "Display a random quote from Dune"
        });
        
        // Add builder command
        commands.push({
            name: "/builder",
            description: "Dune Awakening base builder"
        });
        
        // Sort commands alphabetically
        commands.sort((a, b) => a.name.localeCompare(b.name));
        
        // Create commandContent object for modal display
        data.commands.forEach(cmd => {
            commandContent[cmd.name] = {
                title: cmd.title,
                content: cmd.content
            };
        });
    }
    
    // Function to get a random quote
    function getRandomQuote() {
        if (quotes.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    }
    
    // Function to reset input
    function resetCommandInput() {
        elements.commandInput.value = "";
        updateSuggestions(); // Show all suggestions after reset
    }
    
    // Function to display all available commands
    function showAllSuggestions() {
        elements.suggestionsList.innerHTML = '';
        commands.forEach(cmd => {
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
            const matchedCommands = commands.filter(cmd => 
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
    
    // Function to animate modal entrance
    function animateModalEntrance() {
        if (elements.modalDialog) {
            elements.modalDialog.style.opacity = '0';
            elements.modalDialog.style.transform = 'scale(0.95) translateY(10px)';
            setTimeout(() => {
                elements.modalDialog.style.transition = 'all 0.3s ease-out';
                elements.modalDialog.style.opacity = '1';
                elements.modalDialog.style.transform = 'scale(1) translateY(0)';
            }, 10);
        }
    }
    
    // Function to show modal with content
    function showModal(title, content) {
        elements.modalTitle.textContent = title;
        renderContent(content, elements.modalContent);
        elements.modalContainer.classList.remove('hidden');
        animateModalEntrance();
        
        // Clear input and hide suggestions
        resetCommandInput();
        elements.suggestionBox.classList.add('hidden');
    }
    
    // Function to redirect to another page
    function redirectToPage(url) {
        window.location.href = url;
    }
    
    // Function to execute a command
    function executeCommand(command) {
        if (command === "/quote") {
            // Handle random quote command
            const randomQuote = getRandomQuote();
            if (randomQuote) {
                const quoteContent = [
                    {
                        type: "quote",
                        text: randomQuote.text
                    },
                    {
                        type: "text",
                        text: `— ${randomQuote.speaker}`
                    }
                ];
                
                showModal("Random Dune Quote", quoteContent);
            }
        } else if (command === "/builder") {
            // Redirect to the builder page
            redirectToPage("builder.html");
        } else if (commandContent[command]) {
            // Display modal with command content
            showModal(commandContent[command].title, commandContent[command].content);
        } else {
            // Invalid command feedback
            elements.commandInput.classList.add('invalid-command');
            setTimeout(() => {
                elements.commandInput.classList.remove('invalid-command');
            }, 800);
        }
    }
    
    // Function to render structured content
    function renderContent(content, container) {
        // Clear the container
        container.innerHTML = '';
        
        // Create wrapper div with spacing
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-4';
        
        // Process each content item
        content.forEach(item => {
            const contentElement = createContentElement(item);
            if (contentElement) {
                wrapper.appendChild(contentElement);
            }
        });
        
        container.appendChild(wrapper);
    }
    
    // Helper function to create content elements based on type
    function createContentElement(item) {
        switch(item.type) {
            case 'text':
                return createTextElement(item);
            case 'list':
                return createListElement(item);
            case 'infobox':
                return createInfoboxElement(item);
            case 'quote':
                return createQuoteElement(item);
            default:
                console.warn('Unknown content type:', item.type);
                return null;
        }
    }
    
    // Helper functions for creating specific content elements
    function createTextElement(item) {
        const textDiv = document.createElement('div');
        
        if (item.header) {
            const header = document.createElement('h3');
            header.className = 'text-xl font-semibold modal-header mt-4';
            header.textContent = item.header;
            textDiv.appendChild(header);
        }
        
        const p = document.createElement('p');
        p.textContent = item.text;
        textDiv.appendChild(p);
        
        return textDiv;
    }
    
    function createListElement(item) {
        const listDiv = document.createElement('div');
        
        if (item.header) {
            const header = document.createElement('h3');
            header.className = 'text-xl font-semibold modal-header mt-4';
            header.textContent = item.header;
            listDiv.appendChild(header);
        }
        
        const ul = document.createElement('ul');
        ul.className = 'list-disc pl-5';
        
        item.items.forEach(listItem => {
            const li = document.createElement('li');
            li.textContent = listItem;
            ul.appendChild(li);
        });
        
        listDiv.appendChild(ul);
        return listDiv;
    }
    
    function createInfoboxElement(item) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'infobox-modal p-4 rounded-lg shadow-md';
        
        if (item.header) {
            const header = document.createElement('h3');
            header.className = 'text-lg font-semibold modal-header mb-2';
            header.textContent = item.header;
            infoDiv.appendChild(header);
        }
        
        const infoText = document.createElement('p');
        infoText.textContent = item.text;
        infoDiv.appendChild(infoText);
        
        return infoDiv;
    }
    
    function createQuoteElement(item) {
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'border-l-4 border-purple-700 pl-4 italic mt-4';
        blockquote.textContent = item.text;
        
        return blockquote;
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
    
    // Initialize the application
    initializeApp();
});