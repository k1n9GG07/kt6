// task-list.js
class TaskList extends HTMLElement {
  constructor() {
    super();
    
    // Инициализация состояния
    this.tasks = this.loadTasks();
    this.taskIdCounter = this.tasks.length > 0 
      ? Math.max(...this.tasks.map(t => t.id)) + 1 
      : 1;
    
    // Создание Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Шаблон компонента
    shadow.innerHTML = `
      <style>
        /* CSS Variables для кастомизации */
        :host {
          --primary-color: var(--tl-primary, #4361ee);
          --secondary-color: var(--tl-secondary, #3a0ca3);
          --accent-color: var(--tl-accent, #f72585);
          --background-color: var(--tl-bg, #ffffff);
          --text-color: var(--tl-text, #2b2d42);
          --border-color: var(--tl-border, #e9ecef);
          --completed-color: var(--tl-completed, #adb5bd);
          --success-color: var(--tl-success, #06d6a0);
          --warning-color: var(--tl-warning, #ffd166);
          --danger-color: var(--tl-danger, #ef476f);
          --shadow-color: var(--tl-shadow, rgba(0, 0, 0, 0.1));
          --font-family: var(--tl-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          --border-radius: var(--tl-radius, 12px);
          --transition-speed: var(--tl-speed, 0.3s);
        }

        /* Базовые стили */
        .task-list-container {
          font-family: var(--font-family);
          max-width: 800px;
          margin: 0 auto;
          background: var(--background-color);
          border-radius: var(--border-radius);
          box-shadow: 0 10px 40px var(--shadow-color);
          overflow: hidden;
          transition: all var(--transition-speed) ease;
        }

        /* Заголовок и статистика */
        .task-header {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 25px;
          position: relative;
          overflow: hidden;
        }

        .task-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          animation: shimmer 3s infinite linear;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(360deg); }
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .header-title {
          font-size: 2.2rem;
          margin: 0 0 15px 0;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stats {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Форма добавления задачи */
        .task-form {
          padding: 25px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(var(--primary-color-rgb), 0.03);
        }

        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .task-input {
          flex: 1;
          padding: 15px 20px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-family: inherit;
          transition: all var(--transition-speed) ease;
          background: white;
        }

        .task-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
          transform: translateY(-1px);
        }

        .priority-select {
          padding: 15px 20px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-family: inherit;
          background: white;
          cursor: pointer;
        }

        .add-btn {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: var(--border-radius);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.2);
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.3);
        }

        .add-btn:active {
          transform: translateY(0);
        }

        /* Фильтры и сортировка */
        .task-controls {
          padding: 20px 25px;
          background: var(--background-color);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 2px solid var(--border-color);
          background: white;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all var(--transition-speed) ease;
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .filter-btn:hover:not(.active) {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .sort-select {
          padding: 10px 20px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        /* Контейнер списка задач */
        .tasks-container {
          max-height: 500px;
          overflow-y: auto;
          padding: 10px;
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) var(--border-color);
        }

        .tasks-container::-webkit-scrollbar {
          width: 8px;
        }

        .tasks-container::-webkit-scrollbar-track {
          background: var(--border-color);
          border-radius: 4px;
        }

        .tasks-container::-webkit-scrollbar-thumb {
          background: var(--primary-color);
          border-radius: 4px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--completed-color);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        /* Элемент задачи */
        .task-item {
          background: white;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 20px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all var(--transition-speed) ease;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .task-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px var(--shadow-color);
          border-color: var(--primary-color);
        }

        .task-item.completed {
          opacity: 0.7;
          background: rgba(var(--success-color-rgb), 0.05);
        }

        .task-item.completed .task-text {
          text-decoration: line-through;
          color: var(--completed-color);
        }

        /* Чекбокс */
        .task-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-speed) ease;
        }

        .task-checkbox:hover {
          border-color: var(--primary-color);
          transform: scale(1.1);
        }

        .task-checkbox.checked {
          background: var(--success-color);
          border-color: var(--success-color);
        }

        .task-checkbox.checked::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        /* Контент задачи */
        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-text {
          font-size: 1.1rem;
          margin: 0 0 8px 0;
          line-height: 1.4;
          word-break: break-word;
        }

        .task-meta {
          display: flex;
          gap: 15px;
          font-size: 0.85rem;
          color: var(--completed-color);
        }

        .task-priority {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-high {
          background: rgba(var(--danger-color-rgb), 0.1);
          color: var(--danger-color);
        }

        .priority-medium {
          background: rgba(var(--warning-color-rgb), 0.1);
          color: var(--warning-color);
        }

        .priority-low {
          background: rgba(var(--success-color-rgb), 0.1);
          color: var(--success-color);
        }

        /* Кнопки действий */
        .task-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          background: var(--border-color);
          color: var(--text-color);
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .edit-btn:hover {
          background: var(--warning-color);
          color: white;
        }

        .delete-btn:hover {
          background: var(--danger-color);
          color: white;
        }

        /* Футер */
        .task-footer {
          padding: 20px 25px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(var(--primary-color-rgb), 0.03);
        }

        .clear-completed {
          background: transparent;
          border: 2px solid var(--border-color);
          color: var(--text-color);
          padding: 10px 20px;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition-speed) ease;
        }

        .clear-completed:hover {
          border-color: var(--danger-color);
          color: var(--danger-color);
          transform: translateY(-2px);
        }

        /* Анимации */
        .task-item.removing {
          animation: slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideOut {
          to {
            opacity: 0;
            transform: translateX(100px);
            height: 0;
            padding: 0;
            margin: 0;
            border-width: 0;
          }
        }

        .pulse {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Адаптивность */
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }
          
          .task-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filters {
            justify-content: center;
          }
          
          .task-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .task-actions {
            align-self: flex-end;
          }
        }
      </style>

      <div class="task-list-container">
        <!-- Шапка -->
        <div class="task-header">
          <div class="header-content">
            <h1 class="header-title">
              <span>📋</span>
              Список задач
            </h1>
            <div class="stats">
              <div class="stat-item" id="total-tasks">Всего: 0</div>
              <div class="stat-item" id="completed-tasks">Выполнено: 0</div>
              <div class="stat-item" id="pending-tasks">Осталось: 0</div>
            </div>
          </div>
        </div>

        <!-- Форма добавления -->
        <form class="task-form" id="add-task-form">
          <div class="form-row">
            <input 
              type="text" 
              class="task-input" 
              id="task-input" 
              placeholder="Что нужно сделать?"
              autocomplete="off"
            >
            <select class="priority-select" id="priority-select">
              <option value="low">🔵 Низкий</option>
              <option value="medium">🟡 Средний</option>
              <option value="high">🔴 Высокий</option>
            </select>
          </div>
          <button type="submit" class="add-btn" id="add-btn">
            <span>➕</span>
            Добавить задачу
          </button>
        </form>

        <!-- Фильтры -->
        <div class="task-controls">
          <div class="filters">
            <button class="filter-btn active" data-filter="all">Все</button>
            <button class="filter-btn" data-filter="active">Активные</button>
            <button class="filter-btn" data-filter="completed">Выполненные</button>
          </div>
          <select class="sort-select" id="sort-select">
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="priority">По приоритету</option>
            <option value="alphabetical">По алфавиту</option>
          </select>
        </div>

        <!-- Список задач -->
        <div class="tasks-container" id="tasks-container">
          <!-- Задачи будут добавляться сюда -->
        </div>

        <!-- Подвал -->
        <div class="task-footer">
          <button class="clear-completed" id="clear-completed">
            Очистить выполненные
          </button>
          <div class="stats" id="footer-stats"></div>
        </div>
      </div>
    `;

    this.shadow = shadow;
    this.initializeComponent();
    this.renderTasks();
  }

  initializeComponent() {
    // Элементы DOM
    this.elements = {
      form: this.shadow.getElementById('add-task-form'),
      input: this.shadow.getElementById('task-input'),
      prioritySelect: this.shadow.getElementById('priority-select'),
      addBtn: this.shadow.getElementById('add-btn'),
      tasksContainer: this.shadow.getElementById('tasks-container'),
      filterButtons: this.shadow.querySelectorAll('.filter-btn'),
      sortSelect: this.shadow.getElementById('sort-select'),
      clearCompletedBtn: this.shadow.getElementById('clear-completed'),
      totalTasks: this.shadow.getElementById('total-tasks'),
      completedTasks: this.shadow.getElementById('completed-tasks'),
      pendingTasks: this.shadow.getElementById('pending-tasks'),
      footerStats: this.shadow.getElementById('footer-stats')
    };

    // Текущие фильтры и сортировка
    this.currentFilter = 'all';
    this.currentSort = 'newest';

    // Настройка цветов RGB для прозрачности
    this.setupColors();

    // Обработчики событий
    this.setupEventListeners();

    // Загрузка данных из localStorage
    this.loadTasks();
  }

  setupColors() {
    // Конвертация hex в rgb для rgba
    const style = getComputedStyle(this);
    const primaryColor = style.getPropertyValue('--primary-color').trim();
    const successColor = style.getPropertyValue('--success-color').trim();
    const dangerColor = style.getPropertyValue('--danger-color').trim();
    
    this.colors = {
      primaryRgb: this.hexToRgb(primaryColor),
      successRgb: this.hexToRgb(successColor),
      dangerRgb: this.hexToRgb(dangerColor)
    };
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '67, 97, 238';
  }

  setupEventListeners() {
    // Добавление задачи
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Обработчик для фильтров
    this.elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.elements.filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
      });
    });

    // Сортировка
    this.elements.sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.renderTasks();
    });

    // Очистка выполненных
    this.elements.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompletedTasks();
    });

    // Обработчик делегирования для списка задач
    this.elements.tasksContainer.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;

      const taskId = parseInt(taskItem.dataset.id);
      
      // Переключение выполнения
      if (e.target.classList.contains('task-checkbox') || e.target.closest('.task-checkbox')) {
        this.toggleTask(taskId);
      }
      
      // Удаление задачи
      if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        this.removeTask(taskId);
      }
      
      // Редактирование задачи
      if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
        this.editTask(taskId);
      }
    });
  }

  addTask() {
    const text = this.elements.input.value.trim();
    if (!text) {
      this.showNotification('Введите текст задачи!', 'warning');
      return;
    }

    const newTask = {
      id: this.taskIdCounter++,
      text,
      completed: false,
      priority: this.elements.prioritySelect.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Оптимизированное добавление - не перерисовываем весь список
    this.tasks.push(newTask);
    this.saveTasks();
    this.appendTaskToDOM(newTask);
    this.updateStats();
    
    this.elements.input.value = '';
    this.elements.input.focus();
    
    this.showNotification('Задача добавлена!', 'success');
  }

  appendTaskToDOM(task) {
    // Создаем элемент задачи
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskElement.dataset.id = task.id;
    taskElement.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
      <div class="task-content">
        <p class="task-text">${this.escapeHtml(task.text)}</p>
        <div class="task-meta">
          <span class="task-priority priority-${task.priority}">
            ${this.getPriorityLabel(task.priority)}
          </span>
          <span>${this.formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" title="Редактировать">✏️</button>
        <button class="action-btn delete-btn" title="Удалить">🗑️</button>
      </div>
    `;

    // Добавляем с анимацией
    taskElement.style.opacity = '0';
    this.elements.tasksContainer.prepend(taskElement);
    
    requestAnimationFrame(() => {
      taskElement.style.transition = 'opacity 0.3s ease';
      taskElement.style.opacity = '1';
    });
  }

  toggleTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
    this.tasks[taskIndex].updatedAt = new Date().toISOString();
    
    this.saveTasks();
    
    // Оптимизированное обновление - меняем только нужный элемент
    const taskElement = this.shadow.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.toggle('completed');
      taskElement.querySelector('.task-checkbox').classList.toggle('checked');
      
      // Анимация
      if (this.tasks[taskIndex].completed) {
        taskElement.classList.add('pulse');
        setTimeout(() => taskElement.classList.remove('pulse'), 1500);
      }
    }
    
    this.updateStats();
    
    if (this.currentFilter !== 'all') {
      this.renderTasks(); // Перерисовываем если фильтр активен
    }
  }

  removeTask(taskId) {
    // Анимация удаления
    const taskElement = this.shadow.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.add('removing');
      
      setTimeout(() => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.updateStats();
        
        if (this.currentFilter !== 'all') {
          this.renderTasks();
        }
      }, 400);
    }
    
    this.showNotification('Задача удалена', 'danger');
  }

  editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = this.shadow.querySelector(`.task-item[data-id="${taskId}"]`);
    const taskText = taskElement.querySelector('.task-text');
    
    const currentText = task.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-input';
    input.style.width = '100%';
    input.style.margin = '0';
    
    taskText.replaceWith(input);
    input.focus();
    input.select();
    
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        task.text = newText;
        task.updatedAt = new Date().toISOString();
        this.saveTasks();
        
        const newTextElement = document.createElement('p');
        newTextElement.className = 'task-text';
        newTextElement.textContent = newText;
        input.replaceWith(newTextElement);
        
        this.showNotification('Задача обновлена', 'success');
      } else {
        const textElement = document.createElement('p');
        textElement.className = 'task-text';
        textElement.textContent = currentText;
        input.replaceWith(textElement);
      }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    });
  }

  clearCompletedTasks() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;
    
    if (confirm(`Удалить ${completedCount} выполненных задач?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.renderTasks();
      this.showNotification(`Удалено ${completedCount} задач`, 'success');
    }
  }

  renderTasks() {
    // Фильтрация
    let filteredTasks = [...this.tasks];
    
    switch (this.currentFilter) {
      case 'active':
        filteredTasks = filteredTasks.filter(t => !t.completed);
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(t => t.completed);
        break;
    }
    
    // Сортировка
    switch (this.currentSort) {
      case 'newest':
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'alphabetical':
        filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
        break;
    }
    
    // Очистка контейнера
    this.elements.tasksContainer.innerHTML = '';
    
    // Рендеринг задач
    if (filteredTasks.length === 0) {
      this.elements.tasksContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Задачи отсутствуют</h3>
          <p>${this.getEmptyStateMessage()}</p>
        </div>
      `;
    } else {
      // Используем DocumentFragment для оптимизации
      const fragment = document.createDocumentFragment();
      
      filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
          <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
          <div class="task-content">
            <p class="task-text">${this.escapeHtml(task.text)}</p>
            <div class="task-meta">
              <span class="task-priority priority-${task.priority}">
                ${this.getPriorityLabel(task.priority)}
              </span>
              <span>${this.formatDate(task.createdAt)}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="action-btn edit-btn" title="Редактировать">✏️</button>
            <button class="action-btn delete-btn" title="Удалить">🗑️</button>
          </div>
        `;
        
        fragment.appendChild(taskElement);
      });
      
      this.elements.tasksContainer.appendChild(fragment);
    }
    
    this.updateStats();
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    this.elements.totalTasks.textContent = `Всего: ${total}`;
    this.elements.completedTasks.textContent = `Выполнено: ${completed}`;
    this.elements.pendingTasks.textContent = `Осталось: ${pending}`;
    
    // Обновление статистики в футере
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.elements.footerStats.innerHTML = `
      <div class="stat-item">Прогресс: ${completionRate}%</div>
      <div class="stat-item">Выполнено: ${completed}/${total}</div>
    `;
  }

  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: var(--border-radius);
      background: ${this.getNotificationColor(type)};
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  getNotificationColor(type) {
    const style = getComputedStyle(this);
    switch (type) {
      case 'success': return style.getPropertyValue('--success-color');
      case 'warning': return style.getPropertyValue('--warning-color');
      case 'danger': return style.getPropertyValue('--danger-color');
      default: return style.getPropertyValue('--primary-color');
    }
  }

  getEmptyStateMessage() {
    switch (this.currentFilter) {
      case 'active': return 'Нет активных задач. Отличная работа!';
      case 'completed': return 'Вы еще не выполнили ни одной задачи';
      default: return 'Добавьте свою первую задачу выше';
    }
  }

  getPriorityLabel(priority) {
    const labels = {
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    };
    return labels[priority] || 'Обычный';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem('task-list-data');
      if (saved) {
        const data = JSON.parse(saved);
        return data.tasks || [];
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
    return [];
  }

  saveTasks() {
    try {
      const data = {
        tasks: this.tasks,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('task-list-data', JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения задач:', error);
    }
  }

  // Методы для тестирования
  benchmarkPerformance(action, iterations = 1000) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      action();
    }
    
    const end = performance.now();
    return end - start;
  }

  addTestTasks(count = 100) {
    const startTime = performance.now();
    
    for (let i = 0; i < count; i++) {
      const task = {
        id: this.taskIdCounter++,
        text: `Тестовая задача ${i + 1}`,
        completed: Math.random() > 0.5,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.tasks.push(task);
    }
    
    this.saveTasks();
    this.renderTasks();
    
    const endTime = performance.now();
    this.showNotification(`Добавлено ${count} задач за ${(endTime - startTime).toFixed(2)}ms`, 'success');
  }

  clearAllTasks() {
    if (confirm('Удалить все задачи?')) {
      this.tasks = [];
      this.taskIdCounter = 1;
      this.saveTasks();
      this.renderTasks();
      this.showNotification('Все задачи удалены', 'danger');
    }
  }
}

customElements.define('task-list', TaskList);

// Добавляем глобальные стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyles);