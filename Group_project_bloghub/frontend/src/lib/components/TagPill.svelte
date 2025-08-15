<script>
  export let tag = '';
  export let selected = false;
  export let onClick = () => {};
</script>

<style>
  .tag-pill {
    display: inline-block;
    padding: 6px 12px;
    margin: 10px 5px;
    background-color: rgba(45, 91, 136, 0.1);
    color: var(--primary-dark);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid var(--primary);
  }

  .tag-pill:hover {
    background-color: rgba(45, 91, 136, 0.15);
  }

  .tag-pill.selected {
    background-color: var(--primary);
    color: white;
  }
</style>

<span class="tag-pill" class:selected on:click={() => onClick(tag)}>
  {tag}
</span> 