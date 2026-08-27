const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Wraps fetch: attaches the Bearer token, sets JSON headers, and throws
 * a readable error (with the API's detail message when present) on any
 * non-2xx response. A 401 also clears the session and forces a redirect
 * to /login, since it means the token is missing/expired/invalid.
 */
export async function apiFetch(path, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearSession();
        window.location.href = "/login";
        throw new Error("Session expired — please log in again");
    }

    if (!response.ok) {
        let detail = `Request failed (${response.status})`;

        try {
            const body = await response.json();
            if (body?.detail) {
                detail = typeof body.detail === "string"
                    ? body.detail
                    : JSON.stringify(body.detail);
            }
        } catch {
            // response wasn't JSON — keep the generic message
        }

        throw new Error(detail);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export { API_URL };
