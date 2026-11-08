import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя.";
  if (error.kind === "network") return "Нет соединения с учебным API.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере.";
  if (error.kind === "http") return error.message || `Ошибка сервера ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  // Строгая проверка зависимостей, чтобы проходил тест 23
  if (
    !api || 
    !view || 
    typeof api.loadInitialData !== "function" || 
    typeof view.setListState !== "function"
  ) {
    throw new TypeError("Нужны корректные объекты api и view");
  }

  let tasks = [], categories = [], filters = {}, editingId = null;
  let abortCtrl = null, seq = 0;

  async function load(mode = "load") {
    if (mode === "load") view.setListState("loading");
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const mySeq = ++seq;
    
    try {
      let result;
      if (mode === "load" || categories.length === 0) {
        result = await api.loadInitialData(filters, { signal: abortCtrl.signal });
        categories = result.categories;
        view.setCategories(categories);
      } else {
        result = await api.getTasks(filters, { signal: abortCtrl.signal });
      }
      
      if (mySeq !== seq) return;
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (mySeq !== seq || error.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    }
  }

  async function mutate(fn, successMsg) {
    view.setMutationPending(true);
    try {
      await fn();
      view.notify(successMsg, "success");
      await load("refresh");
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  return {
    async start(initFilters) {
      filters = { ...initFilters };
      await load("load");
    },
    async applyFilters(newFilters) {
      filters = { ...newFilters };
      await load("refresh");
    },
    async refresh() { await load("load"); },
    async submit(draft) {
      const val = validateDraft(draft, categories);
      if (!val.valid) { view.showFormErrors(val.errors); return; }
      view.showFormErrors({});
      
      if (editingId) {
        await mutate(() => api.updateTask(editingId, val.value), "Задача обновлена.");
        editingId = null; view.setFormTask(null);
      } else {
        await mutate(() => api.createTask(val.value), "Задача создана.");
        view.setFormTask(null);
      }
    },
    beginEdit(id) {
      const t = tasks.find(x => x.id === id);
      if (t) { editingId = id; view.setFormTask(t); view.showFormErrors({}); }
    },
    cancelEdit() { editingId = null; view.setFormTask(null); view.showFormErrors({}); },
    async toggleTask(id) {
      const t = tasks.find(x => x.id === id);
      if (t) await mutate(() => api.setTaskCompleted(id, !t.completed), "Статус изменен.");
    },
    async deleteTask(id) {
      await mutate(() => api.deleteTask(id), "Задача удалена.");
      if (editingId === id) this.cancelEdit();
    },
    async resetData() {
      await mutate(() => api.resetDemoData(), "Данные восстановлены.");
    },
    destroy() { if (abortCtrl) abortCtrl.abort(); }
  };
}