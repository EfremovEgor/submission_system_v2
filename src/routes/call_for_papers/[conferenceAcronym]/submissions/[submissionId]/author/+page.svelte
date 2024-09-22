<script lang="ts">
    import { presentation_formats, submission_statuses } from "$lib/aliases";
    import InfoRow from "$components/common/infoRowVertical.svelte";
    import { Check } from "lucide-svelte";
    import { goto } from "$app/navigation";
    export let data;
    const conference = data.conference;
    const submission = data.submission;
</script>

<svelte:head>
    <title>{conference.short_name} Submission #{submission.local_id}</title>
</svelte:head>
<div class="container">
    <h1 class="page-heading">
        {conference.short_name} Submission #{submission.local_id}
    </h1>
    <div class="mt-5 ml-5 flex flex-row gap-5">
        <a
            href="author/edit"
            rel="noopener noreferrer"
            class="bare-link text-xl hover:no-underline"
        >
            <button class="flex">Edit</button>
        </a>
        <button
            on:click={async () => {
                if (confirm("Do you want to delete submission?"))
                    goto("author/delete");
            }}
            class="bare-link-red text-xl hover:no-underline"
        >
            Delete
        </button>
    </div>
    <table class=" divide-gray-200 mt-5">
        <InfoRow name="Title" value={submission.title} />
        <InfoRow name="Keywords" value={submission.keywords} />
        <InfoRow name="Topic" value={submission.topic.name} />
        <InfoRow name="Abstract" value={submission.abstract} />
        <InfoRow
            name="Submitted At"
            value={submission.created_at.toLocaleString()}
        />
        <InfoRow
            name="Important Notice"
            value="I confirm that my manuscript can be published"
        />
        <InfoRow
            name="Presentation Format"
            value={presentation_formats[submission.presentation_format]}
        />
        <InfoRow
            name="Review status"
            value={submission_statuses[submission.status]}
        />
    </table>
    <h2 class="mt-5 text-2xl font-bold">Authors</h2>
    <div class="mt-5 overflow-auto">
        <table>
            <thead class="bg-slate-50 uppercase font-bold">
                <tr>
                    <th scope="col" class="px-4 py-3"> First name </th>
                    <th scope="col" class="px-4 py-3"> Last name </th>

                    <th scope="col" class="px-4 py-3"> Email </th>
                    <th scope="col" class="px-4 py-3"> Country </th>
                    <th scope="col" class="px-4 py-3"> Affiliation </th>
                    <th scope="col" class="px-4 py-3"> Corresponding </th>
                    <th scope="col" class="px-4 py-3"> Presenter </th>
                </tr></thead
            >
            <tbody>
                {#each submission.authors as author}
                    <tr class="border-b last:border-none hover:bg-slate-50">
                        <td class="px-4 py-3 text-center">
                            {author.first_name}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {author.last_name}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {author.email}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {author.country}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {author.affiliation}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {#if author.is_corresponding}
                                <Check class="mx-auto" />
                            {/if}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {#if author.is_presenter}
                                <Check class="mx-auto" />
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
