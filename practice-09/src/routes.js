import { Router } from 'express';
import { ApiError } from './errors.js';
import { parsePositiveId, parseFilters } from './validation.js';

export function createRouter(store) {
  const router = Router({ caseSensitive: true });
  
  // Health
  router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));
  
  // Categories
  router.get('/categories', (req, res) => {
    const categories = store.listCategories();
    res.json({ data: categories, meta: { total: categories.length } });
  });
  
  // Tasks (list with filters)
  router.get('/tasks', (req, res) => {
    const url = new URL(req.originalUrl, 'http://localhost');
    const filters = parseFilters(url.searchParams);
    const data = store.listTasks(filters);
    res.json({ data, meta: { total: data.length, filters } });
  });
  
  // Task by ID
  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) {
      throw new ApiError(400, 'INVALID_ID', 'Некорректный id задачи.');
    }
    
    const task = store.getTask(id);
    if (task === null) {
      throw new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.', { id });
    }
    
    res.json({ data: task });
  });
  
  // 405 Method Not Allowed для известных путей
  const knownPaths = ['/health', '/categories', '/tasks', '/tasks/:id'];
  for (const path of knownPaths) {
    router.all(path, (req, res, next) => {
      res.set('Allow', 'GET, HEAD, OPTIONS');
      next(new ApiError(405, 'METHOD_NOT_ALLOWED', 'Метод не поддерживается.'));
    });
  }
  
  return router;
}