<script>
    import ArticleEditor from "../../../lib/components/ArticleEditor.svelte";
</script>

<svelte:head>
  <title>BlogHub - New Post</title>
</svelte:head>

<h1>Create new article</h1>

<ArticleEditor />


<style>
  h1 {
    text-align: center;
    margin-top: 20px;
    color: var(--primary-color);
  }

</style>