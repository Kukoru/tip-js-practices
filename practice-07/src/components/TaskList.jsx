import TaskItem from "./TaskItem";

export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <section aria-label="Список задач">
        <h2>Задачи</h2>
        <p>Нет задач по выбранным условиям.</p>
      </section>
    );
  }

  return (
    <section aria-label="Список задач">
      <h2>Задачи (найдено: {tasks.length})</h2>
      <ul>
        {tasks.map(task => {
          const category = categories.find(c => c.id === task.categoryId);
          return (
            <TaskItem 
              key={task.id} 
              task={task} 
              categoryName={category ? category.name : "Без категории"}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </ul>
    </section>
  );
}