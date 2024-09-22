<script lang="ts">
    import { goto } from "$app/navigation";
    import { Search } from "lucide-svelte";
    export let data;
    const conferences = data.conferencesSubmittedIn;
</script>

<svelte:head>
    <title>Author</title>
</svelte:head>
<div class="container">
    <h1 class="page-heading">My submissions</h1>
    {#if conferences.length}
        <p class="text-lg">Choose conference to view submissions.</p>
    {:else}
        <p class="text-lg">There are no submissions yet.</p>
    {/if}
    <div class="mt-5">
        {#if conferences.length}
            <table>
                <thead class="bg-slate-50 uppercase font-bold">
                    <tr>
                        <th scope="col" class="px-4 py-3"> Short name </th>
                        <th scope="col" class="px-4 py-3"> Start Date </th>

                        <th scope="col" class="px-4 py-3"> View </th>
                    </tr></thead
                >
                <tbody>
                    {#each conferences as conference}
                        <tr class="border-b last:border-none hover:bg-slate-50">
                            <td class="px-4 py-3">
                                {conference.short_name}
                            </td>
                            <td class="px-4 py-3">
                                {conference.start_date.toLocaleDateString()}
                            </td>
                            <td class="px-4 py-3">
                                <a
                                    href="/call_for_papers/{conference.acronym}/submissions/author"
                                >
                                    <Search class="mx-auto" /></a
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <a class="reverse-nav-link w-fit" href="/call_for_papers"
                >Make a new submission</a
            >
        {/if}
    </div>
</div>
