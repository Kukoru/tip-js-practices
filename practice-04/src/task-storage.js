export const STORAGE_VERSION = 1;

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object") return false;
    if (!Number.isSafeInteger(task.id) || task.id <= 0 || ids.has(task.id)) return false;
    if (typeof task.title !== "string" || task.title.trim().length === 0 || task.title.length > 100) return false;
    if (typeof task.completed !== "boolean") return false;
    if (!["low", "medium", "high"].includes(task.priority)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = fallbackTasks.map((t) => ({ ...t }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallbackCopy };
    }
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION || !isValidTaskList(parsed.tasks)) {
      return { ok: false, source: "fallback", tasks: fallbackCopy, error: "Некорректная схема данных в хранилище" };
    }
    return { ok: true, source: "storage", tasks: parsed.tasks.map((t) => ({ ...t })) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: fallbackCopy, error: error.message };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Попытка сохранить некорректный список задач" };
  }
  try {
    const payload = JSON.stringify({ version: STORAGE_VERSION, tasks });
    storage.setItem(key, payload);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}