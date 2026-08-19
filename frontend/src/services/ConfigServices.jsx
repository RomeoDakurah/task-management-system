const API_URL = import.meta.env.VITE_API_URL;

export async function getWorkspaces() {

    const response = await fetch(
        `${API_URL}/workspaces`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
    }

    return response.json();
}


export async function getStatuses(workspaceId) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/statuses`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch statuses");
    }

    return response.json();
}


export async function getPriorities(workspaceId) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/priorities`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch priorities");
    }

    return response.json();
}


export async function getCategories(workspaceId) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/categories`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return response.json();
}


export async function getGroups(workspaceId) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/groups`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch groups");
    }

    return response.json();
}

// ========================================
// Statuses
// ========================================

export async function createStatus(workspaceId, status) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/statuses`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(status)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create status");
    }

    return response.json();
}


export async function updateStatus(
    workspaceId,
    statusId,
    status
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/statuses/${statusId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(status)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update status");
    }

    return response.json();
}


export async function deleteStatus(
    workspaceId,
    statusId
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/statuses/${statusId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete status");
    }

    return response.json();
}


// ========================================
// Priorities
// ========================================

export async function createPriority(
    workspaceId,
    priority
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/priorities`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(priority)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create priority");
    }

    return response.json();
}


export async function updatePriority(
    workspaceId,
    priorityId,
    priority
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/priorities/${priorityId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(priority)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update priority");
    }

    return response.json();
}


export async function deletePriority(
    workspaceId,
    priorityId
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/priorities/${priorityId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete priority");
    }

    return response.json();
}


// ========================================
// Categories
// ========================================

export async function createCategory(
    workspaceId,
    category
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/categories`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create category");
    }

    return response.json();
}


export async function updateCategory(
    workspaceId,
    categoryId,
    category
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/categories/${categoryId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update category");
    }

    return response.json();
}


export async function deleteCategory(
    workspaceId,
    categoryId
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/categories/${categoryId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete category");
    }

    return response.json();
}


// ========================================
// Groups
// ========================================

export async function createGroup(
    workspaceId,
    group
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/groups`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(group)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create group");
    }

    return response.json();
}


export async function updateGroup(
    workspaceId,
    groupId,
    group
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/groups/${groupId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(group)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update group");
    }

    return response.json();
}


export async function deleteGroup(
    workspaceId,
    groupId
) {

    const response = await fetch(
        `${API_URL}/workspaces/${workspaceId}/groups/${groupId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete group");
    }

    return response.json();
}