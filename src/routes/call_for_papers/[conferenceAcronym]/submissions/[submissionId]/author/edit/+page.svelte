<script lang="ts">
    import EnglishForm from "$components/submission/en/englishForm.svelte";
    export let data;
    const userProfile = data.userProfile;
    const conference = data.conference;
    const submission = data.submission;
    const authors = data.authors;
</script>

<svelte:head>
    <title>Submission {conference.short_name}</title>
</svelte:head>
<div class="container">
    <EnglishForm
        submission={{
            title: submission.title,
            abstarct: submission.abstract,
            keywords: submission.keywords,
            topic: submission.topic_id,
            presentation_format: submission.presentation_format,
            local_id: submission.local_id,
        }}
        isEditing={true}
        {authors}
        userDetails={userProfile}
        {conference}
    ></EnglishForm>
</div>
