<script lang="ts">
    import { submission_statuses } from "$lib/aliases";
    import { enhance } from "$app/forms";
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import AccountLayout from "$components/layout/account/accountLayout.svelte";
    import { titles } from "$src/lib/aliases.js";
    import { goto } from "$app/navigation";
    export let data;
    const userProfile = data.userProfile;
    const submissions = data.submissions;
</script>

<svelte:head>
    <title>Author</title>
</svelte:head>
<AccountLayout {userProfile}>
    <table>
        <thead class="bg-slate-50 uppercase font-bold">
            <tr>
                <th
                    scope="col"
                    class="px-4 py-3"
                    data-svelte-h="svelte-1s4esz1"
                >
                    #
                </th>
                <th
                    scope="col"
                    class="px-4 py-3"
                    data-svelte-h="svelte-1s4esz1"
                >
                    Conference short name
                </th>
                <th
                    scope="col"
                    class="px-4 py-3"
                    data-svelte-h="svelte-1oxp7tj"
                >
                    Title
                </th>
                <th
                    scope="col"
                    class="px-4 py-3 text-center"
                    data-svelte-h="svelte-dfrbpp">Review status</th
                >
                <th
                    scope="col"
                    class="px-4 py-3 text-center"
                    data-svelte-h="svelte-zc9zhv">Created at</th
                ></tr
            ></thead
        >
        <tbody>
            {#each submissions as submission}
                <tr
                    on:click={() => goto(`author/submission/${submission.id}`)}
                    class="border-b last:border-none cursor-pointer hover:bg-slate-50"
                >
                    <th scope="row" class="px-4 py-3">
                        {submission.local_id}
                    </th>
                    <th scope="row" class="px-4 py-3">
                        {submission.conference.short_name}
                    </th>
                    <td class="px-4 py-3">
                        {submission.title}
                    </td>
                    <td class="px-4 py-3 text-center">
                        {submission_statuses[submission.status]}
                    </td>
                    <td class="px-4 py-3 text-center">
                        {submission.created_at?.toLocaleString()}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</AccountLayout>
