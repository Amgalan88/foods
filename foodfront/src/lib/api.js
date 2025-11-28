const resolveBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }

  return "http://localhost:8000";
};

export const API_BASE_URL = resolveBaseUrl();

export const getStoredSession = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("nomnom_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const buildAuthHeaders = (extra = {}) => {
  const session = getStoredSession();
  if (session?.token) {
    return { ...extra, Authorization: `Bearer ${session.token}` };
  }
  return extra;
};

export const apiFetch = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const mergedOptions = { ...options };
  if (options?.auth) {
    mergedOptions.headers = buildAuthHeaders(options.headers);
    delete mergedOptions.auth;
  }
  const response = await fetch(url, mergedOptions);
  return response;
};
