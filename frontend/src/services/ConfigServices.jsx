const API_URL = import.meta.env.VITE_API_URL;

export async function getStatuses() {
    const response = await fetch(`${API_URL}/statuses`);
    if (!response.ok) {
        throw new Error('Failed to fetch statuses');
    }
    const data = await response.json();
    return data;
}

export async function getPriorities() {
    const response = await fetch(`${API_URL}/priorities`);
    if (!response.ok) {
        throw new Error('Failed to fetch priorities');
    }
    const data = await response.json();
    return data;
}

export async function getCategories() {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data;
}

export async function getGroups() {
    const response = await fetch(`${API_URL}/groups`);
    if (!response.ok) {
        throw new Error('Failed to fetch groups');
    }
    const data = await response.json();
    return data;
}