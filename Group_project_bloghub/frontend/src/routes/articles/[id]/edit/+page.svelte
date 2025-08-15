<script>
    import ArticleEditor from "../../../../lib/components/ArticleEditor.svelte";
    import { page } from "$app/stores";
    let articleId = $page.params.id;
</script>

<ArticleEditor articleId = {articleId} />