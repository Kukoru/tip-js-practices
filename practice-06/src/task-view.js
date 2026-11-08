const PRIORITY_LABELS = Object.freeze({ low: "Низкий", medium: "Средний", high: "Высокий" });

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.dataset.taskId = String(task.id);
  if (task.completed) li.classList.add("is-completed");

  const title = document.createElement("h3"); title.className = "task-title"; title.textContent = task.title;
  const meta = document.createElement("div"); meta.className = "task-meta";
  
  const status = document.createElement("span"); status.className = "task-status"; status.textContent = task.completed ? "Выполнена" : "В работе";
  const priority = document.createElement("span"); priority.className = "task-priority"; priority.textContent = PRIORITY_LABELS[task.priority] || task.priority;
  const cat = document.createElement("span"); cat.className = "task-category"; cat.textContent = category ? category.name : "Без категории";
  
  meta.append(status, priority, cat);

  const actions = document.createElement("div"); actions.className = "task-actions";
  const makeBtn = (act, label) => {
    const b = document.createElement("button"); b.type = "button"; b.dataset.action = act;
    const s = document.createElement("span"); s.className = "action-label"; s.textContent = label;
    b.append(s); return b;
  };
  
  actions.append(makeBtn("toggle", "Выполнена"), makeBtn("edit", "Изменить"), makeBtn("delete", "Удалить"));
  li.append(title, meta, actions);
  return li;
}

export function renderTaskList(list, tasks, categories) {
  const catMap = new Map(categories.map(c => [c.id, c]));
  list.replaceChildren(...tasks.map(t => createTaskElement(t, catMap.get(t.categoryId))));
}