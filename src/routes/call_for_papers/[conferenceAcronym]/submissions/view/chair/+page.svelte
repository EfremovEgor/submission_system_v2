<script lang="ts">
    import EnglishSubmissionsTable from "$components/common/tables/submissions/englishSubmissionsTable.svelte";
    export let data;
    let submissions = data.submissions;
    const conference = data.conference;
    const topics = {};
    const symposiums = {};
    submissions.forEach((submission) => {
        if (submission.topic.symposium.name) {
            if (!(submission.topic.symposium.name in symposiums))
                symposiums[submission.topic.symposium.name] = {};
            if (
                !(
                    submission.topic.name in
                    symposiums[submission.topic.symposium.name]
                )
            )
                symposiums[submission.topic.symposium.name][
                    submission.topic.name
                ] = 1;
            else
                symposiums[submission.topic.symposium.name][
                    submission.topic.name
                ] += 1;
        } else {
            if (!(submission.topic.name in topics))
                topics[submission.topic.name] = 1;
            else topics[submission.topic.name] += 1;
        }
    });
</script>

<svelte:head>
    <title>Chair</title>
</svelte:head>
<div class="container">
    <h3>{conference.name}</h3>
    <EnglishSubmissionsTable {submissions} {topics} {symposiums} {conference} />
</div>
