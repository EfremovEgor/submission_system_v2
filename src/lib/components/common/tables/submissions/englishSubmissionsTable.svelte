<script lang="ts">
    import AccountInfoRow from "$components/account/accountInfoRow.svelte";
    import DownloadPdf from "$components/common/icons/downloadPDF.svelte";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import {
        presentation_formats,
        submission_statuses,
    } from "$src/lib/aliases";
    import { generateSubmissionsXLSX } from "$src/lib/generators/excel/submissions_list";
    import { generateSubmissionsWord } from "$src/lib/generators/word/submissions_list.client";
    import { MIME_TYPES } from "$src/lib/mime_types";
    import { formatAuthors, getFileExtension } from "$src/lib/utils.client";
    import { Search } from "lucide-svelte";
    export let conference: {
        acronym: string;
    };
    export let submissionViewRoleSuffix: string;
    export let submissions: {
        id: number;
        local_id: number;
        title: string;
        presentation_format: string;
        created_at: Date;
        status: string;
        topic: {
            name: string;
        };
        withdrawn: boolean;
        particiaption_confirmed: boolean;
        authors: {
            first_name: string;
            last_name: string;
            country: string;
            affiliation: string;
        }[];
        presentation_file?: {
            id: string;
            file_name: string;
            original_name: string;
            path: string;
            uploaded_at: Date;
            uploaded_by_id: number;
        };
        manuscript_file?: {
            id: string;
            file_name: string;
            original_name: string;
            path: string;
            uploaded_at: Date;
            uploaded_by_id: number;
        };
    }[];
    export let topics: object = {};
    export let symposiums: object = {};

    let submissionsToDisplay = submissions;

    let showedTopics = {};
    if (Object.keys(symposiums).length != 0)
        Object.values(symposiums).forEach((symposium) => {
            Object.keys(symposium).forEach(
                (topic) => (showedTopics[topic] = true),
            );
        });
    else {
        Object.keys(topics).forEach((t) => (showedTopics[t] = true));
    }
    function sortSubmissions(field, reverse = 0) {
        function compare(a, b) {
            let compareBy = field;
            if (compareBy == "topic") {
                a = a[compareBy];
                b = b[compareBy];

                compareBy = "name";
            }

            if (a[compareBy] < b[compareBy]) {
                return -1;
            }
            if (a[compareBy] < b[compareBy]) {
                return 1;
            }
            return 0;
        }
        submissionsToDisplay.sort(compare);
        if (reverse) submissionsToDisplay.reverse();
        submissionsToDisplay = submissionsToDisplay;
    }

    function filterByTopics() {
        submissionsToDisplay = [];
        submissions.forEach((submission) => {
            if (showedTopics[submission.topic.name])
                submissionsToDisplay.push(submission);
        });
    }
</script>

{#if Object.keys(symposiums).length != 0}
    <div class="symposiums">
        {#each Object.keys(symposiums) as symposium}
            <tr>
                <details open>
                    <summary style="width: fit-content;">{symposium}</summary>
                    <table class="striped">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th
                                    class="text-center"
                                    style="padding:5px !important; padding-left:15px!important"
                                >
                                    <strong style="color:var(--green)">
                                        •
                                    </strong>
                                </th>
                                <th
                                    class="text-center"
                                    style="padding:5px !important"
                                >
                                    +
                                </th>
                                <th
                                    class="text-center"
                                    style="padding:5px !important"
                                >
                                    -
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each Object.keys(symposiums[symposium]) as topic}
                                <tr>
                                    <td>
                                        <input
                                            bind:checked={showedTopics[topic]}
                                            on:change={() => filterByTopics()}
                                            type="checkbox"
                                        /></td
                                    >
                                    <td>{topic}</td>
                                    <td style="padding-left: 10px;">
                                        {symposiums[symposium][topic]}
                                    </td>
                                    <td
                                        style="padding:5px !important; padding-left:15px!important"
                                        class="text-center"
                                    >
                                        {submissions.reduce(
                                            (accumulator, submission) => {
                                                if (
                                                    submission.topic.name ==
                                                        topic &&
                                                    submission.status ==
                                                        "accepted"
                                                )
                                                    return accumulator + 1;
                                                return accumulator;
                                            },
                                            0,
                                        )}
                                    </td>
                                    <td
                                        style="padding:5px !important;"
                                        class="text-center"
                                    >
                                        {submissions.reduce(
                                            (accumulator, submission) => {
                                                if (
                                                    submission.topic.name ==
                                                        topic &&
                                                    submission.particiaption_confirmed
                                                )
                                                    return accumulator + 1;
                                                return accumulator;
                                            },
                                            0,
                                        )}
                                    </td>
                                    <td
                                        style="padding:5px !important;"
                                        class="text-center"
                                    >
                                        {submissions.reduce(
                                            (accumulator, submission) => {
                                                if (
                                                    submission.topic.name ==
                                                        topic &&
                                                    submission.withdrawn
                                                )
                                                    return accumulator + 1;
                                                return accumulator;
                                            },
                                            0,
                                        )}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </details>
            </tr>
        {/each}
    </div>
{:else}
    <div class="symposiums">
        <table class="striped" style="width: fit-content;">
            <thead>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th
                        class="text-center"
                        style="padding:5px !important; padding-left:15px!important"
                    >
                        <strong style="color:var(--green)"> • </strong>
                    </th>
                    <th class="text-center" style="padding:5px !important">
                        +
                    </th>
                    <th class="text-center" style="padding:5px !important">
                        -
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each Object.keys(topics) as topic}
                    <tr>
                        <td>
                            <input
                                bind:checked={showedTopics[topic]}
                                on:change={() => filterByTopics()}
                                type="checkbox"
                            /></td
                        >
                        <td>{topic}</td>
                        <td style="padding-left: 10px;">
                            {topics[topic]}
                        </td>
                        <td
                            style="padding:5px !important; padding-left:15px!important"
                            class="text-center"
                        >
                            {submissions.reduce((accumulator, submission) => {
                                if (
                                    submission.topic.name == topic &&
                                    submission.status == "accepted"
                                )
                                    return accumulator + 1;
                                return accumulator;
                            }, 0)}
                        </td>
                        <td style="padding:5px !important;" class="text-center">
                            {submissions.reduce((accumulator, submission) => {
                                if (
                                    submission.topic.name == topic &&
                                    submission.particiaption_confirmed
                                )
                                    return accumulator + 1;
                                return accumulator;
                            }, 0)}
                        </td>
                        <td style="padding:5px !important;" class="text-center">
                            {submissions.reduce((accumulator, submission) => {
                                if (
                                    submission.topic.name == topic &&
                                    submission.withdrawn
                                )
                                    return accumulator + 1;
                                return accumulator;
                            }, 0)}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<span>
    Displayed: {submissionsToDisplay.length}/{submissions.length} <br />
</span>
<button
    on:click={() => {
        const element = document.createElement("a");
        const file = new Blob([generateSubmissionsXLSX(submissionsToDisplay)], {
            type: MIME_TYPES[".xlsx"],
        });
        element.setAttribute("href", window.URL.createObjectURL(file));
        element.setAttribute("download", `${conference.acronym}-submissions`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }}
    class="bare-button">Export to Excel</button
>
<br />
<button
    on:click={async () => {
        const element = document.createElement("a");
        const file = new Blob(
            [
                await generateSubmissionsWord({
                    submissions: submissionsToDisplay.filter(
                        ({ status }) => status == "accepted",
                    ),
                    conference: {
                        acronym: conference.acronym,
                    },
                }),
            ],
            {
                type: MIME_TYPES[".docx"],
            },
        );
        element.setAttribute("href", window.URL.createObjectURL(file));
        element.setAttribute("download", `${conference.acronym}-submissions`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }}
    class="bare-button">Export to Docx</button
>
<div class="overflow-auto">
    <table class="striped">
        <thead>
            <tr>
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "local_id",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>#</button
                    ></th
                >
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "authors",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>Authors</button
                    ></th
                >
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "title",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>Title</button
                    ></th
                >
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "topic",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>Topic</button
                    ></th
                >
                <th scope="col">
                    <button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "presentation_format",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>Presentation Format</button
                    >
                </th>
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "created_at",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}>Submitted at</button
                    ></th
                >
                <th scope="col"
                    ><button class="sortable bare-button">View</button></th
                >
                <th scope="col"
                    ><button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "status",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}
                    >
                        Status</button
                    ></th
                >
                <th class="text-center">
                    <button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "presentation_file",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}
                        >Presentation
                    </button>
                </th>
                <th class="text-center">
                    <button
                        class="sortable bare-button"
                        data-order={0}
                        on:click={(element) => {
                            sortSubmissions(
                                "manuscript_file",
                                element.target["data-order"],
                            );

                            element.target["data-order"] =
                                !element.target["data-order"];
                        }}
                        >Manuscript
                    </button>
                </th>
            </tr>
        </thead>

        <tbody>
            {#each submissionsToDisplay as submission}
                <tr>
                    <td>
                        {submission.local_id}
                    </td>
                    <td>
                        {formatAuthors(submission.authors)}
                    </td>
                    <td>
                        {submission.title}
                    </td>
                    <td class="text-center">
                        {submission.topic.name}
                    </td>
                    <td class="text-center">
                        {presentation_formats[submission.presentation_format]}
                    </td>
                    <td class="text-center">
                        {submission.created_at.toLocaleString()}
                    </td>
                    <td>
                        <a
                            href="/call_for_papers/{conference.acronym}/submissions/{submission.id}/{submissionViewRoleSuffix}"
                            target="_blank"
                            class="icon-button text-center"
                        >
                            <Search class="mx-auto" />
                        </a>
                        <a
                            href="/pdf/submissions/{submission.id}"
                            target="_blank"
                            class="icon-button text-center"
                            download="{conference.acronym}-abstract-{submission.local_id}.pdf"
                        >
                            <DownloadPdf class="mx-auto" />
                        </a>
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
                        {#if submission.presentation_file}
                            <a
                                style="color:var(--green);
                        text-decoration-color:var(--green)"
                                href="/uploads/{submission.presentation_file
                                    .id}"
                                download="{conference.acronym}-presentation-{submission.local_id}.pptx"
                            >
                                Yes
                            </a>
                        {:else}
                            <span style="color:var(--red)">No</span>
                        {/if}
                    </td>
                    <td class="text-center">
                        {#if submission.manuscript_file}
                            <a
                                style="color:var(--green);
                        text-decoration-color:var(--green)"
                                href="/uploads/{submission.manuscript_file.id}"
                                download="{conference.acronym}-manuscript-{submission.local_id}.{getFileExtension(
                                    submission.manuscript_file.original_name,
                                )}"
                            >
                                Yes
                            </a>
                        {:else}
                            <span style="color:var(--red)">No</span>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
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
