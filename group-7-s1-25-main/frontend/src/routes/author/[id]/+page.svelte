<script>
  import { page } from '$app/stores';
  import { PUBLIC_API_BASE_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';

  export let data;

  let authorId;
  let articles = [];
  let author;
  let loading = true;
  let error = '';

  $: authorId = $page.params.id;

  onMount(async () => {
    try {
      const resUser = await fetch(`${PUBLIC_API_BASE_URL}/users/${authorId}`);
      author = await resUser.json();

      const resArticles = await fetch(`${PUBLIC_API_BASE_URL}/articles`);
      const all = await resArticles.json();
      articles = all.filter(a => a.author_id == authorId);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>BlogHub - {author?.firstname} {author?.lastname}</title>
</svelte:head>

<div class="author-articles-container">
  <h1>Articles by {author?.firstname} {author?.lastname}</h1>

  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if articles.length === 0}
    <p>No articles from this author yet.</p>
  {:else}
    {#each articles as article}
      <ArticleCard article={article} isLoggedIn={data.isLoggedIn} currentUser={data.loggedInUser}/>
    {/each}
  {/if}
</div>

<style>
  .author-articles-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
  }
</style>
