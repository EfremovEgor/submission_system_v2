<script lang="ts">
    export let data;
</script>

<svelte:head>
    <title>LOC</title>
</svelte:head>
<div class="container">
    <h3>LOC</h3>

    <ul>
        {#each data.conferences as conference}
            <li>
                <a
                    href="/call_for_papers/{conference.acronym}/submissions/view/loc"
                    >{conference.name}</a
                >
            </li>
        {/each}
    </ul>
</div>
