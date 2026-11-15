import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';
import { selectTasks, getTaskStats, addTask, updateTask, toggleTask, removeTask } from './domain/task-service.js';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  
  // 1. ДОБАВЛЕНО: Состояние для уведомлений
  const [notification, setNotification] = useState(null);

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = editingId ? tasks.find(t => t.id === editingId) : null;

  const handleSave = (value) => {
    if (editingId) {
      if (!tasks.some(t => t.id === editingId)) return false;
      setTasks(prev => updateTask(prev, editingId, value));
      setEditingId(null);
      // 2. ДОБАВЛЕНО: Уведомление при редактировании
      setNotification({ text: "Задача успешно обновлена!", type: "success" });
      return true;
    } else {
      const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0);
      setTasks(prev => addTask(prev, value, maxId + 1));
      // 2. ДОБАВЛЕНО: Уведомление при создании
      setNotification({ text: "Задача успешно создана!", type: "success" });
      return true;
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Удалить задачу?")) {
      setTasks(prev => removeTask(prev, id));
      if (editingId === id) setEditingId(null);
      // 3. ДОБАВЛЕНО: Уведомление при удалении
      setNotification({ text: "Задача удалена.", type: "success" });
    }
  };

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>ПР7: данные в памяти. Обновление страницы восстанавливает исходный набор.</p>
      
      {/* 4. ДОБАВЛЕНО: Блок вывода уведомления */}
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          {notification.text}
          <button type="button" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      <TaskStats stats={stats} />
      
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      
      <TaskList 
        tasks={visibleTasks} 
        categories={categories}
        onToggle={(id) => setTasks(prev => toggleTask(prev, id))}
        onEdit={setEditingId}
        onDelete={handleDelete}
      />
      
      <TaskForm 
        key={editingId ?? "new"}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
      />
    </main>
  );
}