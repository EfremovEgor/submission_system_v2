<script lang="ts">
    import BackButton from "$components/common/buttons/backButton.svelte";
    import EnglishSubmissionsTable from "$components/common/tables/submissions/englishSubmissionsTable.svelte";
    export let data;
    let submissions = data.submissions;
    const conference = data.conference;
    const topics = {};
    const symposiums = {};
    if (data.symposiums)
        data.symposiums.forEach((symposium) => {
            symposiums[symposium.name] = {};
            symposium.topics.forEach(
                (topic) => (symposiums[symposium.name][topic.name] = 0),
            );
        });

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
    <title>LOC</title>
</svelte:head>
<div class="container">
    <div class="mb-2">
        <BackButton url="/chair" />
    </div>
    <h3>{conference.name}</h3>
    <EnglishSubmissionsTable
        submissionViewRoleSuffix="loc"
        {submissions}
        {topics}
        {symposiums}
        {conference}
    />
</div>
