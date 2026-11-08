import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен содержать метод requestJson");
  }

  function validateFilters(filters = {}) {
    const valid = {};
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("Фильтры должны быть объектом");
    }
    for (const key of Object.keys(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Неизвестный фильтр: ${key}`);
      }
    }
    if (filters.completed !== undefined) {
      if (typeof filters.completed !== "boolean") throw new TypeError("completed должен быть boolean");
      valid.completed = filters.completed;
    }
    if (filters.priority !== undefined) {
      if (!ALLOWED_PRIORITIES.has(filters.priority)) throw new TypeError("Неверный priority");
      valid.priority = filters.priority;
    }
    if (filters.categoryId !== undefined) {
      if (!isPositiveSafeInteger(filters.categoryId)) throw new TypeError("categoryId должен быть положительным целым");
      valid.categoryId = filters.categoryId;
    }
    if (filters.q !== undefined) {
      if (typeof filters.q !== "string" || filters.q.trim().length > 100) throw new TypeError("Неверный q");
      valid.q = filters.q.trim();
    }
    return valid;
  }

  return {
    async getTasks(filters = {}) {
      const query = validateFilters(filters);
      const res = await client.requestJson("/tasks", { query });
      if (!res || !Array.isArray(res.data) || !res.meta) {
        throw invalidResponse("Неверный формат ответа");
      }
      for (const t of res.data) {
        if (!isTask(t)) throw invalidResponse("Неверная схема задачи");
      }
      const ids = res.data.map(t => t.id);
      if (new Set(ids).size !== ids.length) {
        throw invalidResponse("Дублирующиеся id");
      }
      if (res.meta.total !== res.data.length) {
        throw invalidResponse("Неверный meta.total");
      }
      return { tasks: res.data, meta: res.meta };
    },

    async getTaskById(id) {
      if (!isPositiveSafeInteger(id)) {
        throw new TypeError("Неверный id");
      }
      const res = await client.requestJson(`/tasks/${id}`);
      if (!res || !isTask(res.data)) {
        throw invalidResponse("Неверная схема задачи");
      }
      return res.data;
    },

    async getCategories() {
      const res = await client.requestJson("/categories");
      if (!res || !Array.isArray(res.data) || !res.meta) {
        throw invalidResponse("Неверный формат ответа");
      }
      for (const c of res.data) {
        if (!isCategory(c)) throw invalidResponse("Неверная схема категории");
      }
      if (res.meta.total !== res.data.length) {
        throw invalidResponse("Неверный meta.total");
      }
      return res.data;
    },

    async loadInitialData(filters = {}) {
      const [taskResult, categories] = await Promise.all([
        this.getTasks(filters),
        this.getCategories()
      ]);
      return { tasks: taskResult.tasks, categories, meta: taskResult.meta };
    },

    // --- ДОПОЛНИТЕЛЬНОЕ ЗАДАНИЕ: Вариант А (Promise.allSettled) ---
    async loadInitialDataSettled(filters = {}) {
      const [tasksResult, categoriesResult] = await Promise.allSettled([
        this.getTasks(filters),
        this.getCategories()
      ]);

      return {
        tasks: tasksResult.status === "fulfilled" ? tasksResult.value.tasks : [],
        categories: categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
        meta: tasksResult.status === "fulfilled" ? tasksResult.value.meta : null,
        tasksError: tasksResult.status === "rejected" ? tasksResult.reason : null,
        categoriesError: categoriesResult.status === "rejected" ? categoriesResult.reason : null
      };
    }
    // ----------------------------------------------------------------
  };
}