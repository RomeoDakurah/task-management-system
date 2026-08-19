const API_URL = import.meta.env.VITE_API_URL;

export async function getTasks(workspace_id, filters = {}) {
    const queryParams = new URLSearchParams();

    queryParams.append("workspace_id", workspace_id);

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") {
            queryParams.append(key, value);
        }
    });

    const response = await fetch(
        `${API_URL}/tasks?${queryParams.toString()}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch tasks");
    }

    return response.json();
}

export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        throw new Error("Failed to create task");
    }

    return response.json();
}

export async function deleteTask(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }

    return response.json();
}

export async function getTask(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch task");
    }

    return response.json();
}

export async function updateTask(taskId, task) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        throw new Error("Failed to update task");
    }

    return response.json();
}