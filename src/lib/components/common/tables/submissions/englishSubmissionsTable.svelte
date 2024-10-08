<script lang="ts">
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import { presentation_formats } from "$src/lib/aliases";
    import { formatAuthors } from "$src/lib/utils.client";
    import { Search } from "lucide-svelte";
    export let conference: {
        acronym: string;
    };
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
        authors: {
            first_name: string;
            last_name: string;
        }[];
    }[];
    export let topics: object = {};
    export let symposiums: object = {};

    let submissionsToDisplay = submissions;

    let showedTopics = {};
    Object.values(symposiums).forEach((symposium) => {
        Object.keys(symposium).forEach((topic) => (showedTopics[topic] = true));
    });
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

{#if symposiums}
    <details open>
        <summary class="w-fit">Choose Topic</summary>
        <div>
            {#each Object.keys(symposiums) as symposium}
                <tr>
                    <details>
                        <summary style="width: fit-content;"
                            >{symposium}</summary
                        >
                        <table class="striped">
                            <tbody>
                                {#each Object.keys(symposiums[symposium]) as topic}
                                    <tr>
                                        <td
                                            ><input
                                                bind:checked={showedTopics[
                                                    topic
                                                ]}
                                                on:change={() =>
                                                    filterByTopics()}
                                                type="checkbox"
                                            /></td
                                        >
                                        <td>{topic}</td>
                                        <td style="padding-left: 10px;"
                                            >{symposiums[symposium][topic]}</td
                                        >
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </details>
                </tr>
            {/each}
        </div>
    </details>
{/if}
<span>Displayed: {submissionsToDisplay.length}/{submissions.length} <br /></span
>
<button class="bare-button">Export to Excel</button>
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
                        }}>Review Status</button
                    ></th
                >
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
                            href="/call_for_papers/{conference.acronym}/submissions/{submission.id}/chair"
                            class="icon-button text-center"
                        >
                            <Search class="mx-auto" />
                        </a>
                    </td>
                    <td class="text-center">
                        <SubmissionStatusText status={submission.status} />
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    details > div * {
        font-size: 16px;
    }

    table > thead * {
        padding: 5px !important;
    }
    details > div * {
        padding: 0;
    }
    table * {
        padding: 10px;
    }
</style>
