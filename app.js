// ==========================================================================
// Theme Management Setup (Task 2 Switcher)
// ==========================================================================
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Initialize Theme
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.querySelector('.mode-icon').textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    let theme = 'light';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (!isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
        themeToggle.querySelector('.mode-icon').textContent = '☀️';
        theme = 'dark';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.setAttribute('aria-pressed', 'false');
        themeToggle.querySelector('.mode-icon').textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
});

// ==========================================================================
// Task 3: Interactive To-Do Engine (State Management & Storage Logic)
// ==========================================================================

// Application State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM Element Selectors
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');

// Filter Selectors
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');

// Save State to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Generate Unique IDs without External Libraries
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Main Render Loop Function
function renderTodos() {
    todoList.innerHTML = '';
    
    // Filter State Management
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    // Generate Dynamic DOM Items with event bindings and accessible design
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        if (todo.isEditing) {
            // Render Inline Editing State Configuration
            li.innerHTML = `
                <div class="todo-item-left">
                    <input type="text" class="edit-input" value="${escapeHTML(todo.text)}" aria-label="Edit item title">
                </div>
                <div class="todo-actions">
                    <button class="action-btn btn-save" aria-label="Save modification">Save</button>
                    <button class="action-btn btn-cancel" aria-label="Cancel modification">Cancel</button>
                </div>
            `;
        } else {
            // Render Default Item Configuration
            li.innerHTML = `
                <div class="todo-item-left">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} aria-label="Mark '${escapeHTML(todo.text)}' as completed">
                    <span class="todo-text">${escapeHTML(todo.text)}</span>
                </div>
                <div class="todo-actions">
                    <button class="action-btn btn-edit" aria-label="Edit task title">Edit</button>
                    <button class="action-btn btn-delete" aria-label="Delete this task">Delete</button>
                </div>
            `;
        }
        todoList.appendChild(li);
    });

    // Update Reactive Footer Tracker Metrics
    const activeCount = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
}

// XSS Sanitizer Helper Security Layer
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Update Active Filter UI Classes 
function setFilter(filter) {
    currentFilter = filter;
    [filterAll, filterActive, filterCompleted].forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    if (filter === 'all') { filterAll.classList.add('active'); filterAll.setAttribute('aria-pressed', 'true'); }
    if (filter === 'active') { filterActive.classList.add('active'); filterActive.setAttribute('aria-pressed', 'true'); }
    if (filter === 'completed') { filterCompleted.classList.add('active'); filterCompleted.setAttribute('aria-pressed', 'true'); }
    
    renderTodos();
}

// ==========================================================================
// Event Listeners & Event Delegation Architecture
// ==========================================================================

// Create Event
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        id: generateId(),
        text: text,
        completed: false,
        isEditing: false
    });

    todoInput.value = '';
    saveToLocalStorage();
    renderTodos();
});

// Event Delegation Architecture for Dynamic DOM Elements (CRUD operations)
todoList.addEventListener('click', (e) => {
    const target = e.target;
    const itemEl = target.closest('.todo-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const todo = todos.find(t => t.id === id);

    // Toggle Complete State Event
    if (target.classList.contains('todo-checkbox')) {
        todo.completed = target.checked;
        saveToLocalStorage();
        renderTodos();
    }
    
    // Trigger Edit Mode Input Element View
    if (target.classList.contains('btn-edit')) {
        todo.isEditing = true;
        renderTodos();
    }

    // Cancel Active Editing Frame Mode State Change
    if (target.classList.contains('btn-cancel')) {
        todo.isEditing = false;
        renderTodos();
    }

    // Update Task (Save Functionality)
    if (target.classList.contains('btn-save')) {
        const inputVal = itemEl.querySelector('.edit-input').value.trim();
        if (inputVal) {
            todo.text = inputVal;
            todo.isEditing = false;
            saveToLocalStorage();
            renderTodos();
        }
    }

    // Delete Event Execution
    if (target.classList.contains('btn-delete')) {
        todos = todos.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTodos();
    }
});

// Filter Triggers Setup
filterAll.addEventListener('click', () => setFilter('all'));
filterActive.addEventListener('click', () => setFilter('active'));
filterCompleted.addEventListener('click', () => setFilter('completed'));

// Initial App Boot Mounting Loop 
renderTodos();
// ==========================================================================
// Task 4: Weather Dashboard Async REST Engine (Fetch, Async/Await & JSON)
// ==========================================================================

const weatherForm = document.getElementById('weather-form');
const weatherInput = document.getElementById('weather-input');
const weatherLoader = document.getElementById('weather-loader');
const weatherError = document.getElementById('weather-error');
const weatherErrorMessage = document.getElementById('error-message');
const weatherDisplay = document.getElementById('weather-display');

// DOM Target Element Mappings for Metric Intersections
const wLocation = document.getElementById('w-location');
const wTemp = document.getElementById('w-temp');
const wDescription = document.getElementById('w-description');
const wHumidity = document.getElementById('w-humidity');
const wWind = document.getElementById('w-wind');
const wDirection = document.getElementById('w-direction');
const wElevation = document.getElementById('w-elevation');

// Weather Code Interpretation Mapping Array Object Dictionary
const weatherCodes = {
    0: { desc: 'Clear Skies', icon: '☀️' },
    1: { desc: 'Mainly Clear', icon: '🌤️' },
    2: { desc: 'Partly Cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Foggy Conditions', icon: '🌫️' },
    48: { desc: 'Depositing Rime Fog', icon: '🌫️' },
    51: { desc: 'Light Drizzle', icon: '🌧️' },
    53: { desc: 'Moderate Drizzle', icon: '🌧️' },
    55: { desc: 'Dense Drizzle', icon: '🌧️' },
    61: { desc: 'Slight Rain', icon: '🌦️' },
    63: { desc: 'Moderate Rain', icon: '🌧️' },
    65: { desc: 'Heavy Rain', icon: '🌧️' },
    71: { desc: 'Slight Snowfall', icon: '❄️' },
    73: { desc: 'Moderate Snowfall', icon: '❄️' },
    75: { desc: 'Heavy Snowfall', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' }
};

// Event Handler Root Entry Point
weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cityName = weatherInput.value.trim();
    if (!cityName) return;

    // Reset Component State Layout Pipeline Views
    showWeatherLoader();
    
    try {
        // Step A: Convert city name to Lat/Long using Geocoding API endpoint
        const geoUrl = "https://open-meteo.com{encodeURIComponent(targetCity)}&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error('Network communications error during location lookup pipeline.');
        }

        const geoData = await geoResponse.json();

        // Error boundary validation for invalid city parameters 
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`Could not locate "${cityName}". Check your spelling and try again.`);
        }

        // Parse individual elements from target JSON Object layout nodes
        const { latitude, longitude, name, country, admin1 } = geoData.results[0];
        const locationString = `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`;

        // Step B: Fetch weather using geographical parameters
        const weatherUrl = `https://open-meteo.com{latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error('Weather forecast engine returned a network transmission execution error.');
        }

        const weatherData = await weatherResponse.json();
        
        // Step C: Distribute data elements down through rendering system
        renderWeatherData(weatherData, locationString);

    } catch (error) {
        // Catch block error logging routine
        showWeatherError(error.message);
    }
});

// UI State Visualization Helpers
function showWeatherLoader() {
    weatherLoader.classList.remove('hidden');
    weatherError.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

function showWeatherError(message) {
    weatherErrorMessage.textContent = message;
    weatherError.classList.remove('hidden');
    weatherLoader.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

// Complex Nested JSON Processing Engine Method (Task 4 Core Spec)
function renderWeatherData(data, locationName) {
    // Access deep nesting trees inside the data payload response mapping structure
    const currentMetrics = data.current;
    const weatherCode = currentMetrics.weather_code;
    
    // Fallback error-safety mapping layer check for unknown array response conditions
    const condition = weatherCodes[weatherCode] || { desc: 'Unknown Conditions', icon: '🌍' };

    // Update target text values in safety containers
    wLocation.textContent = locationName;
    wTemp.textContent = `${Math.round(currentMetrics.temperature_2m)}°C`;
    wDescription.textContent = condition.desc;
    document.getElementById('w-icon').textContent = condition.icon;

    // Distribute remaining dynamic variables inside sub-grid node frames
    wHumidity.textContent = `${currentMetrics.relative_humidity_2m}%`;
    wWind.textContent = `${currentMetrics.wind_speed_10m} km/h`;
    wDirection.textContent = `${currentMetrics.wind_direction_10m}°`;
    wElevation.textContent = `${data.elevation}m`;

    // Toggle active interface frames visually
    weatherLoader.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

