<script lang="ts">
    import EnglishEditForm from "$components/submission/en/englishEditForm.svelte";
    export let data;
    const userProfile = data.userProfile;
    const conference = data.conference;
    const submission = data.submission;
    const authors = data.authors;
    if (submission != data.submission) {
    }
</script>

<svelte:head>
    <title>Submission {conference.short_name}</title>
</svelte:head>
<div class="container">
    <EnglishEditForm
        submission={{
            title: submission.title,
            abstarct: submission.abstract,
            keywords: submission.keywords,
            topic: submission.topic_id,
            presentation_format: submission.presentation_format,
            local_id: submission.local_id,
            funding: submission.funding,
        }}
        {authors}
        userDetails={userProfile}
        {conference}
    ></EnglishEditForm>
</div>
