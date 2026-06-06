4document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. STATE CONFIGURATION & DATA STORAGE PERSISTENCE
  // ==========================================================================
  // Fetch previously stored data from LocalStorage or default to an empty array
  let todos = JSON.parse(localStorage.getItem('portfolio_tasks_data')) || [];
  let currentFilter = 'all';

  // DOM Selection Node Caching
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const todoStats = document.getElementById('todo-stats');
  const filterControls = document.querySelector('.filter-controls');

  // ==========================================================================
  // 2. STATE ENGINE CORE CRUD OPERATIONS
  // ==========================================================================
  
  // CREATE: Add a brand new item to the data state array
  const addTaskItem = (taskText) => {
    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), // Bulletproof unique ID generation
      text: taskText.trim(),
      completed: false
    };
    todos.push(newTask);
    syncStateAndRender();
  };

  // EVENT DELEGATION: Single efficient listener handles Update & Delete for performance
  todoList.addEventListener('click', (event) => {
    const targetElement = event.target;
    // Walk up to find the closest parent item containing our bound structural ID token
    const taskContainer = targetElement.closest('.todo-item');
    if (!taskContainer) return;
    
    const targetId = taskContainer.dataset.id;

    // UPDATE: Toggle Checked/Completed status
    if (targetElement.classList.contains('todo-checkbox') || targetElement.type === 'checkbox') {
      todos = todos.map(todo => 
        todo.id === targetId ? { ...todo, completed: targetElement.checked } : todo
      );
      syncStateAndRender();
    }

    // UPDATE: Inline text value modification prompt
    if (targetElement.classList.contains('edit-btn')) {
      const currentTodo = todos.find(todo => todo.id === targetId);
      if (!currentTodo) return;

      const userUpdateInput = prompt('Update task entry description:', currentTodo.text);
      if (userUpdateInput && userUpdateInput.trim() !== '') {
        todos = todos.map(todo => 
          todo.id === targetId ? { ...todo, text: userUpdateInput.trim() } : todo
        );
        syncStateAndRender();
      }
    }

    // DELETE: Filter out and erase target index item entirely
    if (targetElement.classList.contains('delete-btn')) {
      todos = todos.filter(todo => todo.id !== targetId);
      syncStateAndRender();
    }
  });

  // ==========================================================================
  // 3. STORAGE SYNC & RENDERING CONTEXT ENGINE
  // ==========================================================================
  const syncStateAndRender = () => {
    localStorage.setItem('portfolio_tasks_data', JSON.stringify(todos));
    render();
  };

  const render = () => {
    // Apply client filters down over raw background arrays
    const itemsToDisplay = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true; // Catch-all for "all" configuration states
    });

    // Clear inner content to prevent layout duplicates on loop updates
    todoList.innerHTML = '';

    // Generate elements dynamically using secure, accessible string processing maps
    itemsToDisplay.forEach(todo => {
      const listItem = document.createElement('li');
      listItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      listItem.dataset.id = todo.id;

      listItem.innerHTML = `
        <div class="todo-item-left">
          <input 
            type="checkbox" 
            id="check-${todo.id}" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            aria-label="Mark task '${escapeHTML(todo.text)}' as ${todo.completed ? 'incomplete' : 'complete'}">
          <label for="check-${todo.id}" class="todo-text">${escapeHTML(todo.text)}</label>
        </div>
        <div class="todo-item-actions">
          <button type="button" class="edit-btn" aria-label="Edit task entry: ${escapeHTML(todo.text)}">Edit</button>
          <button type="button" class="delete-btn" aria-label="Delete task entry: ${escapeHTML(todo.text)}">Delete</button>
        </div>
      `;
      todoList.appendChild(listItem);
    });

    // Recalculate operational indicators for assistive device alerts
    const activeTasksCount = todos.filter(todo => !todo.completed).length;
    todoStats.textContent = `${activeTasksCount} active task${activeTasksCount === 1 ? '' : 's'} remaining.`;
  };

  // ==========================================================================
  // 4. INTERACTION SUBMISSIONS & INTERFACE LISTENERS
  // ==========================================================================
  
  // Handle filter buttons swapping via delegation
  filterControls.addEventListener('click', (event) => {
    const contextButton = event.target.closest('.filter-btn');
    if (!contextButton) return;

    // Reset layout attributes clean on siblings
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });

    // Activate selected button properties
    contextButton.classList.add('active');
    contextButton.setAttribute('aria-pressed', 'true');
    currentFilter = contextButton.dataset.filter;
    render();
  });

  // Form Submission Interception
  // Ensure this form submission block looks EXACTLY like this
todoForm.addEventListener('submit', (event) => {
  // 1. THIS IS THE FIX: This line stops the form from posting to www.thiranex.in
  event.preventDefault(); 

  // 2. Local state logic handles the task addition locally instead
  const entryValue = todoInput.value.trim();
  if (entryValue === '') return;

  addTaskItem(entryValue);
  todoInput.value = ''; // Clear input field
  todoInput.focus();    // Reset focus
});


  // XSS Security Sanitiser: Converts literal element inputs into static strings
  function escapeHTML(string) {
    return string.replace(/[&<>'"]/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[match]));
  }

  // Initial Boot Sequence Execution Run
  render();
});
