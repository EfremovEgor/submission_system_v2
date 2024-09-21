<script lang="ts">
    import { enhance } from "$app/forms";
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import AccountLayout from "$components/layout/account/accountLayout.svelte";
    import { titles } from "$src/lib/aliases.js";
    export let data;
    $: user = data.userProfile;
</script>

<svelte:head>
    <title>Account</title>
</svelte:head>
<AccountLayout userProfile={user}></AccountLayout>
