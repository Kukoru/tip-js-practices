import { useState, useEffect, useRef, useCallback } from 'react';

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);

  const abortControllerRef = useRef(null);
  const mutationInProgress = useRef(false);
  const isMountedRef = useRef(true);
  const requestSeq = useRef(0);

  // --- Функция загрузки данных (GET) ---
  const load = useCallback(async (currentFilters) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentSeq = ++requestSeq.current;
    
    setStatus('loading');
    setError(null);
    
    try {
      const result = await api.loadInitialData(currentFilters, { signal: controller.signal });
      if (currentSeq !== requestSeq.current || !isMountedRef.current) return;
      setSnapshot(result);
      setStatus('ready');
    } catch (err) {
      if (err.kind === 'aborted' || currentSeq !== requestSeq.current || !isMountedRef.current) return;
      setError(err);
      setStatus('error');
    }
  }, [api]);

  // Эффект для загрузки при смене фильтров
  useEffect(() => {
    isMountedRef.current = true;
    load(filters);
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [api, filters, load]);

  // Принудительное обновление
  const refresh = useCallback(() => {
    load(filters);
  }, [load, filters]);

  // --- Обёртка для мутаций (POST, PATCH, DELETE) ---
  const mutate = useCallback(async (fn) => {
    if (mutationInProgress.current) return false;
    mutationInProgress.current = true;
    setPending(true);
    setMutationError(null);
    
    const controller = new AbortController();
    try {
      await fn(controller.signal);
      await load(filters); // После успеха перезапрашиваем список
      return true;
    } catch (err) {
      if (err.kind === 'aborted') return false;
      setMutationError(err);
      return false;
    } finally {
      mutationInProgress.current = false;
      setPending(false);
    }
  }, [load, filters]);

  return {
    snapshot,
    status,
    error,
    mutationError,
    pending,
    refresh,
    saveTask: async (id, value) => {
      return mutate((signal) => {
        return id
          ? api.updateTask(id, value, { signal })
          : api.createTask(value, { signal });
      });
    },
    toggleTask: async (task) => {
      return mutate((signal) => {
        return api.setTaskCompleted(task.id, !task.completed, { signal });
      });
    },
    deleteTask: async (id) => {
      return mutate((signal) => {
        return api.deleteTask(id, { signal });
      });
    },
    resetData: async () => {
      return mutate((signal) => {
        return api.resetDemoData({ signal });
      });
    },
  };
}