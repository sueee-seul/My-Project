const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', 
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
}

export async function register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Register failed');
    return await res.json();
}

export async function logout() {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
}
