<script>
  import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import Editor from "@tinymce/tinymce-svelte";

  export let articleId = undefined;

  let title = "Untitled";
  let content = "<p>Write your article here</p>";
  let tagString = "";
  let image_id = null
  let image, fileinput;
  let contentReady = false;

  const ARTICLES_URL = PUBLIC_API_BASE_URL + "/articles";

  let conf = {
    height: 500,
    menubar: false,
    plugins: ["lists", "fullscreen", "help", "wordcount"],
    toolbar:
      "undo redo | blocks | " +
      "bold italic | " +
      "bullist numlist outdent indent | " +
      "removeformat | help"
  };

  async function uploadImage() {
    const formData = new FormData();
    formData.append("image-file", fileinput[0]);
    const response = await fetch(`${PUBLIC_API_BASE_URL}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData
    });
    if (response.status == 200) {
      image = await response.json();
      image_id = image.imageUrl.replace("/images", "");
    } else {
      alert("Failed to upload image.");
    }
  }

  //user can write single word as a tag
  function validateTags(tags){
    return tags.every(tag =>/^\w+$/.test(tag)); 
    
  }

  async function postArticle() {
    const tags = tagString
    .split(",")
    .map(tag=> tag.trim())
    .filter(tag => tag.length>0);

    if(!validateTags(tags)){
      alert("You need to write one word");
      return;
    }

    let result = await fetch(ARTICLES_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags, image_id })
    });
    if (result.status === 201) {
      console.log("Success")
      goto("/dashboard", { invalidateAll: true });
    } else console.log("Error");
    
  }

  async function getArticle() {
    if (articleId) {
      let response = await fetch(ARTICLES_URL + "/" + articleId);
      let article = await response.json();
      title = article.title;
      content = article.content ?? "<p></p>";
      tagString = article.tags.join();
      image_id = article.image_id;
    }
    contentReady = true;
  }

  async function editArticle() {

    const tags = tagString
    .split(",")
    .map(tag=> tag.trim())
    .filter(tag => tag.length>0);

    if(!validateTags(tags)){
      alert("You need to write one word");
      return;
    }
    
    
    let result = await fetch(ARTICLES_URL + "/" + articleId, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags, image_id })
    });
    
    if (result.status === 200) {
      console.log("Success")
      goto("/dashboard", { invalidateAll: true });
    } else console.log("Error");
  }

  function removeImage() {
    image_id = null;
  }

  onMount(getArticle);
</script>

<style>
  .editor-container {
    background-color: var(--card-bg);
    border-radius: 15px;
    box-shadow: var(--shadow);
    padding: 30px;
    max-width: 1000px;
    margin: 30px auto;
  }

  .editor-container h1 {
    font-size: 28px;
    font-weight: bold;
    color: var(--text-dark);
    margin-bottom: 20px;
  }

  label {
    font-weight: 600;
    display: block;
    margin-top: 20px;
    margin-bottom: 8px;
    color: var(--text-dark);
  }

  input[type="text"],
  input[type="file"] {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 16px;
  }

  .button-row {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  button {
    background-color: white;
    border: 2px solid var(--primary);
    color: var(--primary);
    padding: 10px 16px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  button:hover {
    background-color: var(--primary);
    color: white;
  }

  img {
    margin-top: 10px;
    max-height: 200px;
    border-radius: 10px;
  }
</style>

<div class="editor-container">
  <h1>{articleId ? "Edit Article" : "Create New Article"}</h1>

  <label for="title">Title:</label>
  <input type="text" name="title" bind:value={title} />

  <label for="image-file">Upload image:</label>
  <input
    type="file"
    name="image-file"
    accept="image/png, image/jpeg"
    bind:files={fileinput}
  />

  <div class="button-row">
    <button name="upload-image" on:click={uploadImage}>Upload</button>
    {#if image_id}
      <button name="remove-image" on:click={removeImage}>Remove Image</button>
    {/if}
  </div>

  {#if image_id}
    <img src={PUBLIC_IMAGES_URL + image_id} alt={title} />
  {/if}

  <label>Content:</label>
 {#if articleId === undefined || contentReady}
  <Editor
    apiKey="hhpyrfwft910fuj7z5kvxan28iw5vu0zrag4dcdhx5qypnwo"
    channel="7"
    bind:value={content}
    {conf}
  />
{/if}

  <label for="tags">Tags (Separate with comma):</label>
  <input type="text" name="tags" bind:value={tagString} />

  <div class="button-row">
    {#if articleId}
      <button on:click={editArticle}>Save Changes</button>
    {:else}
      <button on:click={postArticle}>Post Article</button>
    {/if}
  </div>
</div>
