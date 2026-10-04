"use strict";

/**
 * Поиск задач по части названия (без учёта регистра).
 * @param {Array} tasks — корректный массив задач модели ПР2.
 * @param {string} query — строка запроса.
 * @returns {Array} — новый массив подходящих задач (порядок сохраняется).
 */
export function searchTasks(tasks, query) {
  const normalizedQuery = String(query).trim().toLowerCase();

  // Пустой запрос — вернуть все задачи (новый массив)
  if (normalizedQuery === "") {
    return [...tasks];
  }

  return tasks.filter((task) =>
    task.title.toLowerCase().includes(normalizedQuery)
  );
}