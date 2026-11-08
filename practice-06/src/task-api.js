import { ApiError } from "./api-client.js";
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(msg) { return new ApiError(msg, { kind: "invalid-response" }); }
function isPosInt(v) { return Number.isSafeInteger(v) && v > 0; }
export function isTask(v) { return Boolean(v && typeof v === "object" && isPosInt(v.id) && typeof v.title === "string" && v.title.trim().length >= 1 && v.title.trim().length <= 100 && typeof v.completed === "boolean" && ALLOWED_PRIORITIES.has(v.priority) && isPosInt(v.categoryId)); }
export function isCategory(v) { return Boolean(v && typeof v === "object" && isPosInt(v.id) && typeof v.name === "string" && v.name.trim().length >= 1 && v.name.trim().length <= 100); }

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") throw new TypeError("Клиент должен содержать requestJson");

  function validateFilters(f = {}) {
    const valid = {};
    if (f === null || typeof f !== "object" || Array.isArray(f)) throw new TypeError("Фильтры должны быть объектом");
    for (const k of Object.keys(f)) if (!ALLOWED_FILTERS.has(k)) throw new TypeError(`Неизвестный фильтр: ${k}`);
    if (f.completed !== undefined) { if (typeof f.completed !== "boolean") throw new TypeError("boolean"); valid.completed = f.completed; }
    if (f.priority !== undefined) { if (!ALLOWED_PRIORITIES.has(f.priority)) throw new TypeError("priority"); valid.priority = f.priority; }
    if (f.categoryId !== undefined) { if (!isPosInt(f.categoryId)) throw new TypeError("categoryId"); valid.categoryId = f.categoryId; }
    if (f.q !== undefined) { if (typeof f.q !== "string" || f.q.trim().length > 100) throw new TypeError("q"); valid.q = f.q.trim(); }
    return valid;
  }

  return {
    async getTasks(filters = {}, { signal } = {}) {
      const res = await client.requestJson("/tasks", { query: validateFilters(filters), signal });
      if (!res || !Array.isArray(res.data) || !res.meta) throw invalidResponse("Формат");
      for (const t of res.data) if (!isTask(t)) throw invalidResponse("Схема задачи");
      if (new Set(res.data.map(t => t.id)).size !== res.data.length) throw invalidResponse("Дубли id");
      if (res.meta.total !== res.data.length) throw invalidResponse("meta.total");
      return { tasks: res.data, meta: res.meta };
    },
    async getTaskById(id, { signal } = {}) {
      if (!isPosInt(id)) throw new TypeError("id");
      const res = await client.requestJson(`/tasks/${id}`, { signal });
      if (!res || !isTask(res.data)) throw invalidResponse("Схема");
      return res.data;
    },
    async getCategories({ signal } = {}) {
      const res = await client.requestJson("/categories", { signal });
      if (!res || !Array.isArray(res.data) || !res.meta) throw invalidResponse("Формат");
      for (const c of res.data) if (!isCategory(c)) throw invalidResponse("Схема");
      if (res.meta.total !== res.data.length) throw invalidResponse("meta.total");
      return res.data;
    },
    async loadInitialData(filters = {}, { signal } = {}) {
      const [t, c] = await Promise.all([this.getTasks(filters, { signal }), this.getCategories({ signal })]);
      return { tasks: t.tasks, categories: c, meta: t.meta };
    },
    async createTask(draft, { signal } = {}) {
      const res = await client.requestJson("/tasks", { method: "POST", body: draft, signal });
      if (!res || !isTask(res.data)) throw invalidResponse("Схема");
      return res.data;
    },
    async updateTask(id, changes, { signal } = {}) {
      if (!isPosInt(id)) throw new TypeError("id");
      const res = await client.requestJson(`/tasks/${id}`, { method: "PATCH", body: changes, signal });
      if (!res || !isTask(res.data)) throw invalidResponse("Схема");
      return res.data;
    },
    async setTaskCompleted(id, completed, { signal } = {}) {
      return this.updateTask(id, { completed }, { signal });
    },
    async deleteTask(id, { signal } = {}) {
      if (!isPosInt(id)) throw new TypeError("id");
      const res = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
      if (res !== null) throw invalidResponse("Ожидался null");
      return null;
    },
    async resetDemoData({ signal } = {}) {
      const res = await client.requestJson("/debug/reset", { method: "POST", signal });
      if (!res?.data?.reset) throw invalidResponse("Схема reset");
      return res.data;
    }
  };
}