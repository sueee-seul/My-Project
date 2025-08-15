<script>
  import { user as userStore } from '$lib/store/userStore';
  import { goto } from '$app/navigation';
  import NotificationBell from './NotificationBell.svelte';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  export let unreadCount = 0;

  async function logout() {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',

        credentials: 'include',
      });
      userStore.set(null);
      goto('/login', { replaceState: true, invalidateAll: true });

    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  import { afterUpdate } from 'svelte';

$: console.log("Navbar userStore:", $userStore);

afterUpdate(() => {
  console.log("After update — userStore is", $userStore);
});

$: if (!$userStore) {
  (async () => {
    const res = await fetch(PUBLIC_API_BASE_URL + '/users/me', { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      userStore.set(json.user ?? json);
    }
  })();
}
</script>

<nav class="navbar">
  <div class="nav-container">
    <a href="/" class="logo">
      <i class="fas fa-blog"></i> BlogHub
    </a>


    <div class="nav-links">
      <a href="/" class="nav-link">Home</a>
      <a href="/articles" class="nav-link">Articles</a>
      {#if $userStore} 
        <a href="/dashboard" class="nav-link">Dashboard</a>
        <a href="/subscriptions" class="nav-link">Subscriptions</a>
        <a href="/articles/new" class="nav-link">New Post</a>
      {/if}
    </div>

    <div class="nav-actions">

      {#if $userStore?.user}
      
          <NotificationBell unreadCount={unreadCount}/>
          <button type="button" class="user-avatar" aria-label="Edit user profile" on:click={() => goto("/users/edit")}>

            {#if $userStore.user.avatar}
              <img src={$userStore.user.avatar} alt={$userStore.user.username} />
            {:else}
              {$userStore.user.username.charAt(0).toUpperCase()}
            {/if}
          </button>
          <button class="btn btn-outline" on:click={logout}>Logout</button>
      {:else}
        <a href="/login" class="btn btn-outline">Login</a>
        <a href="/register" class="btn btn-primary">Join</a>
      {/if}
    </div>
  </div>
</nav> 


<style>
  .navbar {
    background-color: var(--card-bg);
    box-shadow: var(--shadow);
    padding: 15px 0;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    width: 100%;
  }

  .logo {
    font-family: "Montserrat", sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--primary);
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .logo i {
    margin-right: 10px;
    color: #f4a300; 
  }

  .nav-links {
    display: flex;
    gap: 30px;
  }

  .nav-link {
    font-weight: 500;
    font-size: 16px;
    position: relative;
    padding: 5px 0;
    text-decoration: none;
    color: var(--primary);
    transition: var(--transition);
  }

  .nav-link:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary);
    transition: var(--transition);
  }

  .nav-link:hover:after {
    width: 100%;
  }

  .nav-actions {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .btn {
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: 600;
    transition: var(--transition);
    cursor: pointer;
    border: none;
    font-family: "Montserrat", sans-serif;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(45, 91, 136, 0.25);
  }

  .btn-outline {
    background-color: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
  }

  .btn-outline:hover {
    background-color: var(--primary);
    color: white;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
    transition: var(--transition);
    border: 2px solid white;
    cursor: pointer;
  }

  .user-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  a.btn,
  a.nav-link,
  .logo
  {
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      gap: 15px;
    }

    .nav-links {
      gap: 15px;
    }

    .nav-actions {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .nav-actions {
      flex-direction: column;
      width: 100%;
    }
  }
</style>
