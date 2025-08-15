<script>
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { getArticle } from "../../lib/api/articles.js";
  import { getUserProfile } from "../../lib/api/users.js";
  import { getComment } from "../../lib/api/comments.js";
  import { invalidate, invalidateAll } from "$app/navigation";
  import { notificationUpdateTrigger } from '../../lib/store/notificationUpdateTrigger.js';

  export let data;

  let notifications = [];
  let isLoading = false;
  let isDeleting = false;
  let markingId = null;
  let errorMessage = "";

  function forceUpdate() {
    notificationUpdateTrigger.update(n => n + 1);
  }

  async function fetchNotifications() {
    isLoading = true;
    errorMessage = "";
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/notifications`, {
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let unsortedNotifications = data;

      notifications = sortByNewestFirst(unsortedNotifications);
      console.log(notifications);

      for (const notification of notifications) {
        if (notification.article_id != null) {
          try {
            let article = await getArticle(notification.article_id);
            let author = await getUserProfile(article.author_id);
            notification.message = `New article "${article.title}" from ${author.username}`;
            notification.link = `/articles/${article.id}`;
          } catch (e) {
            console.error("Error enriching notification:", e);
            notification.message = "New article notification (details unavailable)";
          }
        } else if (notification.comment_id != null) {
            let comment = await getComment(notification.comment_id);
            let commenter = await getUserProfile(comment.user_id);
            notification.message = `New mention in comment by ${commenter.username}`;
            notification.link = `/articles/${comment.article_id}#comment-section`;
        } else {
          notification.message = "You have a new notification.";
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      errorMessage = "Failed to load notifications. Please try again later.";
    } finally {
      isLoading = false;
      forceUpdate();
    }
  }

  function sortByNewestFirst(data) {
    return data.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  async function markAsRead(id) {
    markingId = id;
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/notifications/${id}`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to mark notification ${id} as read: ${response.status}`
        );
      }

      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      errorMessage = "Could not mark notification as read.";
    } finally {
      markingId = null;
    }
  }

  onMount(() => {
    fetchNotifications();
  });
</script>

<svelte:head>
  <title>BlogHub - Notifications</title>
</svelte:head>

<div class="notifications-container">
  <h1>Notifications</h1>

  {#if isLoading}
    <p>Loading notifications...</p>
  {:else if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {:else if notifications.length === 0}
    <p>You have no notifications.</p>
  {:else}
    <ul class="notification-list">
      {#each notifications as notification (notification.id)}
        <li class="notification-item" class:read={!notification.is_new}>
            <div class="notification-message">
                <a href={notification.link} on:click={() => markAsRead(notification.id)}>{notification.message}</a>
            </div>
        
            <span class="notification-date">
              {notification.time}
            </span>
          {#if notification.is_new}
            <button
              on:click={() => markAsRead(notification.id)}
              class="mark-read-btn"
              disabled={markingId === notification.id || isDeleting}
            >
              {markingId === notification.id ? "Marking..." : "Mark as Read"}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .notifications-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: var(--card-bg);
    border-radius: 12px;
    box-shadow: var(--shadow);
  }

  h1 {
    color: var(--text-dark);
    text-align: center;
    margin-bottom: 30px;
  }

  .notification-list {
    list-style: none;
    padding: 0;
  }

  .notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    background-color: var(--bg-light);
    border-radius: 8px;
    border: 1px solid var(--border);
    transition: var(--transition);
  }

  .notification-item.read {
    opacity: 0.7;
    background-color: var(--bg-dark);
  }

  .notification-content p {
    margin: 0;
    color: var(--text-dark);
    font-size: 16px;
  }

  .notification-content .notification-date {
    font-size: 12px;
    color: var(--text-medium);
    margin-top: 5px;
    display: block;
  }

  a {
    all: unset;
    cursor: pointer;
    text-decoration: underline;
  }

  .mark-read-btn,
  .clear-read-btn {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
  }

  .mark-read-btn:hover,
  .clear-read-btn:hover {
    background-color: var(--primary-dark);
  }

  .mark-read-btn:disabled,
  .clear-read-btn:disabled {
    background-color: var(--text-medium);
    cursor: not-allowed;
  }

  .clear-read-btn {
    display: block;
    margin: 0 auto 20px auto;
  }

  .error-message {
    color: var(--accent);
    text-align: center;
    margin-top: 20px;
  }
</style>
