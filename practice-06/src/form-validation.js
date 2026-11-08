const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const errors = {};
  let title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) errors.title = "Название от 1 до 100 символов";
  if (!ALLOWED_PRIORITIES.has(draft.priority)) errors.priority = "Неверный приоритет";
  
  const catId = Number(draft.categoryId);
  if (!categories.some(c => c.id === catId)) errors.categoryId = "Выберите категорию";

  if (Object.keys(errors).length > 0) return { valid: false, errors, value: null };
  return { valid: true, value: { title, priority: draft.priority, categoryId: catId }, errors: {} };
}