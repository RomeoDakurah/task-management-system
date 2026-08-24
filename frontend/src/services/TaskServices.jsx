import { apiFetch } from "./api";

export async function getTasks(workspace_id, filters = {}) {
    const queryParams = new URLSearchParams();

    queryParams.append("workspace_id", workspace_id);

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") {
            queryParams.append(key, value);
        }
    });

    return apiFetch(`/tasks?${queryParams.toString()}`);
}

export async function createTask(task) {
    return apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(task)
    });
}

export async function deleteTask(taskId) {
    return apiFetch(`/tasks/${taskId}`, {
        method: "DELETE"
    });
}

export async function getTask(taskId) {
    return apiFetch(`/tasks/${taskId}`);
}

export async function updateTask(taskId, task) {
    return apiFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(task)
    });
}

// Admin only — assign a task to a workspace member
export async function assignTask(taskId, assignedTo) {
    return apiFetch(`/tasks/${taskId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assigned_to: assignedTo })
    });
}

// Assignee only — accept a task assigned to you
export async function acceptTask(taskId) {
    return apiFetch(`/tasks/${taskId}/accept`, {
        method: "POST"
    });
}

// Assignee only — mark a task assigned to you complete
export async function declineTask(taskId) {
    return apiFetch(`/tasks/${taskId}/decline`, {
        method: "POST"
    });
}

export async function completeTask(taskId) {
    return apiFetch(`/tasks/${taskId}/complete`, {
        method: "POST"
    });
}
