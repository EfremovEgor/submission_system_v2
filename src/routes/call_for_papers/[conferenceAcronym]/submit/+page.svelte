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
    <h3>
        New submission for {conference.short_name}
    </h3>
    <EnglishForm userDetails={userProfile} {conference}></EnglishForm>
</div>
