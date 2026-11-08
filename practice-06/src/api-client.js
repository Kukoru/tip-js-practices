export class ApiError extends Error {
  constructor(message, { kind, status = null, code = null, details = null, url = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError"; this.kind = kind; this.status = status; this.code = code; this.details = details; this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${base}/${cleanPath}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 3000 } = {}) {
  if (!baseUrl || typeof baseUrl !== "string" || !baseUrl.startsWith("http")) throw new TypeError("baseUrl должен быть http-адресом");
  
  const urlObj = new URL(baseUrl);
  if (urlObj.search || urlObj.hash) throw new TypeError("baseUrl не должен содержать query или hash");
  
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией");
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("timeoutMs должен быть положительным числом");

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async requestJson(path, { method = "GET", query, body, signal: extSignal, timeoutMs: customTimeout } = {}) {
      const m = method.toUpperCase();
      if (!["GET", "POST", "PATCH", "DELETE"].includes(m)) throw new TypeError("Неверный метод");
      if (m === "GET" && body) throw new TypeError("GET не может иметь body");

      const url = buildUrl(cleanBaseUrl, path, query);
      const timeout = customTimeout ?? timeoutMs;
      const signals = [AbortSignal.timeout(timeout)];
      if (extSignal) signals.push(extSignal);
      const signal = AbortSignal.any(signals);

      const headers = { "Accept": "application/json" };
      let reqBody;
      if (body) {
        headers["Content-Type"] = "application/json";
        reqBody = JSON.stringify(body);
      }

      let response;
      try {
        response = await fetchFn(url, { method: m, headers, body: reqBody, signal });
      } catch (err) {
        const isTimeout = (signal.reason && signal.reason.name === "TimeoutError") || err.name === "TimeoutError";
        throw new ApiError(isTimeout ? "Время вышло" : "Отменено", { kind: isTimeout ? "timeout" : (err.name === "AbortError" ? "aborted" : "network"), url, cause: err });
      }

      if (!(response instanceof Response)) throw new ApiError("Ожидался Response", { kind: "invalid-response", url });

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`, code = null, details = null;
        try { const p = await response.json(); if (p?.error) { errMsg = p.error.message || errMsg; code = p.error.code; details = p.error.details; } } catch {}
        throw new ApiError(errMsg, { kind: "http", status: response.status, code, details, url });
      }

      if (response.status === 204) return null;
      if (!(response.headers.get("content-type") || "").includes("application/json")) throw new ApiError("Ожидался JSON", { kind: "invalid-response", url });
      try { return await response.json(); } catch (err) { throw new ApiError("Ошибка парсинга JSON", { kind: "invalid-response", url, cause: err }); }
    }
  };
}