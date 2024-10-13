<script lang="ts">
    export let data;
</script>

<svelte:head>
    <title>Chair</title>
</svelte:head>
<div class="container">
    <h3>Chair</h3>

    <ul>
        {#each data.conferences as conference}
            <li>
                <a
                    href="/call_for_papers/{conference.acronym}/submissions/view/chair"
                    >{conference.name}</a
                >
            </li>
        {/each}
    </ul>
</div>
