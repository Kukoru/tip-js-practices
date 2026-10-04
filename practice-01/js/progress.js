"use strict";

// ===== ВХОДНЫЕ ДАННЫЕ (ваш вариант) =====
const totalTasks = 12;
const completedTasks = 5;

// ===== ПРОВЕРКА 1: типы и целочисленность =====
if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
    console.log("Ошибка: количество задач должно быть числом.");
} 
else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
    console.log("Ошибка: количество задач должно быть целым числом.");
}
// ===== ПРОВЕРКА 2: границы (0...1000, completed <= total) =====
else if (totalTasks < 0 || totalTasks > 1000 || completedTasks < 0 || completedTasks > totalTasks) {
    console.log("Ошибка: недопустимое количество задач.");
}
// ===== СЛУЧАЙ 3: задач нет вообще =====
else if (totalTasks === 0 && completedTasks === 0) {
    console.log("Задач пока нет");
}
// ===== ОСНОВНОЙ РАСЧЁТ =====
else {
    const remainingTasks = totalTasks - completedTasks;
    const percentage = (completedTasks / totalTasks) * 100;

    // Определяем статус по исходным количествам (не по проценту!)
    let status;
    if (completedTasks === 0) {
        status = "Не начато";
    } else if (completedTasks === totalTasks) {
        status = "Завершено";
    } else {
        status = "В работе";
    }

    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${remainingTasks}`);
    console.log(`Прогресс: ${percentage.toFixed(1)}%`);
    console.log(`Статус: ${status}`);
}