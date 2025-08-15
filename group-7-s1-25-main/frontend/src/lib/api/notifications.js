const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export async function getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
}

export async function markNotificationAsRead(notificationId) {
    const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
}
