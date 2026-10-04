"use strict";

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (внутренние) =====

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return null;
  return trimmed;
}

const VALID_PRIORITIES = ["low", "medium", "high"];

// ===== ЗАДАНИЕ 2: СОЗДАНИЕ ЗАДАЧИ =====

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом" };
  }

  const normalizedTitle = normalizeTitle(title);
  if (normalizedTitle === null) {
    return { ok: false, error: "title должен быть строкой длиной от 1 до 100" };
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return { ok: false, error: "priority должен быть low, medium или high" };
  }

  return {
    ok: true,
    task: {
      id,
      title: normalizedTitle,
      completed: false,
      priority,
    },
  };
}

// ===== ЗАДАНИЕ 3: ЧТЕНИЕ СПИСКА =====

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

// ===== ЗАДАНИЕ 4: ИЗМЕНЕНИЕ ДАННЫХ =====

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) return created;

  if (tasks.some((task) => task.id === id)) {
    return { ok: false, error: "Задача с таким id уже существует" };
  }

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть true или false" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const newTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );

  return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом" };
  }

  const normalizedTitle = normalizeTitle(title);
  if (normalizedTitle === null) {
    return { ok: false, error: "title должен быть строкой длиной от 1 до 100" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const newTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: normalizedTitle } : task
  );

  return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const newTasks = tasks.filter((task) => task.id !== id);

  return { ok: true, tasks: newTasks };
}