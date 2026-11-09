export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
  
  return (
    <li className={`task-card ${task.completed ? 'is-completed' : ''}`}>
      <h3>{task.title}</h3>
      <p>Статус: {task.completed ? "Выполнена" : "В работе"}</p>
      <p>Приоритет: {priorityLabels[task.priority]}</p>
      <p>Категория: {categoryName}</p>
      <div className="actions">
        <button type="button" onClick={() => onToggle(task.id)}>Переключить</button>
        <button type="button" onClick={() => onEdit(task.id)}>Редактировать</button>
        <button type="button" onClick={() => onDelete(task.id)}>Удалить</button>
      </div>
    </li>
  );
}