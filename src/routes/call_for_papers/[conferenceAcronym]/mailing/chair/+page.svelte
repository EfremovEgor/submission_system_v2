<script lang="ts">
    import Modal from "$components/common/modal/modal.svelte";
    export let data;
    import CodeMirror from "svelte-codemirror-editor";
    import { html } from "@codemirror/lang-html";
    import { formatAuthors } from "$src/lib/utils.client.js";
    import {
        presentation_formats,
        submission_statuses,
    } from "$src/lib/aliases.js";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";

    const submissions = data.submissions;
    console.log(submissions);
    let allState = false;
    let preview = false;
    let emailHtml = "<h1>Email Template</h1>";
    let subject = "Sample subject";
    let submissionsToDisplay = submissions.map((submission) => {
        return { ...submission, selected: false };
    });
    let settings = {
        mailing: {
            allAuthors: false,
            allCorresponding: true,
        },
    };
</script>

<div class="container">
    <textarea bind:value={subject}></textarea>
    {#if preview}
        <div class="h-1/2 overflow-auto">
            {@html emailHtml}
        </div>
    {:else}
        <CodeMirror
            class="h-[800px] overflow-auto"
            bind:value={emailHtml}
            lang={html()}
        />
    {/if}

    <div class="flex gap-3">
        <article class="flex flex-col justify-between">
            Author -> recipient
            <ul>
                <li>.title</li>
                <li>.first_name</li>
                <li>.last_name</li>
            </ul>
            Example: {"<%= recipient.title %>"} will be Author's title
        </article>
        <article class="flex flex-col justify-between">
            Submission -> submission
            <ul>
                <li>.local_id</li>
                <li>.presentation_format</li>
                <li>.title</li>
                <li>.topic.name</li>
                <li>.link</li>
            </ul>
            Example: {"<%= submission.title %>"} will be Submission title
        </article>
        <article class="flex flex-col justify-between">
            Conference -> conference
            <ul>
                <li>.name</li>
                <li>.short_name</li>
                <li>.presentation_deadline</li>
                <li>.manuscript_deadline</li>
                <li>.site_url</li>
                <li>.confirmation_deadline</li>
            </ul>
            Example: {"<%= submission.title %>"} will be Conference name
        </article>
    </div>
    <button
        class="primary-button-hover outline"
        on:click={() => (preview = !preview)}>Preview</button
    >
    <button
        class="primary-button-hover button-green outline"
        on:click={async () => {
            const selectedSubmissions = submissionsToDisplay
                .filter((submission) => {
                    if (!submission.selected) return false;
                    return true;
                })
                .map((submission) => {
                    return { id: submission.id };
                });
            if (!selectedSubmissions.length) {
                alert("No submissions selected!");
                return;
            }
            const response = await fetch("", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    template: emailHtml,
                    subject,
                    submissions: selectedSubmissions,
                    settings,
                }),
            });
            if (response.ok) alert("Successfully sent emails!");
        }}>Send</button
    >
    <article class="mt-5">
        <label>
            <input
                bind:checked={settings.mailing.allAuthors}
                on:change={() => {
                    if (settings.mailing.allAuthors)
                        settings.mailing.allCorresponding = false;
                }}
                type="checkbox"
            />
            Send to all authors
        </label>
        <label>
            <input
                bind:checked={settings.mailing.allCorresponding}
                on:change={() => {
                    if (settings.mailing.allCorresponding)
                        settings.mailing.allAuthors = false;
                }}
                type="checkbox"
            />
            Send to all corresponding
        </label>
    </article>
    <article class="mt-5">
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (submission.status == "accepted")
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all accepted
        </label>
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (
                            submission.status == "accepted" &&
                            !submission.particiaption_confirmed &&
                            !submission.withdrawn
                        )
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all accepted (not confirmed)
        </label>
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (
                            submission.status == "accepted" &&
                            submission.particiaption_confirmed
                        )
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all accepted (confirmed)
        </label>
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (
                            submission.status == "accepted" &&
                            submission.particiaption_confirmed &&
                            !submission.presentation_file_id
                        )
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all confirmed (without presentation)
        </label>
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (
                            submission.status == "accepted" &&
                            submission.withdrawn
                        )
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all accepted (withdrawn)
        </label>
        <label>
            <input
                type="radio"
                name="acceptedSubmissionsVariety"
                on:change={() => {
                    submissionsToDisplay.forEach((submission) => {
                        if (
                            submission.status == "accepted" &&
                            !submission.manuscript_file_id &&
                            submission.particiaption_confirmed
                        )
                            submission.selected = true;
                        else submission.selected = false;
                    });
                    submissionsToDisplay = submissionsToDisplay;
                }}
            />
            Select all without uploaded manuscript
        </label>
    </article>
    <div class="overflow-auto mt-5">
        <table class="striped">
            <thead>
                <tr>
                    <td class="text-center">
                        <input
                            type="checkbox"
                            on:change={() => {
                                allState = !allState;
                                submissionsToDisplay.forEach((submission) => {
                                    submission.selected = allState;
                                });
                                console.log(submissionsToDisplay);
                                submissionsToDisplay = submissionsToDisplay;
                            }}
                        />
                    </td>
                    <td class="text-center"> # </td>
                    <td class="text-center"> Authors </td>
                    <td class="text-center"> Title </td>
                    <td class="text-center"> Topic </td>
                    <td class="text-center"> Presentation Format </td>
                    <td class="text-center"> Status </td>
                    <td class="text-center"> Presentation Uploaded </td>
                    <td class="text-center"> Manuscript Uploaded</td>
                </tr>
            </thead>
            <tbody>
                {#each submissionsToDisplay as submission}
                    <tr>
                        <td class="text-center">
                            <input
                                type="checkbox"
                                bind:checked={submission.selected}
                            />
                        </td>
                        <td class="text-center"> {submission.local_id} </td>
                        <td class="text-center"
                            >{formatAuthors(submission.authors)}</td
                        >
                        <td class="text-center"> {submission.title} </td>
                        <td class="text-center"> {submission.topic.name} </td>
                        <td class="text-center">
                            {presentation_formats[
                                submission.presentation_format
                            ]}
                        </td>
                        <td class="text-center">
                            <SubmissionStatusText status={submission.status} />
                            {#if submission.withdrawn}
                                <br /><span style="color:var(--red)">
                                    {submission_statuses.withdrawn}
                                </span>
                            {:else if submission.particiaption_confirmed}
                                <br /><span style="color:var(--green)">
                                    {submission_statuses.particiaption_confirmed}
                                </span>
                            {/if}
                        </td>
                        <td class="text-center">
                            {submission.presentation_file_id ? "Yes" : "No"}
                        </td>
                        <td class="text-center">
                            {submission.manuscript_file_id ? "Yes" : "No"}</td
                        >
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    table * {
        font-size: 16px !important;
    }
    td {
        padding: 5px !important;
    }
    details > div * {
        font-size: 16px;
    }

    table > thead * {
        padding: 5px !important;
    }
    .symposiums * {
        padding: 0 !important;
    }
    table * {
        padding: 10px;
    }
</style>
