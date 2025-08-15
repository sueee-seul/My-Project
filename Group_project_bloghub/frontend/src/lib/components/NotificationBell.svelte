<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { PUBLIC_API_BASE_URL } from '$env/static/public';
    import { notificationUpdateTrigger } from '$lib/store/notificationUpdateTrigger.js';

    export let unreadCount = 0;

    let intervalId;

    function goToNotifications() {
        goto('/notifications');
    }

    async function fetchNotifications() {
    try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/notifications`, { credentials: "include" });
        if (response.ok) {
            const data = await response.json();
            let notifications = data; 
            unreadCount = notifications.filter(n => n.is_new).length; 
        }} catch (error) {
            console.error('Failed to fetch unread notifications', error);
        }        
    }

    onMount(() => {
        fetchNotifications();
        intervalId = setInterval(fetchNotifications, 10000)
         const unsubscribe = notificationUpdateTrigger.subscribe(() => {
          fetchNotifications();
      });

        return () => {
            clearInterval(intervalId);
            unsubscribe();
        }
    })
</script>

<button class="notification-bell" on:click={goToNotifications} aria-label="Notifications">
    <i class="fas fa-bell"></i>
    {#if unreadCount > 0}
        <span class="badge">{unreadCount}</span>
    {/if}
</button>

<style>
    .notification-bell {
        background: none;
        border: none;
        cursor: pointer;
        position: relative;
        padding: 0;
        margin: 0 10px; 
        color: var(--text-dark); 
        font-size: 24px; 
        transition: var(--transition);
    }

    .notification-bell:hover {
        color: var(--primary); 
        transform: translateY(-2px);
    }

    .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: var(--accent);
        color: white;
        border-radius: 50%;
        padding: 3px 7px;
        font-size: 10px;
        font-weight: bold;
        line-height: 1;
        min-width: 10px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
</style> 