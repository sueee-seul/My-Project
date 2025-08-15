<script>
  import "$lib/css/app.css";
  import "$lib/css/variables.css";
  import { page } from "$app/stores";
  import Navbar from "../lib/components/Navbar.svelte";
  import { user as userStore } from '$lib/store/userStore';

  export let data;
  $: path = $page.url.pathname;

  $: if (data?.loggedInUser) {
    userStore.set(data.loggedInUser);
  } else {
    userStore.set(null);
  }
</script>

{#key data.unreadCount}
  <Navbar unreadCount={data.unreadCount}/>
{/key}
<slot />

<svelte:head>
  <!-- Font Awesome -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
  <!-- Google Fonts: Montserrat & Open Sans -->
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>