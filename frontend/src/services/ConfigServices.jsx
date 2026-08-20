import { apiFetch } from "./api";

// ========================================
// Workspaces
// ========================================

// Only workspaces the current user belongs to, with their role in each
export async function getWorkspaces() {
    return apiFetch("/workspaces");
}

export async function createWorkspace(name, type) {
    return apiFetch("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name, type })
    });
}

// Admin only
export async function getWorkspaceMembers(workspaceId) {
    return apiFetch(`/workspaces/${workspaceId}/members`);
}

// Admin only — the invitee must already have an account
export async function addWorkspaceMember(workspaceId, email, role) {
    return apiFetch(`/workspaces/${workspaceId}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role })
    });
}

// Admin only
export async function updateMemberRole(workspaceId, userId, role) {
    return apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role })
    });
}

// Admin only
export async function removeWorkspaceMember(workspaceId, userId) {
    return apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE"
    });
}


export async function getStatuses(workspaceId) {
    return apiFetch(`/workspaces/${workspaceId}/statuses`);
}

export async function getPriorities(workspaceId) {
    return apiFetch(`/workspaces/${workspaceId}/priorities`);
}

export async function getCategories(workspaceId) {
    return apiFetch(`/workspaces/${workspaceId}/categories`);
}

export async function getGroups(workspaceId) {
    return apiFetch(`/workspaces/${workspaceId}/groups`);
}

// ========================================
// Statuses (admin only, enforced server-side)
// ========================================

export async function createStatus(workspaceId, status) {
    return apiFetch(`/workspaces/${workspaceId}/statuses`, {
        method: "POST",
        body: JSON.stringify(status)
    });
}

export async function updateStatus(workspaceId, statusId, status) {
    return apiFetch(`/workspaces/${workspaceId}/statuses/${statusId}`, {
        method: "PUT",
        body: JSON.stringify(status)
    });
}

export async function deleteStatus(workspaceId, statusId) {
    return apiFetch(`/workspaces/${workspaceId}/statuses/${statusId}`, {
        method: "DELETE"
    });
}


// ========================================
// Priorities (admin only, enforced server-side)
// ========================================

export async function createPriority(workspaceId, priority) {
    return apiFetch(`/workspaces/${workspaceId}/priorities`, {
        method: "POST",
        body: JSON.stringify(priority)
    });
}

export async function updatePriority(workspaceId, priorityId, priority) {
    return apiFetch(`/workspaces/${workspaceId}/priorities/${priorityId}`, {
        method: "PUT",
        body: JSON.stringify(priority)
    });
}

export async function deletePriority(workspaceId, priorityId) {
    return apiFetch(`/workspaces/${workspaceId}/priorities/${priorityId}`, {
        method: "DELETE"
    });
}


// ========================================
// Categories (admin only, enforced server-side)
// ========================================

export async function createCategory(workspaceId, category) {
    return apiFetch(`/workspaces/${workspaceId}/categories`, {
        method: "POST",
        body: JSON.stringify(category)
    });
}

export async function updateCategory(workspaceId, categoryId, category) {
    return apiFetch(`/workspaces/${workspaceId}/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(category)
    });
}

export async function deleteCategory(workspaceId, categoryId) {
    return apiFetch(`/workspaces/${workspaceId}/categories/${categoryId}`, {
        method: "DELETE"
    });
}


// ========================================
// Groups (admin only, enforced server-side)
// ========================================

export async function createGroup(workspaceId, group) {
    return apiFetch(`/workspaces/${workspaceId}/groups`, {
        method: "POST",
        body: JSON.stringify(group)
    });
}

export async function updateGroup(workspaceId, groupId, group) {
    return apiFetch(`/workspaces/${workspaceId}/groups/${groupId}`, {
        method: "PUT",
        body: JSON.stringify(group)
    });
}

export async function deleteGroup(workspaceId, groupId) {
    return apiFetch(`/workspaces/${workspaceId}/groups/${groupId}`, {
        method: "DELETE"
    });
}
