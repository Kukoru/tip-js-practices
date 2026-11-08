"use strict";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;
  let title;

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

// === ДВА ВЫЗОВА ДЛЯ ПРОВЕРКИ ===
console.log("--- Вызов 1 (с пробелами) ---");
console.log(validateTaskDraft({ id: "20", title: " Изучить localStorage ", priority: "high" }, []));

console.log("\n--- Вызов 2 (пустая строка) ---");
console.log(validateTaskDraft({ id: "20", title: " ", priority: "high" }, []));