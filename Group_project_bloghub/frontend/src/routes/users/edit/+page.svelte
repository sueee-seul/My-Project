<script>
  import EditUser from "../../../lib/components/EditUser.svelte";

    export let data;
</script>
<svelte:head>
    <title>BlogHub - Edit user details</title>
</svelte:head>

<EditUser user={data.loggedInUser}/>