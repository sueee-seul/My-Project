import { PUBLIC_API_BASE_URL } from '$env/static/public';

export async function getUserProfile(userId) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/users/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return await res.json();
}

export async function subscribeToUser(userId) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/users/${userId}/subscribe`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to subscribe');
    return await res.json();
}

export async function unsubscribeFromUser(userId) {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/users/${userId}/unsubscribe`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to unsubscribe');
    return await res.json();
}
