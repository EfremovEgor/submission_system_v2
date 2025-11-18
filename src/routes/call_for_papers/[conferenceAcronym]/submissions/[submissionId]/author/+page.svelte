<script lang="ts">
    import { submission_statuses } from "$src/lib/aliases";
    import BackButton from "$components/common/buttons/backButton.svelte";
    import { presentation_formats } from "$lib/aliases";
    import { Check } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import { applyAction, enhance } from "$app/forms";
    import SubmitButton from "$components/common/submitButton.svelte";
    export let data;
    const conference = data.conference;
    $: submission = data.submission;
    const rights = data.rights;
    let presentationUploadFormBusy = false;
    let manuscriptUploadFormBusy = false;
</script>

<svelte:head>
    <title>{conference.short_name} Submission #{submission.local_id}</title>
</svelte:head>
<div class="container">
    <div class="mb-2">
        <BackButton url="/author" />
    </div>
    <h3>
        Submission #{submission.local_id} for {conference.short_name}
    </h3>
    <div>
        {#if !submission.withdrawn}
            {#if submission.status == "accepted" && !submission.particiaption_confirmed && new Date() < conference.confirmation_deadline}
                <button
                    class="button-green primary-button-hover outline"
                    on:click={async () => {
                        let response;
                        if (confirm("Confirm presentation?"))
                            response = await fetch("", {
                                method: "POST",
                                body: JSON.stringify({ action: "confirm" }),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            });
                        if (response?.ok) {
                            alert("Your presentation will be confirmed!");
                            await invalidateAll();
                        }
                    }}
                >
                    Confirm
                </button>
            {/if}
            {#if new Date() <= new Date(conference.submission_deadline.getTime() + 60 * 60 * 21 * 1000 - 1)}
                {#if rights.canEdit}
                    <a
                        href="author/edit"
                        class="primary-button-hover outline"
                        role="button"
                    >
                        Edit
                    </a>
                {/if}
            {/if}

            {#if rights.canDelete && !submission.particiaption_confirmed}
                <button
                    on:click={async () => {
                        if (confirm("Your presentation will be withdrawn!"))
                            goto("author/delete");
                    }}
                    class="button-red outline"
                >
                    Withdraw
                </button>
            {/if}

            <a
                href="#upload_manager"
                class="primary-button-hover outline"
                role="button"
            >
                Upload Manager
            </a>
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
                <td style="white-space: pre-wrap; word-wrap: break-word;"
                    >{submission.abstract}</td
                >
            </tr>
            <tr>
                <td class="font-semibold">Funding Information</td>
                <td style="white-space: pre-wrap; word-wrap: break-word;"
                    >{submission.funding}</td
                >
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
            {#if submission.withdrawn}
                <tr>
                    <td class="font-semibold">Presentation status</td>
                    <td>
                        <span style="color:var(--red)"
                            >{submission_statuses.withdrawn}</span
                        >
                    </td>
                </tr>
            {/if}
            {#if submission.particiaption_confirmed}
                <tr>
                    <td class="font-semibold">Presentation Status</td>
                    <td>
                        <span style="color:var(--green)"
                            >{submission_statuses.particiaption_confirmed}</span
                        >
                    </td>
                </tr>
            {/if}
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
    {#if !submission.withdrawn && rights.canUpload}
        <h4 id="upload_manager" class="font-bold">Upload Manager</h4>

        <form
            use:enhance={({ formElement, formData, action, cancel }) => {
                presentationUploadFormBusy = true;
                return async ({ result }) => {
                    presentationUploadFormBusy = false;
                    await invalidateAll();
                    return;
                };
            }}
            id="presentationUploadForm"
            action="?/presentation"
            method="post"
            enctype="multipart/form-data"
        >
            <h5>Presentation</h5>
            <div class="flex flex-row gap-3 items-center">
                <label class="m-0" aria-disabled={presentationUploadFormBusy}>
                    <span
                        aria-busy={presentationUploadFormBusy}
                        role="button"
                        class="block whitespace-nowrap primary-button-hover outline"
                    >
                        {#if submission.presentation_file}
                            Update File
                        {:else}
                            Add File
                        {/if}
                    </span>
                    <input
                        on:change={(event) => {
                            if (
                                event.target.files[0].name.split(".").pop() !=
                                "pptx"
                            ) {
                                alert("File extension must be .pptx");
                                event.preventDefault();
                                return;
                            }
                            document.forms.presentationUploadForm.requestSubmit();
                        }}
                        required
                        name="file"
                        hidden
                        type="file"
                        accept=".pptx"
                    />
                </label>
                <span>
                    {#if submission.presentation_file}
                        <a
                            style="color:var(--green);
                            text-decoration-color:var(--green)"
                            href="/uploads/{submission.presentation_file.id}"
                            download="{conference.acronym}-presentation-{submission.local_id}.pptx"
                        >
                            {submission.presentation_file.original_name}
                        </a>
                    {:else}
                        Empty
                    {/if}
                </span>
            </div>
            <small>Please upload your presentation in .pptx format</small>
        </form>
        <br />
        <form
            id="manuscriptUploadForm"
            action="?/manuscript"
            method="post"
            enctype="multipart/form-data"
            use:enhance={({ formElement, formData, action, cancel }) => {
                manuscriptUploadFormBusy = true;
                return async ({ result }) => {
                    manuscriptUploadFormBusy = false;
                    await invalidateAll();
                    return;
                };
            }}
        >
            <h5>Manuscript</h5>
            <div class="flex flex-row gap-3 items-center">
                <label class="m-0" aria-disabled={manuscriptUploadFormBusy}>
                    <span
                        aria-busy={manuscriptUploadFormBusy}
                        role="button"
                        class="block whitespace-nowrap primary-button-hover outline"
                    >
                        {#if submission.manuscript_file}
                            Update File
                        {:else}
                            Add File
                        {/if}
                    </span>
                    <input
                        on:change={(event) => {
                            if (
                                event.target.files[0].name.split(".").pop() !=
                                "docx"
                            ) {
                                alert("File extension must be .docx");
                                event.preventDefault();
                                return;
                            }
                            document.forms.manuscriptUploadForm.requestSubmit();
                        }}
                        required
                        name="file"
                        hidden
                        type="file"
                        accept=".docx"
                    />
                </label>
                <span>
                    {#if submission.manuscript_file}
                        <a
                            style="color:var(--green);
                            text-decoration-color:var(--green)"
                            href="/uploads/{submission.manuscript_file.id}"
                            download="{conference.acronym}-manuscript-{submission.local_id}.docx"
                        >
                            {submission.manuscript_file.original_name}
                        </a>
                    {:else}
                        Empty
                    {/if}
                </span>
            </div>
            <small class="max-w-80"
                >Please, upload your manuscript in .docx format. <br />
                Manuscript template and format instructions could be downloaded by
                the following
                <a
                    href="https://spacescitech.com/files/manuscript_template.docx"
                    >link</a
                >.<br /> The document should not exceed 20 pages.</small
            >
        </form>
    {/if}
</div>
