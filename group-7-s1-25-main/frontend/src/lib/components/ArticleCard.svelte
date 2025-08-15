<script>
  import TagPill from './TagPill.svelte';
  import LikeButton from './LikeButton.svelte';
  import CommentSection from './CommentSection.svelte';
  import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
  import { onMount } from 'svelte';
  import {subscriptionStatus} from "$lib/store/subscription-store.js"; 
  import {get} from 'svelte/store';

  export let article;

  let likes;
  let isSubscribed = false;
  let imageLink
  let subCount;
  let isLikedAnimating = false;
  let comments = [];
  let isLiked = false;
  let notDeleted = true;

  $: imageLink = article.image_id != null ? PUBLIC_IMAGES_URL + article.image_id : null;

  export let isLoggedIn = false;
  export let currentUser = null;
  export let onLike = () => {};
  export let onTagClick = (tag) => {};
  export let selectedTag = '';
  export let onDeleteComment = (id) => {};
  export let onSubmitComment = (text) => {};
  export let onDeleteArticle = (id) => {handleDeleteArticle(id)};
  export let isAuthor = false;
  
  

  const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;
 
  
  $: isSubscribed = $subscriptionStatus.get(article.author_id) ?? false;


  async function handleLike() {
    isLikedAnimating = true;
   
    const res = await fetch(`${PUBLIC_API_BASE_URL}/likes`,{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({articleId: article.id})
    });

    if(res.ok){
      isLiked = !isLiked;
      await getLike();
    }else{
      alert("Like toggle failed")
    }

    setTimeout(()=>{
      isLikedAnimating = false;
    }, 300);
  }


  async function checkLikedStatus() {

    if(!isLoggedIn){
      isLiked = false;
      return;
    }

    const res = await fetch(`${PUBLIC_API_BASE_URL}/likes/${article.id}/status`,{
      credentials: "include"
    });

    if(res.ok){
      const result = await res.json();
      isLiked =result.liked;
    }
    
  }

  async function init() {
    await getComments();
    await checkSubscription();
    await getLike();
    await checkLikedStatus();
    await getSubCount(); // New function to fetch subscriber count
  }
  

  async function getComments() {
    try {
      console.log('Fetching comments for article:', article.id);
      let response = await fetch(`${PUBLIC_API_BASE_URL}/comments/articles/${article.id}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        let commentResponse = await response.json();
        console.log('Comment response:', commentResponse);
        comments = commentResponse.comments;
        console.log('Comments set:', comments);
      } else {
        console.error('Failed to fetch comments:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  
  async function checkSubscription() {
    if (!isLoggedIn || article.author_id === currentUser?.id) return;
    const res = await fetch(`${PUBLIC_API_BASE_URL}/subscriptions/status/${article.author_id}`, {
      credentials: 'include'
    });

    if(res.ok){
      const result = await res.json();
      //store subscription status
      subscriptionStatus.update(map=>{
        map.set(article.author_id, result.subscribed);
        return map;
      })
    }
  }

 
  async function getLike() {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/likes/${article.id}/count`);
    const result = await res.json();
    likes = result.likes;
    
  }

  async function getSubCount() {
    const res = await fetch(`${PUBLIC_API_BASE_URL}/subscriptions/${article.author_id}`);
    const result = await res.json();
    subCount = result.length;
  }

  async function toggleSubscription() {
    if (!isLoggedIn) {
      alert("Please log in to subscribe.");
      return;
    }

    const url = `${PUBLIC_API_BASE_URL}/subscriptions/${article.author_id}`;
    const method = isSubscribed ? 'DELETE' : 'POST';

    const res = await fetch(url, {
      method,
      credentials: 'include'
    });
    
    if (res.ok) {
     subscriptionStatus.update(map =>{
      map.set(article.author_id, !isSubscribed);
      return map;
     });
     subCount += isSubscribed ? -1 : 1;
    } else {
      alert("Failed to update subscription.");
    }
  }

  async function handleSubmitComment(text) {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: text,
          articleId: article.id
        })
      });
      
      if (response.ok) {
        await getComments();
      } else {
        alert('Failed to submit comment');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment');
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        await getComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  }

  async function handleDeleteArticle(articleId) {
    console.log("ran default delete article");
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        notDeleted = false;
        } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article');
    }
  }

  function handleEditArticle(articleId) {
    window.location.href = `/articles/${articleId}/edit`;
  }

  $: if (article) init();

  console.log('ArticleCard - article.author_id:', article.author_id);
  console.log('ArticleCard - currentUser?.user?.id:', currentUser?.user?.id);
  console.log('ArticleCard - isAuthor (calculated):', article.author_id === currentUser?.user?.id);
</script>

{#if notDeleted}
<div class="article-card">
  <div class="article-header">
    <div class="article-title-row">
      <h1 class="article-title">{article.title}</h1>
   
      <LikeButton 
        likes={likes} 
        onLike={handleLike} 
        isAnimating={isLikedAnimating}
        isLoggedIn={isLoggedIn}
        isLiked = {isLiked}
        isOwner={article.author_id===currentUser?.user?.id}
      />
    </div>
    
    <div class="article-meta">
      {#if subCount !== undefined}
      <span class="author">
        <i class="fas fa-user"></i> {article.author_name}
      </span>
      <span class="subscribers">
        <i class="far"></i> {pluralize(subCount, "Subscriber")}
      </span>
      {/if}
      <span>
        <i class="far fa-calendar"></i> {article.created_at}
      </span>

      {#if isLoggedIn && currentUser?.user.id !== article.author_id}
        <button on:click={toggleSubscription} style="margin-left: auto;">
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      {:else if isLoggedIn && isAuthor}
        <div class="author-controls" style="margin-left: auto;">
          <button class="edit-btn" on:click={() => handleEditArticle(article.id)}>
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="delete-btn" on:click={() => onDeleteArticle(article.id)}>
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if article.image_id != null}
    <div class="article-image">
      <img src={imageLink} alt={article.title}>
    </div>
  {/if}
  
  <div class="article-content">
    <div class="content-paragraph">
      {@html article.content}
    </div>
  </div>

  
  
  <div class="tag-section">
    <span class="tag-label">Tag</span>
    <div class="tags-list">
      {#each article.tags as tag}
        <TagPill 
          tag={tag} 
          selected={selectedTag === tag} 
          onClick={onTagClick} 
        />
      {/each}
    </div>
  </div>
  
  <div class="comment-section">
  <CommentSection 
    comments={comments}
    currentUser={currentUser}
    articleId={article.id}
    onDeleteComment={handleDeleteComment}
    onSubmitComment={handleSubmitComment}
    isAuthor={isAuthor}
  />
  </div>
</div>
{/if}

<style>
  .article-card {
    background-color: var(--card-bg);
    border-radius: 15px;
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 30px;
    transition: var(--transition);
  }

  .article-header {
    padding: 30px;
    position: relative;
  }

  .article-image {
    justify-content: center;
    display: flex;
  }

  .article-image img {
  max-width: 50%;
  height: auto;
  max-height: 300px;
  display: block;
}

  .article-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 15px;
    color: var(--text-light);
    margin-bottom: 20px;
  }

  .author {
    font-weight: 600;
    color: var(--primary);
  }

  .article-content {
    padding: 0 30px 30px;
    color: var(--text-medium);
  }

  :global(.article-content ul),
  :global(.article-content ol) {
  padding-left: 2.5rem; 
  margin-bottom: 1rem;
  list-style-position: outside;
}

:global(.article-content li) {
  margin-left: 1rem; 
  margin-bottom: 0.3rem;
}

  .tag-section {
    padding: 0 30px 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 30px;
  }

  .tag-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
  }

  .tags-list {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 6px 12px;
    border: 1px solid var(--primary);
    border-radius: 6px;
    background-color: white;
    color: var(--primary);
    cursor: pointer;
  }

  button:hover {
    background-color: var(--primary);
    color: white;
  }

  .author-controls {
    display: flex;
    gap: 10px;
  }

  .edit-btn {
    background-color: var(--secondary);
    border-color: var(--secondary);
    color: white;
  }

  .edit-btn:hover {
    background-color: #d68910;
    border-color: #d68910;
  }

  .delete-btn {
    background-color: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .delete-btn:hover {
    background-color: #b91c1c;
    border-color: #b91c1c;
  }
</style>