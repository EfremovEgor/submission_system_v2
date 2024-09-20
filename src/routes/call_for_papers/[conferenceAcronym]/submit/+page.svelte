<script lang="ts">
    import EnglishForm from "$components/submission/en/englishForm.svelte";
    export let data;
    const userProfile = data.userProfile;
    const conference = data.conference;
</script>

<svelte:head>
    <title>Submission {conference.short_name}</title>
</svelte:head>
<div class="container">
    <EnglishForm userDetails={userProfile} {conference}></EnglishForm>
</div>
