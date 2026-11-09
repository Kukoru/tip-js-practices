export function validateTaskDraft(draft, categories) {
  const errors = {};
  let title = typeof draft.title === "string" ? draft.title.trim() : "";

  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно быть от 1 до 100 символов";
  }

  const allowedPriorities = ["low", "medium", "high"];
  if (!allowedPriorities.includes(draft.priority)) {
    errors.priority = "Некорректный приоритет";
  }

  const categoryId = Number(draft.categoryId);
  if (!categories.some(c => c.id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors, value: null };
  }

  return {
    valid: true,
    value: { title, priority: draft.priority, categoryId },
    errors: {}
  };
}

export function selectTasks(tasks, filters) {
  return tasks.filter(task => {
    if (filters.q && !task.title.toLowerCase().includes(filters.q.trim().toLowerCase())) return false;
    if (filters.completed === "true" && !task.completed) return false;
    if (filters.completed === "false" && task.completed) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.categoryId && task.categoryId !== Number(filters.categoryId)) return false;
    return true;
  });
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  return { total, completed, active: total - completed };
}

export function addTask(tasks, value, id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID должен быть положительным целым числом");
  }
  if (tasks.some(t => t.id === id)) {
    throw new Error("Задача с таким ID уже существует");
  }

  const newTask = {
    id,
    title: value.title,
    completed: false,
    priority: value.priority,
    categoryId: value.categoryId
  };
  return [...tasks, newTask];
}

export function updateTask(tasks, id, value) {
  return tasks.map(task => {
    if (task.id === id) {
      return { ...task, title: value.title, priority: value.priority, categoryId: value.categoryId };
    }
    return task;
  });
}

export function toggleTask(tasks, id) {
  return tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}