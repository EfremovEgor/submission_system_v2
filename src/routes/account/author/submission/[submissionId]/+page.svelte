<script lang="ts">
    export let data;
    const submission = data.submission;
    console.log(submission);
</script>

<svelte:head>
    <title>Submission {submission.title}</title>
</svelte:head>
