<script lang="ts">
    import { presentation_formats, submission_statuses } from "$lib/aliases";
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
    <h3>
        {conference.short_name} Submission #{submission.local_id}
    </h3>
    <div>
        <a
            href="author/edit"
            rel="noopener noreferrer"
            class="primary-button-hover outline"
            role="button"
        >
            Edit
        </a>
        <button
            on:click={async () => {
                if (confirm("Do you want to delete submission?"))
                    goto("author/delete");
            }}
            class="button-red outline"
        >
            Delete
        </button>
    </div>
    <table class="w-fit mt-5">
        <tbody>
            <tr>
                <td>Title</td>
                <td>{submission.title}</td>
            </tr>
            <tr>
                <td>Keywords</td>
                <td>
                    {#each submission.keywords.split("\n") as keyword}
                        <span>{keyword}</span>
                        <br />
                    {/each}
                </td>
            </tr>
            <tr>
                <td>Topic</td>
                <td>{submission.topic.name}</td>
            </tr>
            <tr>
                <td>Abstract</td>
                <td>{submission.abstract}</td>
            </tr>
            <tr>
                <td>Submitted at</td>
                <td>{submission.created_at.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Updated at</td>
                <td>{submission.updated_at.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Important Notice</td>
                <td>I confirm that my manuscript can be published</td>
            </tr>
            <tr>
                <td>Presentation Format</td>
                <td>{presentation_formats[submission.presentation_format]}</td>
            </tr>
        </tbody>
    </table>
    <h4 class="text-2xl font-bold">Authors</h4>
    <div class="overflow-auto">
        <table class="striped">
            <thead>
                <tr>
                    <th scope="col" class="text-center">
                        <button>First name</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Last name</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Email</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Country</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Affiliation</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Corresponding</button>
                    </th>
                    <th scope="col" class="text-center">
                        <button>Presenter</button>
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
