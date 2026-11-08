// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Вариант 1: Подготовка учебного проекта, K=0 (ничего не выполнено)
export const variantNumber = 1;
export const variantTasks = [
  { id: 11, title: "Собрать требования проекта", completed: false, priority: "low" },
  { id: 23, title: "Составить план работ", completed: false, priority: "medium" },
  { id: 37, title: "Подготовить черновик структуры", completed: false, priority: "high" },
  { id: 41, title: "Согласовать этапы", completed: false, priority: "medium" },
  { id: 58, title: "Настроить окружение", completed: false, priority: "low" },
  { id: 64, title: "Проверить готовность", completed: false, priority: "high" },
];