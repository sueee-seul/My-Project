import { PUBLIC_API_BASE_URL } from "$env/static/public"
import { goto } from "$app/navigation";


// Disable server-side rendering
export const ssr = false;

export async function load({ fetch, url }) {
    const response = await fetch(PUBLIC_API_BASE_URL + "/users/me", { credentials: "include" });
    
    if (response.status !== 200 && url.pathname === '/dashboard') {
        goto('/login');
        return { isLoggedIn: false, unreadCount: 0 };
    }

    if (response.status === 200) {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/notifications`, { credentials: "include" });

        if (!res.ok) {

            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await res.json();
        let notifications = data;
        console.log(notifications)
        let unreadCount = notifications.filter(n => n.is_new).length;
        console.log(unreadCount)
        return {
            isLoggedIn: true,
            loggedInUser: await response.json(),
            notifications: notifications,
            unreadCount: unreadCount
        }
    }

    return { isLoggedIn: false, unreadCount: 0 };
}