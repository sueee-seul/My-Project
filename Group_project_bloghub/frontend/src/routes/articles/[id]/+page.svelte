<script>
  import { getArticle } from "../../../lib/api/articles";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import ArticleCard from "../../../lib/components/ArticleCard.svelte";

  export let data;

  const articleId = $page.params.id;
  let article;

  async function init() {
    article = await getArticle(articleId);
  }

  onMount(init);
</script>

<svelte:head>
  <title>BlogHub - {article?.title}</title>
</svelte:head>

{#if article}
  <div class="article-container">
    <ArticleCard {article} isLoggedIn={data.isLoggedIn} currentUser={data.loggedInUser} />
  </div>
{/if}

<style>
  .article-container {
    max-width: 1000px;
    margin: 40px auto;

  }
</style>
