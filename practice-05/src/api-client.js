export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${base}/${cleanPath}`);
  
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  if (!baseUrl || typeof baseUrl !== "string" || !baseUrl.startsWith("http")) {
    throw new TypeError("baseUrl должен быть абсолютным http- или https-адресом");
  }
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }

  const urlObj = new URL(baseUrl);
  if (urlObj.search || urlObj.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async requestJson(path, { query, signal: externalSignal, timeoutMs: customTimeout } = {}) {
      const url = buildUrl(cleanBaseUrl, path, query);
      const timeout = customTimeout ?? timeoutMs;
      
      const signals = [AbortSignal.timeout(timeout)];
      if (externalSignal) {
        signals.push(externalSignal);
      }
      const signal = AbortSignal.any(signals);

      let response;
      try {
        response = await fetchFn(url, {
          method: "GET",
          headers: { "Accept": "application/json" },
          signal
        });
      } catch (err) {
        const isTimeout = (signal.reason && signal.reason.name === "TimeoutError") || err.name === "TimeoutError";
        throw new ApiError(isTimeout ? "Время ожидания истекло" : "Запрос отменен", {
          kind: isTimeout ? "timeout" : (err.name === "AbortError" ? "aborted" : "network"),
          url,
          cause: err
        });
      }
      
      if (!(response instanceof Response)) {
        throw new ApiError("Ожидался объект Response", { kind: "invalid-response", url });
      }

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        let code = null;
        let details = null;
        try {
          const payload = await response.json();
          if (payload && payload.error) {
            errMsg = payload.error.message || errMsg;
            code = payload.error.code;
            details = payload.error.details;
          }
        } catch {}
        
        throw new ApiError(errMsg, { 
          kind: "http", 
          status: response.status, 
          code, 
          details, 
          url 
        });
      }

      if (response.status === 204) {
        return null;
      }

      const ct = response.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new ApiError("Ожидался JSON", { kind: "invalid-response", url });
      }

      try {
        return await response.json();
      } catch (err) {
        throw new ApiError("Ошибка парсинга JSON", { kind: "invalid-response", url, cause: err });
      }
    }
  };
}