import { apiFetch } from "./api";

export function signup(name, email, password) {
    return apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
    });
}

export function login(email, password) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function getMyWorkspaces() {
    return apiFetch("/auth/me/workspaces");
}
