import { useState } from "react";
import { validateTaskDraft } from "../domain/task-service";

export default function TaskForm({ categories, initialTask = null, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    title: initialTask ? initialTask.title : "",
    priority: initialTask ? initialTask.priority : "medium",
    categoryId: initialTask ? String(initialTask.categoryId) : String(categories[0]?.id || "")
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    
    const result = validateTaskDraft(draft, categories);
    
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    const success = onSave(result.value);
    if (success) {
      setDraft({ title: "", priority: "medium", categoryId: String(categories[0]?.id || "") });
      setErrors({});
    } else {
      setMessage("Не удалось сохранить задачу.");
    }
  };

  return (
    <section aria-label="Форма задачи">
      <h2>{initialTask ? "Редактирование" : "Добавление"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title">Название</label>
          <input 
            id="title" 
            value={draft.title} 
            onChange={(e) => handleChange("title", e.target.value)} 
            aria-invalid={!!errors.title}
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div>
          <label htmlFor="priority">Приоритет</label>
          <select id="priority" value={draft.priority} onChange={(e) => handleChange("priority", e.target.value)}>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div>
          <label htmlFor="category">Категория</label>
          <select id="category" value={draft.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="error">{errors.categoryId}</span>}
        </div>

        {message && <p className="error" role="alert">{message}</p>}

        <div className="actions">
          <button type="submit">Сохранить</button>
          {initialTask && <button type="button" onClick={onCancel}>Отмена</button>}
        </div>
      </form>
    </section>
  );
}