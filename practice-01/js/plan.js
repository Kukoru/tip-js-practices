"use strict";

// ===== ВХОДНЫЕ ДАННЫЕ (ваш вариант) =====
const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

// ===== ПРОВЕРКА 1: типы и целочисленность =====
if (typeof totalTasks !== "number" || typeof completedTasks !== "number" || typeof dailyLimit !== "number") {
    console.log("Ошибка: все значения должны быть числами.");
}
else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks) || !Number.isInteger(dailyLimit)) {
    console.log("Ошибка: все значения должны быть целыми числами.");
}
// ===== ПРОВЕРКА 2: границы =====
else if (totalTasks < 0 || totalTasks > 1000 || completedTasks < 0 || completedTasks > totalTasks) {
    console.log("Ошибка: недопустимое количество задач.");
}
else if (dailyLimit < 1 || dailyLimit > 1000) {
    console.log("Ошибка: недопустимая дневная норма.");
}
// ===== СЛУЧАЙ 3: задач нет или всё выполнено =====
else if (totalTasks === 0 || completedTasks === totalTasks) {
    console.log("Все задачи уже выполнены.");
    console.log("Потребуется дней: 0");
}
// ===== ОСНОВНОЙ РАСЧЁТ С ЦИКЛОМ =====
else {
    let remaining = totalTasks - completedTasks;
    let day = 0;

    console.log(`Осталось задач: ${remaining}`);

    while (remaining > 0) {
        day += 1;
        const doneToday = Math.min(dailyLimit, remaining);
        remaining -= doneToday;
        console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
    }

    console.log(`Потребуется дней: ${day}`);
}