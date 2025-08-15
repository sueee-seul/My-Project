<script>
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import MessageView from "$lib/components/MessageView.svelte";
  export let data;

  const backgroundImage = `url(${PUBLIC_IMAGES_URL}/milky-way.jpg)`;
</script>

<svelte:head>
  <title>BlogHub - Home</title>
</svelte:head>

<style>
  .home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: white;
    text-shadow: 1px 1px 4px black;
  }

  .btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background-color: rgba(155, 135, 85, 0.9);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn:hover {
    background-color: rgba(138, 119, 68, 1);
  }

  @media (max-width: 600px) {
    .home-container {
      padding: 1rem;
    }
    h1 {
      font-size: 1.8rem;
    }
    .btn {
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
    }
  }
</style>

<!-- backgroundImage -->
<div class="home-container" style="background-image: {backgroundImage}">
  <h1 style="color: white; font-size: 2.5rem; text-shadow: 1px 1px 4px black;">
  Welcome to Our Blog Platform
</h1>

  <p>
    <a href="/articles" class="btn">View Blog Articles</a>
  </p>

  {#if data.messages.length > 0}
    <h2>Messages from server</h2>
    {#each data.messages as message (message.id)}
      <MessageView {message} />
    {/each}
  {/if}
</div>
