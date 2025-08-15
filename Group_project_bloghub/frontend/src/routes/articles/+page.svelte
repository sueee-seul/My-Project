<script>

    import { onMount } from 'svelte';
    import dayjs from 'dayjs';
    import ArticleCard from '$lib/components/ArticleCard.svelte';
    import Tag from '$lib/components/TagPill.svelte';
    import { PUBLIC_API_BASE_URL } from "$env/static/public"
    import { goto } from "$app/navigation";

    export let data;
    
    
    let isLoggedIn = data.isLoggedIn;
    let isLikedAnimating = false;
    let tagFilterValue = "";
    let selectedAuthorId = "";
    let articles = data.articles;
    let users = [];
    let searchKeyword = '';
    let sortOption = 'date';
    let allTags = [];
    let selectedTag = '';
    let matchMod = 'partial';
    let finishedLoadingUsers = false;

    const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;
 
    //bring all tags above filter by Tag
     onMount(async ()=>{
    try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/tags`, {
            credentials: "include"
        });
        if (response.ok) {
            allTags = await response.json();
        } else {
            console.error("Failed to fetch tags:", await response.text());
        }
        } catch (error) {
            console.error("Error fetching tags:", error);
    }
    });

    $: filteredArticles = articles.filter(article => {
        if (selectedAuthorId) {
            return article.author.toLowerCase() === selectedAuthorId.toLowerCase();
        } else if (tagFilterValue) {
            const searchTerm = tagFilterValue.toLowerCase();
            return Array.isArray(article.tags) && article.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        } else if(selectedTag) {
            return article.tags?.includes(selectedTag);
        }
        return true;
    })
    .filter(article=>{
         //add search title or username
        if(!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase().trim();

         //partial or exact text check including ' such as 2025's
         const sanitize = (str) =>
            str.toLowerCase()
              .replace(/[’'".,!?]/g, '')
              .trim();

          const match = (text)=>{
            if(!text) return false;
            
            const sanitizedText = sanitize(text);
            const sanitizedKeyword = sanitize(keyword);            

            if( matchMod === 'exact'){
              const words = sanitizedText.split(/\s+/);
              return words.includes(sanitizedKeyword);  //exact
            }else{
              return sanitizedText.includes(sanitizedKeyword); //partial
            }         
                
        };

         const authorUsername = users.find(u=> u.id === article.author_id)?.username;

         return (
          match(article.title)||
          match(authorUsername)||
          match(article.content)||
          match(dayjs(article.created_at).format('YYYY-MM-DD'))
         );
      })
      
    .sort((a,b)=>{
        if(sortOption === 'title'){
            return a.title.localeCompare(b.title);
        }else if(sortOption === 'username'){

            const userA = users.find(u=> u.id === a.author_id);
            const userB = users.find(u=>u.id === b.author_id);

            const usernameA = userA?.username?.toLowerCase()??'';
            const usernameB = userB?.username?.toLowerCase()??'';
            
            return usernameA.localeCompare(usernameB);

        }else if(sortOption === 'date'){
            return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
    })

    function handleLike(articleId) {
        if (!isLoggedIn) {
            alert('Please log in to like articles.');
            return;
        }
        
        const articleToUpdate = articles.find(article => article.id === articleId);
        if (articleToUpdate) {
            articleToUpdate.likes++;
            articles = [...articles];
        }
        
        isLikedAnimating = true;
        
        setTimeout(() => {
            isLikedAnimating = false;
        }, 300);

    }

    // Add comment deletion feature
    async function handleDeleteComment(commentId) {
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                // Retrieve all articles again to refresh comments
                const articlesResponse = await fetch(`${PUBLIC_API_BASE_URL}/articles`, {
                    credentials: 'include'
                });
                
                if (articlesResponse.ok) {
                    const articlesData = await articlesResponse.json();
                    articles = articlesData.map(article => ({
                        ...article,
                        author: article.author_name || 'Unknown',
                        author_name: article.author_name || 'Unknown',
                        date: new Date(article.created_at).toLocaleDateString(),
                        likes: article.likesCount || 0,
                        tags: article.tags || []
                    }));
                }
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    }

    // post comments
    async function handleSubmitComment(text, articleId) {
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: text,
                    article_id: articleId
                })
            });
            
            if (response.ok) {
                // Reload all articles to refresh comments
                const articlesResponse = await fetch(`${PUBLIC_API_BASE_URL}/articles`, {
                    credentials: 'include'
                });
                
                if (articlesResponse.ok) {
                    const articlesData = await articlesResponse.json();
                    articles = articlesData.map(article => ({
                        ...article,
                        author: article.author_name || 'Unknown',
                        author_name: article.author_name || 'Unknown',
                        date: new Date(article.created_at).toLocaleDateString(),
                        likes: article.likesCount || 0,
                        tags: article.tags || []
                    }));
                }
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
        }
    }

  function handleTagClick(tag) {
    tagFilterValue = tag;
    selectedAuthorId = "";
  }

  onMount(async () => {
    try {
      const response = await fetch(PUBLIC_API_BASE_URL + "/users");
      if (response.ok) {
        users = await response.json();
      } else {
        console.error("Failed to fetch users:", response.status);
        users = [
          { id: "user_neo23", username: "AI in Health" },
          { id: "bluewave9", username: "Deep Ocean" },
          { id: "code_miner", username: "Coding Tips" },
          { id: "eco_warrior", username: "Climate Impact" },
          { id: "homebase77", username: "Remote Work" },
          { id: "dev_sue", username: "Java Basics" },
          { id: "shieldbyte", username: "Cyber Guide" },
          { id: "digimortician", username: "Digital Memory" }
        ];
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      users = [
        { id: "user_neo23", username: "AI in Health" },
        { id: "bluewave9", username: "Deep Ocean" },
        { id: "code_miner", username: "Coding Tips" },
        { id: "eco_warrior", username: "Climate Impact" },
        { id: "homebase77", username: "Remote Work" },
        { id: "dev_sue", username: "Java Basics" },
        { id: "shieldbyte", username: "Cyber Guide" },
        { id: "digimortician", username: "Digital Memory" }
      ];
    }
    for (const user of users) {
      let response = await fetch(PUBLIC_API_BASE_URL + "/subscriptions/" + user.id);
      let result = await response.json()
      user.subCount = result.length;
    }
    finishedLoadingUsers = true;

    document.querySelectorAll(".user-card").forEach((card) => {
      card.addEventListener("click", function () {
        document.querySelectorAll(".user-card").forEach((c) => {
          c.classList.remove("active");
        });
        this.classList.add("active");

        const clickedUserId = this.querySelector(".user-id").textContent.replace("@", "");

        selectedAuthorId = clickedUserId;
        tagFilterValue = "";

        console.log(`User clicked: ${clickedUserId} - Filtering articles.`);
      });
    });

    const firstUserCard = document.querySelector(".user-card");
    if (firstUserCard) {
      firstUserCard.classList.add("active");
    }

    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.addEventListener("click", function (event) {
        const target = event.target;
        const tagPill = target.closest(".tag-pill");
        if (tagPill) {
          const tagText = tagPill.textContent.trim();
          tagFilterValue = tagText;
        }
      });
    }
  });
</script>

<div class="container">
    <aside class="sidebar">
        <div class="sidebar-card">
            <h3 class="card-title">Filter & Search</h3>
            
               <div class="tag-list">
                {#each allTags as tag}
                <Tag
                    tag={tag}
                    selected={selectedTag === tag}
                    onClick={() => {
                    selectedTag = selectedTag === tag ? "" : tag;
                    }}
                />
                {/each}
            </div>
            
            <div class="filter-row">
                <div class="filter-group">
                    <label class="filter-label">
                        <i ctlass="fas fa-sort-amount-down"></i> Sort
                    </label>
                    <select class="filter-select" bind:value={sortOption}>
                         <option value="select">Select</option>
                        <option value="title">Article Title</option>
                        <option value="username">Username</option>
                        <option value="date">Date</option>
                    </select>
                </div>
                
            </div>
        
            <div class="filter-group">
                    <label class="filter-label">
                        <i class="fas fa-search"></i> Search Article
                    </label>
                    <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Type to search..."
                    bind:value={searchKeyword}
                    />
                </div>

                  <!-- matchMod radio button -->
                <div class="match-mode-options" style="margin-top: 0.5rem;">
                    <label>
                        <input type="radio" name="match" value="partial" bind:group={matchMod} />
                        Partial
                    </label>
                    <label style="margin-left: 1rem;">
                        <input type="radio" name="match" value="exact" bind:group={matchMod} />
                        Exact
                    </label>
    
                </div>
        </div>
        
        <div class="sidebar-card">
            <h3 class="card-title">Users</h3>
            {#if finishedLoadingUsers}
            {#each users as user (user.id)}
                <div 
                    class="user-card" 
                    class:active={selectedAuthorId === user.id}
                    on:click={() => goto("/author/" + user.id)}
                >
                    <img class="avatar" src="http://localhost:3000/images/{user.avatar_id}.jpg">
                    <div class="user-info">
                        <div class="username">{user.firstname} {user.lastname}</div>
                        <div class="user-id">@{user.username}</div>
                        <div class="subscribers">{pluralize(user.subCount, "Subscriber")}</div>
                    </div>
                </div>
            {/each}
            {/if}
        </div>
    </aside>

  <main class="main-content">
    {#if !isLoggedIn}
      <div class="login-notice">
        <i class="fas fa-info-circle"></i>
        Please log in to like articles and leave comments.
      </div>
    {/if}

    <div class="article-list">
      {#each filteredArticles as article (article.id)}
        <ArticleCard
          {article}
          {isLoggedIn}
          onLike={() => handleLike(article.id)}
          onTagClick={handleTagClick}
          selectedTag={tagFilterValue}
          currentUser={data.loggedInUser}
          onDeleteComment={handleDeleteComment}
          onSubmitComment={(text) => handleSubmitComment(text, article.id)}
          isAuthor={article.author_id === data.loggedInUser?.user?.id}
        />
      {/each}

      {#if filteredArticles.length === 0}
        <p>No articles found matching the filter.</p>
      {/if}
    </div>
  </main>
</div>

<svelte:head>
  <title>BlogHub - Articles</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

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
    font-family: "Open Sans", sans-serif;
  }

  :global(body) {
    background-color: var(--light-bg);
    color: var(--text-medium);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    width: 100%;
  }

  :global(h1),
  :global(h2),
  :global(h3),
  :global(h4),
  :global(h5),
  :global(h6) {
    font-family: "Montserrat", sans-serif;
    color: var(--text-dark);
    font-weight: 600;
  }

  
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    gap: 30px;
    margin-top: 30px;
  }

  .sidebar {
    width: 300px;
    flex-shrink: 0;
  }

  .sidebar-card {
    background-color: var(--card-bg);
    border-radius: 15px;
    box-shadow: var(--shadow);
    padding: 25px;
    margin-bottom: 25px;
  }

  .card-title {
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--border);
    position: relative;
  }

  .card-title:after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: var(--primary);
  }

  .filter-row {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .filter-group {
    flex: 1;
  }

  .filter-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-dark);
  }

  .filter-select,
  .search-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    background-color: var(--card-bg);
    transition: var(--transition);
  }

  .filter-select:focus,
  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(45, 91, 136, 0.1);
  }

  .user-card {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 10px;
    transition: var(--transition);
    cursor: pointer;
    margin-bottom: 12px;
  }

  .user-card:hover {
    background-color: rgba(45, 91, 136, 0.05);
    transform: translateX(5px);
  }

  .user-card.active {
    background-color: rgba(45, 91, 136, 0.08);
    border-left: 3px solid var(--primary);
  }

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 20px;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
  }

  .username {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 4px;
  }

  .user-id {
    font-size: 14px;
    color: var(--text-light);
    display: flex;
    align-items: center;
  }

  .subscribers {
    font-size: 14px;
    color: var(--text-light);
    display: flex;
    align-items: center;
  }

  .main-content {
    flex: 1;
  }

  .login-notice {
    background-color: rgba(230, 162, 60, 0.15);
    border-left: 4px solid var(--secondary);
    padding: 15px 20px;
    border-radius: 8px;
    color: var(--text-dark);
    margin-bottom: 30px;
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .login-notice i {
    margin-right: 10px;
    font-size: 20px;
    color: var(--secondary);
  }

  

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

 

  @media (max-width: 992px) {
    .container {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
    }

    .filter-row {
      flex-direction: column;
      gap: 15px;
    }
  }

 
  .filter-group {
    flex: 1;
    margin-bottom: 15px;
  }

  .filter-row {
    display: flex;
    gap: 15px;
  }


  @media (max-width: 992px) {
    .filter-row {
      flex-direction: column;
      gap: 15px;
    }
    .filter-group {
      margin-bottom: 0;
    }
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

</style>
