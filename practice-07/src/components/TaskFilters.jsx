export default function TaskFilters({ filters, categories, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    onChange({ q: "", completed: "", priority: "", categoryId: "" });
  };

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <input 
        type="search" 
        placeholder="Поиск..." 
        value={filters.q} 
        onChange={(e) => handleChange("q", e.target.value)} 
      />
      
      <select value={filters.completed} onChange={(e) => handleChange("completed", e.target.value)}>
        <option value="">Все статусы</option>
        <option value="false">В работе</option>
        <option value="true">Выполненные</option>
      </select>

      <select value={filters.priority} onChange={(e) => handleChange("priority", e.target.value)}>
        <option value="">Все приоритеты</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>

      <select value={filters.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)}>
        <option value="">Все категории</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <button type="button" onClick={handleReset}>Сбросить фильтры</button>
    </section>
  );
}