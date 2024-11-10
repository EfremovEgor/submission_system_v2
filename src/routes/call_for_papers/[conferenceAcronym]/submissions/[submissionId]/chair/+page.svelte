<script lang="ts">
    import BackButton from "$components/common/buttons/backButton.svelte";
    import { presentation_formats, submission_statuses } from "$lib/aliases";
    import { Check } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { Search } from "lucide-svelte";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import DownloadPdf from "$components/common/icons/downloadPDF.svelte";
    export let data;
    const conference = data.conference;
    const submission = data.submission;
    const rights = data.rights;
</script>

<svelte:head>
    <title>{conference.short_name} Submission #{submission.local_id}</title>
</svelte:head>
<div class="container">
    <div class="mb-2">
        <BackButton
            url="/call_for_papers/{conference.acronym}/submissions/view/chair"
        />
    </div>
    <h3>
        Submission #{submission.local_id} for {conference.short_name}
    </h3>
    <div>
        <a href="chair/edit" class="primary-button-hover outline" role="button">
            Edit
        </a>
        <button
            on:click={async () => {
                if (confirm("Do you want to delete submission?"))
                    goto("chair/delete");
            }}
            class="button-red outline"
        >
            Withdraw
        </button>
        {#if submission.status != "accepted"}
            <button class="button-green outline">Accept</button>
        {/if}
        {#if submission.status != "rejected"}
            <button class="button-red outline">Reject</button>
        {/if}
        <a
            href="/pdf/submissions/{submission.id}"
            target="_blank"
            role="button"
            class="primary-button-hover outline"
        >
            Download PDF
        </a>
    </div>
    <h4 class="mt-4">Submission details</h4>
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
                <td style="white-space: pre-wrap; word-wrap: break-word;">
                    {submission.abstract}
                </td>
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
    <h4 class="font-bold">Authors</h4>
    <div class="overflow-auto">
        <table class="striped small-table">
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
