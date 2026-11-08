import { createApiClient } from "./src/api-client.js";
import { createTaskApi } from "./src/task-api.js";

const client = createApiClient({ baseUrl: "http://127.0.0.1:5505/api" });
const api = createTaskApi(client);

try {
  const result = await api.getTasks({ completed: false, priority: "high" });
  console.log("id:", result.tasks.map(t => t.id));
  console.log("meta.total:", result.meta.total);
} catch (e) {
  console.error(e);
}