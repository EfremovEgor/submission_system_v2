<script lang="ts">
    import SortableTable from "$components/common/sortableTable/sortableTable.svelte";
    import {
        presentation_formats,
        submission_statuses,
    } from "$src/lib/aliases.js";
    import { formatAuthors } from "$src/lib/utils.client.js";
    export let data;
    let submissions = [];
    const conference = data.conference;
    let mutableSubmissions = submissions;
    data.submissions.forEach((submission) => {
        submissions.push({
            ...submission,
            authors: formatAuthors(submission.authors),
            topic: submission.topic.name,
            created_at: submission.created_at.toLocaleString(),
            status: submission_statuses[submission.status],
            presentation_format:
                presentation_formats[submission.presentation_format],
        });
    });
    let fields = [
        {
            name: "#",
            field: "local_id",
        },
        {
            name: "Authors",
            field: "authors",
        },
        {
            name: "Title",
            field: "title",
        },
        {
            name: "Topic",
            field: "topic",
        },
        {
            name: "Presentation Format",
            field: "presentation_format",
        },
        {
            name: "Submitted At",
            field: "created_at",
        },
        {
            name: "Review Status",
            field: "status",
        },
    ];
</script>

<svelte:head>
    <title>Chair</title>
</svelte:head>
<div class="container">
    <h3>{conference.name}</h3>
    <SortableTable data={mutableSubmissions} {fields} />
</div>
