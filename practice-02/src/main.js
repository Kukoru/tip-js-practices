"use strict";

import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  if (total === 0) {
    console.log(`${label}: Задач пока нет`);
  } else {
    console.log(`${label}: всего ${total}; выполнено ${completed}; осталось ${pending}; прогресс ${progress.toFixed(1)}%`);
  }
}

// ===== ОБЩИЙ СЦЕНАРИЙ =====
console.log("===== ОБЩИЙ СЦЕНАРИЙ =====");

let currentTasks = demoTasks;

printStats("Исходный набор", currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные:", getPendingTasks(currentTasks).map((t) => t.id));

let result = addTask(currentTasks, 20, "Добавить проверку", "high");
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После добавления id 20", currentTasks);

result = setTaskCompleted(currentTasks, 4, true);
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После выполнения id 4", currentTasks);

result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После переименования id 10", currentTasks);

result = removeTask(currentTasks, 7);
if (result.ok) currentTasks = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После удаления id 7", currentTasks);

console.log("Итоговые id:", currentTasks.map((t) => t.id));

// Показать ошибку
console.log("\n--- Обработка ошибки ---");
const errResult = addTask(currentTasks, 20, "Дубликат");
if (!errResult.ok) console.error("Ошибка:", errResult.error);
console.log("Состояние не изменилось:", currentTasks.map((t) => t.id).join(", "));

// Проверка неизменности demoTasks
console.log("\ndemoTasks сохранился:", demoTasks.length === 4, "| id:", demoTasks.map((t) => t.id).join(", "));

// ===== ИНДИВИДУАЛЬНЫЙ ВАРИАНТ =====
console.log("\n===== ИНДИВИДУАЛЬНЫЙ ВАРИАНТ =====");
console.log("Номер варианта:", variantNumber);

let variantCurrent = variantTasks;
printStats("Исходные задачи варианта", variantCurrent);

result = addTask(variantCurrent, 80, "Подготовить финальную проверку", "high");
if (result.ok) variantCurrent = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После добавления id 80", variantCurrent);

result = setTaskCompleted(variantCurrent, 11, true);
if (result.ok) variantCurrent = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После выполнения id 11", variantCurrent);

result = renameTask(variantCurrent, 23, "Уточнить план работ");
if (result.ok) variantCurrent = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После переименования id 23", variantCurrent);

result = removeTask(variantCurrent, 37);
if (result.ok) variantCurrent = result.tasks;
else console.error("Ошибка:", result.error);
printStats("После удаления id 37", variantCurrent);

result = addTask(variantCurrent, 80, "Дубликат");
if (!result.ok) console.error("\nОшибка повторного добавления id 80:", result.error);
console.log("Итоговые id варианта:", variantCurrent.map((t) => t.id));
console.log("variantTasks сохранился:", variantTasks.length === 6);