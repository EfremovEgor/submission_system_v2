<script lang="ts">
    import { presentation_formats } from "$lib/aliases";
    import { Check } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    export let data;
    const conference = data.conference;
    const submission = data.submission;
    const rights = data.rights;
</script>

<svelte:head>
    <title>{conference.short_name} Submission #{submission.local_id}</title>
</svelte:head>
<div class="container">
    <h3>
        {conference.short_name} Submission #{submission.local_id}
    </h3>
    <div>
        <a href="/author" class="primary-button-hover outline" role="button">
            Back
        </a>
        {#if rights.canEdit}
            <a
                href="author/edit"
                class="primary-button-hover outline"
                role="button"
            >
                Edit
            </a>
        {/if}
        {#if rights.canDelete}
            <button
                on:click={async () => {
                    if (confirm("Do you want to delete submission?"))
                        goto("author/delete");
                }}
                class="button-red outline"
            >
                Delete
            </button>
        {/if}
    </div>
    <table class="w-fit mt-5">
        <tbody>
            <tr>
                <td class="font-semibold">Title</td>
                <td>{submission.title}</td>
            </tr>
            <tr>
                <td class="font-semibold">Keywords</td>
                <td>
                    {#each submission.keywords.split("\n") as keyword}
                        <span>{keyword}</span>
                        <br />
                    {/each}
                </td>
            </tr>
            <tr>
                <td class="font-semibold">Topic</td>
                <td>{submission.topic.name}</td>
            </tr>
            <tr>
                <td class="font-semibold">Abstract</td>
                <td>{submission.abstract}</td>
            </tr>
            <tr>
                <td class="font-semibold">Submitted at</td>
                <td>{submission.created_at.toLocaleString()}</td>
            </tr>
            <tr>
                <td class="font-semibold">Updated at</td>
                <td>{submission.updated_at.toLocaleString()}</td>
            </tr>
            <tr>
                <td class="font-semibold">Important Notice</td>
                <td>I confirm that my manuscript can be published</td>
            </tr>
            <tr>
                <td class="font-semibold">Presentation Format</td>
                <td>{presentation_formats[submission.presentation_format]}</td>
            </tr>
            <tr>
                <td class="font-semibold">Review Status</td>
                <td> <SubmissionStatusText status={submission.status} /></td>
            </tr>
        </tbody>
    </table>
    <h4 class="text-2xl font-bold">Authors</h4>
    <div class="overflow-auto">
        <table class="striped">
            <thead>
                <tr>
                    <th scope="col" class="text-center">
                        <span>First name</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Last name</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Email</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Country</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Affiliation</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Corresponding</span>
                    </th>
                    <th scope="col" class="text-center">
                        <span>Presenter</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each submission.authors as author}
                    <tr>
                        <td class="text-center">
                            {author.first_name}
                        </td>
                        <td class="text-center">
                            {author.last_name}
                        </td>
                        <td class="text-center">
                            {author.email}
                        </td>
                        <td class="text-center">
                            {author.country}
                        </td>
                        <td class="text-center">
                            {author.affiliation}
                        </td>
                        <td class="text-center">
                            {#if author.is_corresponding}
                                <Check class="mx-auto" />
                            {/if}
                        </td>
                        <td class="text-center">
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
