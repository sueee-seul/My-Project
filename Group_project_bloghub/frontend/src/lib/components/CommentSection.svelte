<script>
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { onMount } from "svelte";
  import { user as userStore } from '$lib/store/userStore';

  export let comments = [];
  export let currentUser = $userStore.user;
  export let articleId;
  export let onDeleteComment = (id) => {};
  export let onSubmitComment = async (text) => {};
  export let isAuthor = false;
  
  console.log('CommentSection - currentUser:', currentUser);
  console.log('CommentSection - isAuthor:', isAuthor);

  let showComments = true;
  let commentInput = "";
  let showUserSuggestions = false;
  let filteredUserSuggestions = [];
  let users = [];

  async function getUsers() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users`);
      if (response.ok) {
        users = await response.json();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      users = [];
    }
  }

  function handleCommentInput(e) {
    commentInput = e.target.value;
    const atIdx = commentInput.lastIndexOf("@");
    if (atIdx !== -1) {
      const query = commentInput.slice(atIdx + 1).toLowerCase();
      filteredUserSuggestions = users.filter((u) => u.username && u.username.toLowerCase().includes(query));
      showUserSuggestions = filteredUserSuggestions.length > 0;
    } else {
      showUserSuggestions = false;
    }
  }

  function selectUserSuggestion(username) {
    const atIdx = commentInput.lastIndexOf("@");
    commentInput = commentInput.slice(0, atIdx + 1) + username + " ";
    showUserSuggestions = false;
  }

  async function submitComment() {
    if (commentInput.trim()) {
      await onSubmitComment(commentInput);
      commentInput = "";
      await getCommentAuthor();
    }
  }

  async function getCommentAuthor() {
    console.log('Getting comment authors for comments:', comments);
    for (const comment of comments) {
      try {
        let response = await fetch(PUBLIC_API_BASE_URL + "/users/" + comment.user_id);
        if (response.ok) {
          let user = await response.json();
          comment.username = user.username;
          console.log('Set username for comment:', comment.id, 'to:', user.username);
        } else {
          comment.username = 'Unknown User';
          console.log('Failed to get user for comment:', comment.id);
        }
      } catch (error) {
        console.error('Error fetching comment author:', error);
        comment.username = 'Unknown User';
      }
    }
    console.log('Final comments with usernames:', comments);
  }

  async function handleDeleteComment(commentId) {
    onDeleteComment(commentId);
  }

  onMount(async () => {
    await getUsers();
    await getCommentAuthor();
  });
</script>

<div class="comments-section">
  <div class="comments-header" on:click={() => (showComments = !showComments)}>
    Comments <span>{showComments ? "▼" : "▲"}</span>
  </div>

  {#if showComments}
    <div class="comment-list">
      {#each comments as comment}
        <div class="comment-item">
          <span class="comment-author">{comment.username}</span>
          <span>{comment.content}</span>
          <span class="comment-date">{comment.created_at}</span>
          {#if isAuthor || (currentUser && currentUser.user && comment.user_id === currentUser.user.id)}
            <button class="comment-delete" on:click={() => handleDeleteComment(comment.id)}>
              <i class="fas fa-trash"></i>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if currentUser}
    <div class="comment-input-row">
      <input
        class="comment-input"
        type="text"
        placeholder="Write comment"
        bind:value={commentInput}
        on:input={handleCommentInput}
        on:keydown={(e) => e.key === "Enter" && submitComment()}
      />
      <button class="comment-submit" on:click={() => submitComment()}>Enter</button>

      {#if showUserSuggestions}
        <div class="user-suggestions">
          {#each filteredUserSuggestions as user}
            <div class="user-suggestion-item" on:click={() => selectUserSuggestion(user.username)}>
              @{user.username}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .comments-section {
    margin-top: 30px;
    background: var(--card-bg);
    border-radius: 12px;
    padding: 25px;
    box-shadow: var(--shadow);
  }

  .comments-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    margin-bottom: 20px;
    cursor: pointer;
    color: var(--text-dark);
    font-size: 18px;
  }

  .comment-list {
    margin-bottom: 20px;
  }

  .comment-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: var(--light-bg);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .comment-author {
    font-weight: 600;
    color: var(--primary);
  }

  .comment-date {
    font-size: 13px;
    color: var(--text-light);
    margin-left: auto;
  }

  .comment-delete {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
    margin-left: 10px;
    transition: var(--transition);
    padding: 5px;
    border-radius: 4px;
  }

  .comment-delete:hover {
    color: var(--primary-dark);
    background-color: rgba(210, 43, 43, 0.1);
  }

  .comment-input-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    position: relative;
  }

  .comment-input {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 15px;
    font-size: 14px;
    transition: var(--transition);
  }

  .comment-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(45, 91, 136, 0.1);
  }

  .comment-submit {
    border: 2px solid var(--primary);
    background: var(--card-bg);
    color: var(--primary);
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }

  .comment-submit:hover {
    background: var(--primary);
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

  .user-suggestions {
    position: absolute;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-top: 5px;
    z-index: 10;
    width: 220px;
    box-shadow: var(--shadow);
  }

  .user-suggestion-item {
    padding: 12px 15px;
    cursor: pointer;
    transition: var(--transition);
    color: var(--text-dark);
  }

  .user-suggestion-item:hover {
    background: rgba(45, 91, 136, 0.05);
    color: var(--primary);
  }
</style>
