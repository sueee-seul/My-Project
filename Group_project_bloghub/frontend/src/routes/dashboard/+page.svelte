<script>
  import { onMount } from 'svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';
  import { PUBLIC_API_BASE_URL } from '$env/static/public';

  export let data;
  
  let articles = [];
  let selectedArticle = null;
  let tagFilter = '';
  let searchTerm = '';
  let sortOrder = 'newest';
  let user = data.loggedInUser;
  let isSubscribed = true;
  let comments = [];
  let loading = true;
  let error = '';
  let showSortDropdown = false;
  let showSearchInput = false;

  
  async function fetchArticles() {
    try {
      loading = true;
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/me`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const responseData = await response.json();
      console.log('fetchArticles - raw responseData from backend:', responseData);

      const articlesData = responseData.user?.articles || [];
      console.log('fetchArticles - raw articlesData from responseData:', articlesData);
      
      articles = articlesData.map(article => ({
        ...article,
        author: article.author_name || 'Unknown',
        author_name: article.author_name || 'Unknown',
        date: new Date(article.created_at).toLocaleDateString(),
        likes: article.likesCount || 0,
        tags: article.tags || []
      }));
      
      console.log('fetchArticles - processed articles for frontend:', articles);
 
      if (articles.length > 0) {
        selectedArticle = articles[0];
        await fetchArticleDetails(selectedArticle.id);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      error = 'Failed to load articles';
    } finally {
      loading = false;
    }
  }

  
  async function fetchArticleDetails(articleId) {
    try {
      console.log('fetchArticleDetails - received articleId:', articleId);
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch article details');
      }
      
      const articleData = await response.json();
      console.log('fetchArticleDetails - fetched articleData (id, author_id):', articleData.id, articleData.author_id);
      
      selectedArticle = {
        ...articleData,
        author_id: articleData.author_id,
        author: articleData.author_name || 'Unknown',
        author_name: articleData.author_name || 'Unknown',
        date: new Date(articleData.created_at).toLocaleDateString(),
        likes: articleData.likesCount || 0,
        content: articleData.content || '',
        tags: articleData.tags || [],
        
        created_at: articleData.created_at,
        updated_at: articleData.updated_at,
        image_id: articleData.image_id
      };
      
      console.log('fetchArticleDetails - selectedArticle after update (id, author_id):', selectedArticle.id, selectedArticle.author_id);
      comments = articleData.comments || [];
    } catch (err) {
      console.error('Error fetching article details:', err);
      error = 'Failed to load article details';
    } finally {
      loading = false;
    }
  }

  async function selectArticle(article) {
    console.log('selectArticle - clicked article (id, author_id):', article.id, article.author_id);
    selectedArticle = article;
    article = { ...article, image_id: newImageId };
    tagFilter = '';
    await fetchArticleDetails(article.id);
  }

   async function handleDeleteArticle(articleId) {
    console.log("used dashboard delete article");
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 从文章列表中移除
        articles = articles.filter(a => a.id !== articleId);
        
        // 如果删除的是当前选中的文章，选择第一篇文章或清空选择
        if (selectedArticle && selectedArticle.id === articleId) {
          if (articles.length > 0) {
            selectedArticle = articles[0];
            await fetchArticleDetails(selectedArticle.id);
          } else {
            selectedArticle = null;
            comments = [];
          }
        }
      } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article');
    }
  }

  async function handleLike() {
    if (!selectedArticle || !user) return;
    
    console.log('ArticleCard - selectedArticle.author_id:', selectedArticle.author_id, 'currentUser?.user?.id:', user?.user?.id, 'isAuthor:', selectedArticle.author_id === user?.user?.id);
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/likes/${selectedArticle.id}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 重新获取文章详情以更新点赞数
        await fetchArticleDetails(selectedArticle.id);
      }
    } catch (err) {
      console.error('Error liking article:', err);
    }
  }

  function handleTagClick(tag) {
    tagFilter = tag;
    searchTerm = '';
  }

  async function handleDeleteComment(id) {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        comments = comments.filter(c => c.id !== id);
   
        await fetchArticleDetails(selectedArticle.id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }

  async function handleSubmitComment(text) {
    if (!selectedArticle || !user) return;
    
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: text,
          article_id: selectedArticle.id
        })
      });
      
      if (response.ok) {
        // 重新获取文章详情以更新评论列表
        await fetchArticleDetails(selectedArticle.id);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  }

  function createArticle() {
   
    window.location.href = '/articles/new';
  }

  // Filtered articles for display based on search term and tag filter
  $: filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
                          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = tagFilter === '' || article.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOrder === 'most_likes') {
      return b.likes - a.likes;
    } else if (sortOrder === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  onMount(() => {
    fetchArticles();
  });
</script>

<style>
  :global(:root) {
    --primary: #2d5b88;
    --primary-dark: #1e4265;
    --secondary: #e6a23c;
    --accent: #d22b2b;
    --light-bg: #f8fafc;
    --card-bg: #ffffff;
    --text-dark: #1a2b3c;
    --text-medium: #4a5568;
    --text-light: #718096;
    --border: #e2e8f0;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s ease;
  }
  
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Open Sans', sans-serif;
  }
  
  :global(body) {
    background-color: var(--light-bg);
    color: var(--text-medium);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  
  .dashboard-bg {
    background: var(--light-bg);
    min-height: 100vh;
    padding: 0;
  }
  
  .main-content {
    display: flex;
    max-width: 1400px;
    margin: 30px auto;
    gap: 30px;
    padding: 0 20px;
  }
  
  .sidebar {
    width: 300px;
    flex-shrink: 0;
    background: var(--card-bg);
    border-radius: 15px;
    box-shadow: var(--shadow);
    padding: 25px;
  }
  
  .sidebar-list {
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    padding: 15px;
    font-size: 14px;
  }
  
  .sidebar-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: var(--transition);
  }
  
  .sidebar-list-item:last-child { 
    border-bottom: none; 
  }
  
  .sidebar-list-item.selected { 
    background: rgba(45, 91, 136, 0.05); 
    font-weight: 600;
    color: var(--primary);
  }
  
  .sidebar-controls {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    position: relative;
  }
  
  .sidebar button {
    border: 1px solid var(--border);
    background: var(--card-bg);
    border-radius: 8px;
    padding: 10px 15px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    color: var(--text-dark);
    flex-grow: 1;
  }
  
  .sidebar button:hover { 
    background: rgba(45, 91, 136, 0.05);
    border-color: var(--primary);
  }
  
  .create-btn {
    border: 2px solid var(--primary);
    color: var(--primary);
    background: var(--card-bg);
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    margin-top: 20px;
    cursor: pointer;
    transition: var(--transition);
    width: 100%;
  }
  
  .create-btn:hover { 
    background: var(--primary);
    color: white;
  }
  
  .article-detail {
    flex: 1;
    min-width: 400px;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
    color: var(--text-light);
    font-style: italic;
  }
  
  .error {
    text-align: center;
    padding: 40px;
    color: var(--accent);
    background: rgba(210, 43, 43, 0.1);
    border-radius: 8px;
    margin: 20px 0;
  }
  
  .no-article {
    text-align: center;
    padding: 60px 40px;
    color: var(--text-light);
  }
  
  .no-article h2 {
    color: var(--text-dark);
    margin-bottom: 10px;
  }

  .search-input-group {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-bottom: 15px;
  }

  .search-input {
    flex-grow: 1;
    padding: 10px 15px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1em;
    color: var(--text-dark);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .sort-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow);
    z-index: 10;
    min-width: 150px;
  }

  .sort-dropdown button {
    width: 100%;
    text-align: left;
    border: none;
    background: none;
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 400;
  }

  .sort-dropdown button:hover {
    background-color: rgba(45, 91, 136, 0.05);
  }

  .sort-dropdown button.selected {
    background-color: rgba(45, 91, 136, 0.1);
    font-weight: 600;
    color: var(--primary);
  }

  .sort-button-container {
    position: relative;
    flex-grow: 1;
  }
</style>

<div class="dashboard-bg">
  
  <div class="main-content">
    <aside class="sidebar">
      <div class="sidebar-controls">
        <div class="sort-button-container">
          <button on:click={() => showSortDropdown = !showSortDropdown}>Sort ▼</button>
          {#if showSortDropdown}
            <div class="sort-dropdown">
              <button class:selected={sortOrder === 'newest'} on:click={() => {sortOrder = 'newest'; showSortDropdown = false;}}>Newest</button>
              <button class:selected={sortOrder === 'oldest'} on:click={() => {sortOrder = 'oldest'; showSortDropdown = false;}}>Oldest</button>
              <button class:selected={sortOrder === 'most_likes'} on:click={() => {sortOrder = 'most_likes'; showSortDropdown = false;}}>Most Likes</button>
              <button class:selected={sortOrder === 'alphabetical'} on:click={() => {sortOrder = 'alphabetical'; showSortDropdown = false;}}>Alphabetical</button>
            </div>
          {/if}
        </div>
        <button on:click={() => showSearchInput = !showSearchInput}>Search</button>
      </div>
      
      {#if showSearchInput}
      <div class="search-input-group">
        <input 
          type="text" 
          placeholder="Search articles..." 
          class="search-input" 
          bind:value={searchTerm}
          on:input={() => tagFilter = ''}
        />
      </div>
      {/if}

      {#if loading}
        <div class="loading">Loading articles...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else}
        <div class="sidebar-list">
          {#each filteredArticles as article}
            <div class="sidebar-list-item {selectedArticle?.id === article.id ? 'selected' : ''}" on:click={() => selectArticle(article)}>
              <div>
                <div>{article.title}</div>
                <div style="font-size:0.9em;color:#888;">{article.author_name || 'Unknown'}</div>
              </div>
              <div style="font-size:0.9em;color:#888;">{new Date(article.created_at).toLocaleDateString()}</div>
            </div>
          {/each}
          {#if filteredArticles.length === 0 && !loading}
            <div class="no-results" style="padding: 15px; text-align: center; color: var(--text-light);">No articles found.</div>
          {/if}
        </div>
      {/if}
      
      <button class="create-btn" on:click={createArticle}>Create</button>
    </aside>
    
    <section class="article-detail">
      {#if selectedArticle}
        <ArticleCard 
          article={selectedArticle}
          isLoggedIn={true}
          currentUser={user}
          onLike={handleLike}
          onDeleteComment={handleDeleteComment}
          onSubmitComment={handleSubmitComment}
          onTagClick={handleTagClick}
          selectedTag={tagFilter}
          onDeleteArticle={handleDeleteArticle}
          isAuthor={selectedArticle.author_id === user?.user?.id}
        />
      {:else if loading}
        <div class="loading">Loading article details...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else}
        <div class="no-article">
          <h2>No articles available</h2>
          <p>Create your first article to get started!</p>
        </div>
      {/if}
    </section>
  </div>
</div>

<svelte:head>
  <title>BlogHub - Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head> 