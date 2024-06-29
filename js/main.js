document.addEventListener('DOMContentLoaded', () => {
  const taskListsContainer = document.getElementById('task-lists');
  const createTaskListButton = document.getElementById('create-task-list');
  const searchTaskInput = document.getElementById('search-task');
  const filterStatus = document.getElementById('filter-status');
  const filterDeadline = document.getElementById('filter-deadline');

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
      const taskPriority = taskList.querySelector('.task-priority');
      const activeTasksContainer = taskList.querySelector('.active-tasks');
      const completedTasksContainer = taskList.querySelector('.completed-tasks');
      const deleteListButton = taskList.querySelector('.delete-list-btn');
      const randomizeTasksButton = taskList.querySelector('.randomize-tasks-btn');

      addTaskButton.addEventListener('click', () => {
          const taskText = newTaskInput.value.trim();
          const taskDeadline = newTaskDeadline.value;
          const priority = taskPriority.value;
          if (taskText !== '') {
              addTask(taskText, taskDeadline, activeTasksContainer, completedTasksContainer, priority === 'high', listData);
              newTaskInput.value = '';
              newTaskDeadline.value = '';
          }
      });

      newTaskInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              addTaskButton.click();
          }
      });

      deleteListButton.addEventListener('click', () => {
          taskList.remove();
      });

      randomizeTasksButton.addEventListener('click', () => {
          randomizeTasks(activeTasksContainer);
      });

      listData.tasks.forEach(task => {
          addTask(task.text, task.deadline, activeTasksContainer, completedTasksContainer, task.isPriority, listData, task.isCompleted, task.time);
      });

      taskListsContainer.appendChild(taskList);
  }

  createTaskListButton.addEventListener('click', () => {
      createTaskList();
  });

  function addTask(taskText, taskDeadline, activeTasksContainer, completedTasksContainer, isPriority = false, listData, isCompleted = false, time = new Date().toLocaleString()) {
      const task = document.createElement('div');
      task.classList.add(isCompleted ? 'completed-task' : 'task');
      task.innerHTML = `
          <div class="text">${taskText}</div>
          <div class="task-time">${time}</div>
          <div class="task-deadline">${taskDeadline ? `Дедлайн: ${taskDeadline}` : ''}</div>
          <div class="task-priority">${isPriority ? 'Высокий приоритет' : 'Обычная задача'}</div>
          <div class="actions">
              <button class="complete-btn">${isCompleted ? 'Отменить' : 'Выполнено'}</button>
              <button class="delete-btn">Удалить</button>
          </div>
      `;

      if (taskDeadline) {
          updateTaskColor(task, taskDeadline);
      }

      const completeBtn = task.querySelector('.complete-btn');
      const deleteBtn = task.querySelector('.delete-btn');

      completeBtn.addEventListener('click', () => {
          toggleTaskCompletion(task, activeTasksContainer, completedTasksContainer, listData);
      });

      deleteBtn.addEventListener('click', () => {
          task.remove();
      });

      const taskPrioritySelect = task.querySelector('.task-priority');
      taskPrioritySelect.addEventListener('change', () => {
          const newPriority = taskPrioritySelect.value === 'high';
          changeTaskPriority(task, activeTasksContainer, isCompleted, newPriority);
      });

      if (isCompleted) {
          completedTasksContainer.appendChild(task);
      } else {
          if (isPriority) {
              activeTasksContainer.prepend(task);
          } else {
              activeTasksContainer.appendChild(task);
          }
      }

      saveToLocalStorage();
  }

  function toggleTaskCompletion(task, activeTasksContainer, completedTasksContainer, listData) {
      const isCompleted = task.classList.contains('task');
      if (isCompleted) {
          activeTasksContainer.removeChild(task);
          task.classList.remove('task');
          task.classList.add('completed-task');
          completedTasksContainer.appendChild(task);
          task.querySelector('.complete-btn').textContent = 'Отменить';
      } else {
          completedTasksContainer.removeChild(task);
          task.classList.remove('completed-task');
          task.classList.add('task');
          activeTasksContainer.appendChild(task);
          task.querySelector('.complete-btn').textContent = 'Выполнено';
      }

      saveToLocalStorage();
  }

  function randomizeTasks(tasksContainer) {
      const tasks = Array.from(tasksContainer.children);
      for (let i = tasks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          tasksContainer.appendChild(tasks[j]);
      }
  }

  function changeTaskPriority(task, activeTasksContainer, isCompleted, newPriority) {
      const taskList = task.parentNode;
      task.remove();
      addTask(task.querySelector('.text').textContent, task.querySelector('.task-deadline').textContent.replace('Дедлайн: ', ''), activeTasksContainer, isCompleted ? taskList.querySelector('.completed-tasks') : taskList.querySelector('.active-tasks'), newPriority);
  }

  function updateTaskColor(task, taskDeadline) {
      if (!taskDeadline) return;
      const deadlineDate = new Date(taskDeadline);
      const currentDate = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      if (deadlineDate - currentDate < oneDay && deadlineDate - currentDate > 0) {
          task.classList.add('deadline-soon');
      } else if (deadlineDate - currentDate <= 0) {
          task.classList.add('deadline-passed');
      }
  }

  function filterTasks() {
      const searchText = searchTaskInput.value.trim().toLowerCase();
      const status = filterStatus.value;
      const deadline = filterDeadline.value;

      document.querySelectorAll('.task, .completed-task').forEach(task => {
          const taskText = task.querySelector('.text').textContent.toLowerCase();
          const taskStatus = task.classList.contains('completed-task') ? 'completed' : 'active';
          const taskDeadline = task.querySelector('.task-deadline').textContent.replace('Дедлайн: ', '');

          let display = true;

          if (searchText && !taskText.includes(searchText)) {
              display = false;
          }

          if (status !== 'all' && status !== taskStatus) {
              display = false;
          }

          if (deadline && taskDeadline && taskDeadline !== deadline) {
              display = false;
          }

          task.style.display = display ? '' : 'none';
      });
  }

  function saveToLocalStorage() {
      const taskLists = Array.from(document.querySelectorAll('.task-list')).map(taskList => {
          const tasks = Array.from(taskList.querySelectorAll('.task, .completed-task')).map(task => {
              const isCompleted = task.classList.contains('completed-task');
              return {
                  text: task.querySelector('.text').textContent,
                  deadline: task.querySelector('.task-deadline').textContent.replace('Дедлайн: ', '') || null,
                  isPriority: task.classList.contains('task') && task.previousElementSibling && task.previousElementSibling.classList.contains('task-priority') && task.previousElementSibling.value === 'high',
                  isCompleted,
                  time: task.querySelector('.task-time').textContent
              };
          });
          return { tasks };
      });
      localStorage.setItem('taskLists', JSON.stringify(taskLists));
  }

  searchTaskInput.addEventListener('input', filterTasks);
  filterStatus.addEventListener('change', filterTasks);
  filterDeadline.addEventListener('input', filterTasks);
});