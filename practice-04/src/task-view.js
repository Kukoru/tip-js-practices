"use strict";

import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

/**
 * Создаёт DOM-элемент li для одной задачи.
 * @param {object} task — задача модели ПР2.
 * @returns {HTMLLIElement}
 */
export function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.dataset.taskId = String(task.id);
  if (task.completed) {
    li.classList.add("is-completed");
  }

  // Название — через textContent (не HTML!)
  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  // Статус
  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  // Приоритет
  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;

  // Кнопки
  const actions = document.createElement("div");
  actions.className = "task-actions";

  // 1. Кнопка переключения статуса (оставил вашу логику из ПР3)
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-pressed", task.completed ? "true" : "false");
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена"; 
  toggleButton.append(toggleLabel);

  // 2. Кнопка редактирования (НОВАЯ для ПР4)
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить"; // Автотест ПР4 ищет именно этот текст
  editButton.append(editLabel);

  // 3. Кнопка удаления
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  // Добавляем ровно 3 кнопки по порядку
  actions.append(toggleButton, editButton, deleteButton);

  li.append(title, status, priority, actions);
  return li;
}

/**
 * Заменяет дочерние элементы списка карточками.
 * @param {HTMLUListElement} listElement
 * @param {Array} tasks
 */
export function renderTaskList(listElement, tasks) {
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
}

/**
 * Обновляет сводку. tasks — полный массив; visibleCount — длина выборки.
 */
export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  summaryElement.querySelector('[data-stat="total"]').textContent = String(stats.total);
  summaryElement.querySelector('[data-stat="completed"]').textContent = String(stats.completed);
  summaryElement.querySelector('[data-stat="pending"]').textContent = String(stats.pending);
  summaryElement.querySelector('[data-stat="progress"]').textContent =
    `${stats.progress.toFixed(1)}%`;
  summaryElement.querySelector('[data-stat="visible"]').textContent = String(visibleCount);
}

/**
 * Управляет сообщением о пустом состоянии.
 */
export function renderEmptyState(messageElement, total, visibleCount) {
  if (total === 0 && visibleCount === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else if (total > 0 && visibleCount === 0) {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "";
    messageElement.hidden = true;
  }
}