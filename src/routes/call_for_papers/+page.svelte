<script lang="ts">
    import Pagination from "$components/common/pagination.svelte";
    import { goto } from "$app/navigation";
    export let data;
    const conferences = data.conferences;
    let current = 0;
    function onPaginationClick(page: number) {
        current = page;
    }
</script>

<svelte:head>
    <title>Call For Papers</title>
</svelte:head>
<div class="container">
    <h3>Call For Papers</h3>
    <div class="overflow-auto">
        <table class="striped">
            <thead>
                <tr>
                    <th scope="col">Short Name</th>
                    <th scope="col">Name</th>
                    <th scope="col">Submission deadline</th>
                    <th scope="col">Start date</th>
                </tr>
            </thead>

            <tbody>
                {#each conferences as conference}
                    <tr>
                        <th scope="row">
                            <a href="/call_for_papers/{conference.acronym}"
                                >{conference.short_name}</a
                            >
                        </th>
                        <td>
                            {conference.name}
                        </td>
                        <td>
                            {conference.start_date?.toLocaleDateString()}
                        </td>
                        <td>
                            {conference.submission_deadline?.toLocaleDateString()}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <!-- <Pagination callback={onPaginationClick} bind:current amount={10} /> -->
</div>
