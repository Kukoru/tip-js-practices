import { ApiError } from './errors.js';

// raw: строка; результат: безопасное положительное целое либо null.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string') return null;
  if (!/^[1-9]\d*$/.test(raw)) return null;
  
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) return null;
  
  return value;
}

// URLSearchParams -> { completed: boolean|null, priority: string|null,
// categoryId: number|null, q: string }. Ошибка: ApiError(400, 'INVALID_QUERY', ...).
export function parseFilters(searchParams) {
  const allowed = new Set(['completed', 'priority', 'categoryId', 'q']);
  const filters = { completed: null, priority: null, categoryId: null, q: '' };
  
  // 1. Проверка имён и дубликатов
  for (const key of searchParams.keys()) {
    if (!allowed.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Неизвестный параметр: ${key}`);
    }
  }
  
  for (const key of allowed) {
    if (searchParams.getAll(key).length > 1) {
      throw new ApiError(400, 'INVALID_QUERY', `Параметр ${key} нельзя повторять`);
    }
  }
  
  // 2. Проверка completed
  const rawCompleted = searchParams.get('completed');
  if (rawCompleted !== null) {
    if (rawCompleted !== 'true' && rawCompleted !== 'false') {
      throw new ApiError(400, 'INVALID_QUERY', 'completed должен быть true или false');
    }
    filters.completed = rawCompleted === 'true';
  }
  
  // 3. Проверка priority
  const rawPriority = searchParams.get('priority');
  if (rawPriority !== null) {
    if (!['low', 'medium', 'high'].includes(rawPriority)) {
      throw new ApiError(400, 'INVALID_QUERY', 'priority должен быть low, medium или high');
    }
    filters.priority = rawPriority;
  }
  
  // 4. Проверка categoryId
  const rawCategoryId = searchParams.get('categoryId');
  if (rawCategoryId !== null) {
    const id = parsePositiveId(rawCategoryId);
    if (id === null) {
      throw new ApiError(400, 'INVALID_QUERY', 'categoryId должен быть положительным целым числом');
    }
    filters.categoryId = id;
  }
  
  // 5. Проверка q
  const rawQ = searchParams.get('q');
  if (rawQ !== null) {
    const q = rawQ.trim();
    if (q.length > 100) {
      throw new ApiError(400, 'INVALID_QUERY', 'q не должен быть длиннее 100 символов');
    }
    filters.q = q;
  }
  
  return filters;
}