"use strict";

// ===== ВХОДНЫЕ ДАННЫЕ (строки) =====
const totalTasksRaw = "12";
const completedTasksRaw = "5";

// ===== ПРОВЕРКА 1: должны быть именно строки =====
if (typeof totalTasksRaw !== "string" || typeof completedTasksRaw !== "string") {
    console.log("Ошибка: входные данные должны быть строками.");
}
else {
    // ===== УБИРАЕМ ПРОБЕЛЫ ПО КРАЯМ =====
    const totalTrimmed = totalTasksRaw.trim();
    const completedTrimmed = completedTasksRaw.trim();

    // ===== ПРОВЕРКА 2: пустой ввод =====
    if (totalTrimmed === "" || completedTrimmed === "") {
        console.log("Ошибка: пустая строка недопустима.");
    }
    else {
        // ===== ПРЕОБРАЗУЕМ В ЧИСЛА =====
        const totalTasks = Number(totalTrimmed);
        const completedTasks = Number(completedTrimmed);

        // ===== ПРОВЕРКА 3: типы и целочисленность =====
        if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
            console.log("Ошибка: недопустимое числовое значение.");
        }
        else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
            console.log("Ошибка: количество задач должно быть целым числом.");
        }
        // ===== ПРОВЕРКА 4: границы =====
        else if (totalTasks < 0 || totalTasks > 1000 || completedTasks < 0 || completedTasks > totalTasks) {
            console.log("Ошибка: недопустимое количество задач.");
        }
        // ===== СЛУЧАЙ 5: задач нет =====
        else if (totalTasks === 0 && completedTasks === 0) {
            console.log("Задач пока нет");
        }
        // ===== ОСНОВНОЙ РАСЧЁТ =====
        else {
            const remainingTasks = totalTasks - completedTasks;
            const percentage = (completedTasks / totalTasks) * 100;

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
    }
}