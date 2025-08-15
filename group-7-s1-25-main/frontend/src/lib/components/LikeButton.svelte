<script>
  export let likes = 0;
  export let onLike = () => {};
  export let isAnimating = false;
  export let isLoggedIn = false;
  export let isLiked = false;
  export let isOwner = false;
</script>

<style>
  .like-container {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(210, 43, 43, 0.1);
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
    user-select: none;
    width: fit-content;
  }
  
  .like-container:hover {
    background: rgba(210, 43, 43, 0.15);
    transform: translateY(-1px);
  }
  
  .like-container:active {
    transform: translateY(0);
    background: rgba(210, 43, 43, 0.2);
  }
  
  .like-count {
    font-weight: 600;
    font-size: 16px;
    color: var(--accent);
    font-family: 'Montserrat', sans-serif;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.3s ease;
  }
  
  .like-count i {
    font-size: 16px;
    color: var(--accent);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease;
  }
  
  .like-count i.liked {
    animation: pulse 0.3s ease-in-out;
  }

  .like-count.animating-text {
    color: #ff6b00;
    transform: scale(1.1);
    transition: transform 0.3s ease, color 0.3s ease;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
</style>


<div class="like-container" 
on:click={() => {
  if(isOwner) return;
  if (!isLoggedIn) {
    alert('Please log in to like articles.');
    return;
  }
  onLike();
}}
>
  <span class="like-count" class:animating-text={isAnimating}>
  {#if isLoggedIn}
  {#if isLiked}
    <i class="fas fa-heart liked"></i>  <!-- filled heart -->
  {:else}
    <i class="far fa-heart"></i>        <!--empty heart -->
  {/if}
  {:else}
  <i class="far fa-heart"></i>   <!--empty heart -->
  {/if}
  {likes}
</span>

</div> 