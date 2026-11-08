import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask, findTaskById, removeTask, setTaskCompleted, updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
  storageStatus: document.querySelector("#storage-status"),
  form: document.querySelector("#task-form"),
  formHeading: document.querySelector("#form-heading"),
  formMode: document.querySelector("#form-mode"),
  formMessage: document.querySelector("#form-message"),
  idInput: document.querySelector("#task-id"),
  titleInput: document.querySelector("#task-title"),
  priorityInput: document.querySelector("#task-priority"),
  submitButton: document.querySelector("#form-submit"),
  cancelButton: document.querySelector("#cancel-edit"),
  resetButton: document.querySelector("#reset-data"),
};

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";
const initialTasks = isVariant ? variantTasks : demoTasks;
const datasetName = isVariant ? "variant" : "demo";
const storageKey = isCheckRun ? `tip-js-practice-04:checks:${datasetName}` : `tip-js-practice-04:${datasetName}`;
const draftKey = `tip-js-practice-04:draft:${datasetName}`;

let loaded;
try {
  loaded = loadTasks(window.localStorage, storageKey, initialTasks);
} catch (error) {
  loaded = { ok: false, source: "fallback", tasks: initialTasks.map((task) => ({ ...task })), error: `Ошибка: ${error.message}` };
}
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

elements.datasetLabel.textContent = isVariant ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}` : "Общий контрольный набор";

if (loaded.source === "storage") {
  elements.storageStatus.textContent = "Данные восстановлены из localStorage.";
} else if (loaded.ok) {
  elements.storageStatus.textContent = "Используется исходный набор.";
} else {
  elements.storageStatus.textContent = loaded.error;
  elements.storageStatus.classList.add("is-warning");
}

function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  for (const btn of elements.filters.querySelectorAll("button[data-filter]")) {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive.toString());
  }
}

function clearFieldError(name) {
  const input = elements.form.elements.namedItem(name);
  const message = elements.form.querySelector(`[data-error-for="${name}"]`);
  if (input) { input.setCustomValidity(""); input.removeAttribute("aria-invalid"); }
  if (message) message.textContent = "";
}

function clearFormErrors() {
  for (const name of ["id", "title", "priority"]) clearFieldError(name);
  elements.formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [name, text] of Object.entries(errors)) {
    const input = elements.form.elements.namedItem(name);
    const message = elements.form.querySelector(`[data-error-for="${name}"]`);
    if (input) { input.setCustomValidity(text); input.setAttribute("aria-invalid", "true"); }
    if (message) message.textContent = text;
  }
  elements.form.reportValidity();
}

function setFormMode(id = null) {
  editingId = id;
  clearFormErrors();
  
  if (id === null) {
    elements.form.reset();
    elements.idInput.disabled = false;
    elements.formHeading.textContent = "Добавление задачи";
    elements.formMode.textContent = "Режим создания новой задачи.";
    elements.submitButton.textContent = "Добавить задачу";
    elements.cancelButton.hidden = true;

    // ВОССТАНОВЛЕНИЕ ЧЕРНОВИКА
    try {
      const draftRaw = localStorage.getItem(draftKey);
      if (draftRaw) {
        console.log("Черновик найден, восстанавливаем:", draftRaw);
        const draft = JSON.parse(draftRaw);
        if (draft.id !== undefined) elements.idInput.value = draft.id;
        if (draft.title !== undefined) elements.titleInput.value = draft.title;
        if (draft.priority !== undefined) elements.priorityInput.value = draft.priority;
      }
    } catch (e) { console.error("Ошибка при чтении черновика:", e); }

    elements.idInput.focus();
  } else {
    const task = findTaskById(currentTasks, id);
    if (!task) { elements.message.textContent = "Задача не найдена."; return; }
    elements.idInput.value = task.id;
    elements.titleInput.value = task.title;
    elements.priorityInput.value = task.priority;
    elements.idInput.disabled = true;
    elements.formHeading.textContent = "Редактирование задачи";
    elements.formMode.textContent = `Редактирование задачи ID ${task.id}.`;
    elements.submitButton.textContent = "Сохранить изменения";
    elements.cancelButton.hidden = false;
    elements.titleInput.focus();
  }
}

function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  elements.storageStatus.classList.toggle("is-warning", !saved.ok);
  elements.storageStatus.textContent = saved.ok ? "Изменения сохранены." : saved.error;
  elements.message.textContent = saved.ok ? successMessage : `${successMessage} ${saved.error}`;
  renderApp();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const draft = { id: formData.get("id") ?? "", title: formData.get("title") ?? "", priority: formData.get("priority") ?? "" };
  const validation = validateTaskDraft(draft, currentTasks, editingId);
  
  if (!validation.ok) { showFormErrors(validation.errors); return; }

  let result;
  if (editingId === null) {
    result = addTask(currentTasks, validation.value.id, validation.value.title, validation.value.priority);
  } else {
    result = updateTask(currentTasks, editingId, validation.value.title, validation.value.priority);
  }

  if (!result.ok) { showFormErrors({ id: result.error }); return; }

  localStorage.removeItem(draftKey); // Очищаем черновик после успешного добавления
  currentTasks = result.tasks;
  clearFormErrors();
  setFormMode(null);
  persistCurrentTasks(editingId === null ? "Задача добавлена." : "Задача обновлена.");
}

function handleTaskListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const li = button.closest("[data-task-id]");
  if (!li) return;
  const id = Number(li.dataset.taskId);
  const action = button.dataset.action;

  if (action === "edit") { setFormMode(id); return; }

  let result;
  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) return;
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else if (action === "delete") {
    result = removeTask(currentTasks, id);
    if (editingId === id) setFormMode(null);
  } else { return; }

  if (result.ok) {
    currentTasks = result.tasks;
    persistCurrentTasks(action === "toggle" ? "Статус изменён." : "Задача удалена.");
  } else { elements.message.textContent = result.error; }
}

function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  renderApp();
}

function handleResetClick() {
  removeSavedTasks(window.localStorage, storageKey);
  localStorage.removeItem(draftKey);
  elements.message.textContent = "Данные сброшены.";
  currentTasks = initialTasks.map((t) => ({ ...t }));
  currentFilter = "all";
  setFormMode(null);
  elements.storageStatus.textContent = "Используется исходный набор.";
  elements.storageStatus.classList.remove("is-warning");
  renderApp();
}

// ФУНКЦИЯ СОХРАНЕНИЯ ЧЕРНОВИКА
function saveDraft() {
  if (editingId === null) {
    const draft = {
      id: elements.idInput.value,
      title: elements.titleInput.value,
      priority: elements.priorityInput.value
    };
    if (!draft.id && !draft.title) {
      localStorage.removeItem(draftKey);
    } else {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      console.log("Черновик сохранен в localStorage:", draft); // ОТЛАДКА
    }
  }
}

elements.form.addEventListener("submit", handleFormSubmit);
elements.form.addEventListener("input", (event) => {
  console.log("Событие input сработало!"); // ОТЛАДКА
  if (event.target) clearFieldError(event.target.name);
  saveDraft();
});
elements.form.addEventListener("change", () => {
  console.log("Событие change сработало!"); // ОТЛАДКА
  saveDraft();
});

elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.cancelButton.addEventListener("click", () => setFormMode());
elements.resetButton.addEventListener("click", handleResetClick);

try { setFormMode(); renderApp(); } catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}