<script>
  import { onMount } from 'svelte';
  import { PUBLIC_API_BASE_URL } from '$env/static/public';
  import { goto } from '$app/navigation';

  let subscriptions = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/subscriptions/me`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");

      subscriptions = await res.json(); // 应该是一个作者数组
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  function goToAuthorArticles(authorId) {
    goto(`/author/${authorId}`); // 你可以自定义路径
  }
</script>

<svelte:head>
  <title>BlogHub - Subscriptions</title>
</svelte:head>

<div class="subscriptions-container">
  <h1 class="subscriptions-title">My Subscriptions</h1>

  {#if subscriptions.length === 0}
    <div class="empty-subscription-message">
      You haven't subscribed to anyone yet.
    </div>
  {:else}
    {#each subscriptions as user}
      <div class="subscription-item">
        <div class="subscription-info">
          <span class="subscription-name">{user.firstname} {user.lastname}</span>
          <span class="subscription-username">(@{user.username})</span>
        </div>
        <button class="subscription-button" on:click={() => goToAuthorArticles(user.id)}>
          View Articles
        </button>
      </div>
    {/each}
  {/if}
</div>


<style>

    .empty-subscription-message {
        text-align: center;
        font-size: 16px;
        color: var(--text-light);
        margin-top: 20px;
    }

    
    .subscriptions-container {
    max-width: 800px;
    margin: 40px auto;
    background-color: var(--card-bg);
    border-radius: 15px;
    box-shadow: var(--shadow);
    padding: 30px;
    }

    .subscriptions-container h1 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--text-dark);
    }

    .subscription-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid var(--border);
    }

    .subscription-item:last-child {
    border-bottom: none;
    }

    .subscription-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-dark);
    }

    .subscription-username {
    color: var(--text-light);
    margin-left: 5px;
    }

    .subscription-button {
    background-color: var(--primary);
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    }

    .subscription-button:hover {
    background-color: var(--primary-dark);
    }


</style>