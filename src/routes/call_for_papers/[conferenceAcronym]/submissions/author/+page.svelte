<script lang="ts">
    import { presentation_formats } from "$lib/aliases";
    import { submission_statuses } from "$lib/aliases";
    import { Search } from "lucide-svelte";
    export let data;
    const conference = data.conference;
    const submissions = data.submissions;
</script>

<svelte:head>
    <title>My submissions in {conference.short_name}</title>
</svelte:head>
<div class="container">
    <h1 class="page-heading">
        My submissions in {conference.short_name}
    </h1>
    <div class="overflow-auto">
        <table class="mt-5">
            <thead class="bg-slate-50 uppercase font-bold">
                <tr>
                    <th scope="col" class="px-4 py-3"> # </th>
                    <th scope="col" class="px-4 py-3"> Authors </th>

                    <th scope="col" class="px-4 py-3"> Title </th>
                    <th scope="col" class="px-4 py-3"> Topic </th>
                    <th scope="col" class="px-4 py-3"> Presentation Format </th>
                    <th scope="col" class="px-4 py-3"> Submitted At </th>
                    <th scope="col" class="px-4 py-3"> View </th>
                    <th scope="col" class="px-4 py-3"> Review status </th>
                </tr></thead
            >
            <tbody class="text-center">
                {#each submissions as submission}
                    <tr class="border-b last:border-none hover:bg-slate-50">
                        <td class="px-4 py-3">
                            {submission.local_id}
                        </td>
                        <td class="px-4 py-3">
                            {#each submission.authors as author}
                                <p>{author.first_name} {author.last_name}</p>
                            {/each}
                        </td>
                        <td class="px-4 py-3">
                            {submission.title}
                        </td>
                        <td class="px-4 py-3">
                            {submission.topic.name}
                        </td>
                        <td class="px-4 py-3">
                            {presentation_formats[
                                submission.presentation_format
                            ]}
                        </td>
                        <td class="px-4 py-3">
                            {submission.created_at.toLocaleString()}
                        </td>
                        <td class="px-4 py-3">
                            <a href="{submission.id}/author">
                                <Search class="mx-auto" />
                            </a>
                        </td>
                        <td class="px-4 py-3">
                            {submission_statuses[submission.status]}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
