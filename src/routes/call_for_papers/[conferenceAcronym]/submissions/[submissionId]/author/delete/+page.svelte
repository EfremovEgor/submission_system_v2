<script lang="ts">
    import { goto } from "$app/navigation";
    export let data;
    const goBackUrl = data.goBackUrl;
    const submission = data.submission;
    const conference = data.conference;
</script>

<svelte:head>
    <title>Withdrawn Submission #{submission.local_id}</title>
</svelte:head>

<div class="flex justify-center w-full self-center">
    <div class="shadow p-6 rounded w-11/12 sm:w-8/12 lg:w-1/2">
        <div class="lg:ml-10">
            <h1 class="text-center text-red-500">
                Withdrawn Submission #{submission.local_id} in {conference.short_name}
            </h1>
            <h1 class="text-center mt-5">
                <button
                    class="text-center mx-auto"
                    on:click={() => {
                        goto(goBackUrl);
                    }}
                >
                    Go Back
                </button>
            </h1>
        </div>
    </div>
</div>
