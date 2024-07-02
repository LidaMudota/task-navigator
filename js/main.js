document.addEventListener('DOMContentLoaded', () => {
  const taskListsContainer = document.getElementById('task-lists');
  const createTaskListButton = document.getElementById('create-task-list'); // Исправлено здесь
  const searchTaskInput = document.getElementById('search-task');
  const filterStatus = document.getElementById('filter-status');
  const filterDeadline = document.getElementById('filter-deadline');
  const reminderAudio = new Audio('../music/5470_pod-zvonok.ru__.mp3');  // Аудиофайл напоминания о дедлайне

  function createTaskList(listData = { tasks: [] }) {
      const taskList = document.createElement('div');
      taskList.classList.add('task-list');
      taskList.innerHTML = `
          <div class="list-actions">
              <button class="randomize-tasks-btn">Рандом</button>
              <button class="delete-list-btn">Удалить список</button>
          </div>
          <h2>Список задач</h2>
          <div class="task-input">
              <input type="text" class="new-task-input" placeholder="Введите новую задачу">
              <input type="date" class="new-task-deadline" placeholder="Установить дедлайн">
              <select class="task-priority">
                  <option value="normal">Обычная</option>
                  <option value="high">Высокий приоритет</option>
              </select>
              <button class="add-task-btn">Добавить задачу</button>
          </div>
          <div class="tasks">
              <h3>Активные задачи</h3>
              <div class="active-tasks"></div>
              <h3>Выполненные задачи</h3>
              <div class="completed-tasks"></div>
          </div>
      `;

      const addTaskButton = taskList.querySelector('.add-task-btn');
      const newTaskInput = taskList.querySelector('.new-task-input');
      const newTaskDeadline = taskList.querySelector('.new-task-deadline');
      const newTaskPriority = taskList.querySelector('.task-priority');
      const activeTasksContainer = taskList.querySelector('.active-tasks');
      const completedTasksContainer = taskList.querySelector('.completed-tasks');
      const randomizeTasksButton = taskList.querySelector('.randomize-tasks-btn');
      const deleteListButton = taskList.querySelector('.delete-list-btn');

      function createTask(taskData) {
          const task = document.createElement('div');
          task.classList.add('task');
          if (taskData.completed) {
              task.classList.add('completed-task');
          }
          task.innerHTML = `
              <div class="text">${taskData.text}</div>
              <div class="task-time">${new Date().toLocaleTimeString()}</div>
              <div class="task-deadline">${taskData.deadline ? taskData.deadline : 'Без дедлайна'}</div>
              <div class="task-priority">${taskData.priority === 'high' ? 'Высокий приоритет' : 'Обычная'}</div>
              <div class="actions">
                  <button class="complete-task-btn">Завершить</button>
                  <button class="delete-task-btn">Удалить</button>
                  <button class="add-subtask-btn">Добавить подзадачу</button>
              </div>
              <div class="subtasks"></div>
          `;

          const completeTaskButton = task.querySelector('.complete-task-btn');
          const deleteTaskButton = task.querySelector('.delete-task-btn');
          const addSubtaskButton = task.querySelector('.add-subtask-btn');
          const subtasksContainer = task.querySelector('.subtasks');

          completeTaskButton.addEventListener('click', () => {
              taskData.completed = !taskData.completed;
              if (taskData.completed) {
                  completedTasksContainer.appendChild(task);
                  task.classList.add('completed-task');
              } else {
                  activeTasksContainer.appendChild(task);
                  task.classList.remove('completed-task');
              }
              saveTaskLists();
          });

          deleteTaskButton.addEventListener('click', () => {
              task.remove();
              saveTaskLists();
          });

          addSubtaskButton.addEventListener('click', () => {
              const subtask = createSubtask({ text: '', completed: false });
              subtasksContainer.appendChild(subtask);
          });

          if (taskData.subtasks) {
              taskData.subtasks.forEach(subtaskData => {
                  const subtask = createSubtask(subtaskData);
                  subtasksContainer.appendChild(subtask);
              });
          }

          return task;
      }

      function createSubtask(subtaskData) {
          const subtask = document.createElement('div');
          subtask.classList.add('subtask');
          subtask.innerHTML = `
              <input type="checkbox" ${subtaskData.completed ? 'checked' : ''}>
              <input type="text" value="${subtaskData.text}" placeholder="Введите подзадачу">
          `;

          const checkbox = subtask.querySelector('input[type="checkbox"]');
          const input = subtask.querySelector('input[type="text"]');

          checkbox.addEventListener('change', () => {
              subtaskData.completed = checkbox.checked;
              checkAllSubtasksComplete(subtask.closest('.task'));
              saveTaskLists();
          });

          input.addEventListener('input', () => {
              subtaskData.text = input.value;
              saveTaskLists();
          });

          return subtask;
      }

      function checkAllSubtasksComplete(task) {
          const subtasks = task.querySelectorAll('.subtask');
          const allCompleted = Array.from(subtasks).every(subtask => subtask.querySelector('input[type="checkbox"]').checked);
          const completeTaskButton = task.querySelector('.complete-task-btn');

          if (allCompleted) {
              completeTaskButton.click();
          }
      }

      addTaskButton.addEventListener('click', () => {
          const taskData = {
              text: newTaskInput.value,
              deadline: newTaskDeadline.value,
              priority: newTaskPriority.value,
              completed: false,
              subtasks: []
          };

          const task = createTask(taskData);
          activeTasksContainer.appendChild(task);
          newTaskInput.value = '';
          newTaskDeadline.value = '';
          newTaskPriority.value = 'normal';
          saveTaskLists();
      });

      randomizeTasksButton.addEventListener('click', () => {
          const tasks = Array.from(activeTasksContainer.children);
          for (let i = tasks.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              activeTasksContainer.appendChild(tasks[j]);
          }
          saveTaskLists();
      });

      deleteListButton.addEventListener('click', () => {
          taskList.remove();
          saveTaskLists();
      });

      taskListsContainer.appendChild(taskList);

      if (listData.tasks) {
          listData.tasks.forEach(taskData => {
              const task = createTask(taskData);
              if (taskData.completed) {
                  completedTasksContainer.appendChild(task);
              } else {
                  activeTasksContainer.appendChild(task);
              }
          });
      }
  }

  function saveTaskLists() {
      const taskLists = [];
      document.querySelectorAll('.task-list').forEach(taskList => {
          const tasks = [];
          taskList.querySelectorAll('.task').forEach(task => {
              const taskData = {
                  text: task.querySelector('.text').textContent,
                  completed: task.classList.contains('completed-task'),
                  deadline: task.querySelector('.task-deadline').textContent === 'Без дедлайна' ? '' : task.querySelector('.task-deadline').textContent,
                  priority: task.querySelector('.task-priority').textContent === 'Высокий приоритет' ? 'high' : 'normal',
                  subtasks: []
              };

              task.querySelectorAll('.subtask').forEach(subtask => {
                  const subtaskData = {
                      text: subtask.querySelector('input[type="text"]').value,
                      completed: subtask.querySelector('input[type="checkbox"]').checked
                  };
                  taskData.subtasks.push(subtaskData);
              });

              tasks.push(taskData);
          });
          taskLists.push({ tasks });
      });
      localStorage.setItem('taskLists', JSON.stringify(taskLists));
  }

  function loadTaskLists() {
      const taskLists = JSON.parse(localStorage.getItem('taskLists')) || [];
      taskLists.forEach(listData => createTaskList(listData));
  }

  function checkDeadlines() {
      const now = new Date();
      document.querySelectorAll('.task').forEach(task => {
          const deadlineText = task.querySelector('.task-deadline').textContent;
          if (deadlineText !== 'Без дедлайна') {
              const deadline = new Date(deadlineText);
              if (deadline <= now && !task.classList.contains('completed-task')) {
                  reminderAudio.play();
              }
          }
      });
  }

  createTaskListButton.addEventListener('click', () => createTaskList()); // Добавлено событие клика для кнопки создания списка

  searchTaskInput.addEventListener('input', () => {
      const searchText = searchTaskInput.value.toLowerCase();
      document.querySelectorAll('.task').forEach(task => {
          const taskText = task.querySelector('.text').textContent.toLowerCase();
          if (taskText.includes(searchText)) {
              task.style.display = 'block';
          } else {
              task.style.display = 'none';
          }
      });
  });

  filterStatus.addEventListener('change', () => {
      const filterValue = filterStatus.value;
      document.querySelectorAll('.task').forEach(task => {
          if (filterValue === 'all' ||
              (filterValue === 'active' && !task.classList.contains('completed-task')) ||
              (filterValue === 'completed' && task.classList.contains('completed-task'))) {
              task.style.display = 'block';
          } else {
              task.style.display = 'none';
          }
      });
  });

  filterDeadline.addEventListener('change', () => {
      const filterValue = filterDeadline.value;
      document.querySelectorAll('.task').forEach(task => {
          const taskDeadline = task.querySelector('.task-deadline').textContent;
          if (filterValue === '' || taskDeadline === 'Без дедлайна' || new Date(taskDeadline) <= new Date(filterValue)) {
              task.style.display = 'block';
          } else {
              task.style.display = 'none';
          }
      });
  });

  loadTaskLists();

  setInterval(checkDeadlines, 60000);  // Проверяем дедлайны каждую минуту
});

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const taskManager = document.querySelector('.task-manager');

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.classList.add('dark-mode');
            taskManager.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            taskManager.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    if (localStorage.getItem('theme') === 'dark') {
        themeSwitch.checked = true;
        document.body.classList.add('dark-mode');
        taskManager.classList.add('dark-mode');
    }
});