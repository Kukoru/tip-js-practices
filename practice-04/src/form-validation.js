const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;
  let title;

  // Валидация ID
  if (editingId === null) {
    if (typeof draft.id === "string" && draft.id.trim() === "") {
      errors.id = "Введите идентификатор";
    } else {
      id = Number(draft.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        errors.id = "ID должен быть положительным целым числом";
      } else if (tasks.some((t) => t.id === id)) {
        errors.id = "Задача с таким ID уже существует";
      }
    }
  } else {
    id = editingId;
    if (!tasks.some((t) => t.id === id)) {
      errors.id = "Редактируемая задача не найдена";
    }
  }

  // Валидация Title
  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    title = draft.title.trim();
    if (title.length === 0) {
      errors.title = "Название не может быть пустым";
    } else if (title.length > 100) {
      errors.title = "Название не должно превышать 100 символов";
    }
  }

  // Валидация Priority
  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Некорректный приоритет";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { id, title, priority: draft.priority },
  };
}