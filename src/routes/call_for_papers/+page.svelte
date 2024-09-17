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

<div class="container">
    <h1 class="page-heading">Call For Papers</h1>
    <div class="overflow-x-auto min-h-36 mt-5 rounded-lg">
        <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 uppercase font-bold">
                <tr>
                    <th scope="col" class="px-4 py-3">Short Name</th>
                    <th scope="col" class="px-4 py-3">Name</th>
                    <th scope="col" class="px-4 py-3 text-center"
                        >Submission deadline</th
                    >
                    <th scope="col" class="px-4 py-3 text-center">Start date</th
                    >
                </tr>
            </thead>

            <tbody>
                {#each conferences as conference}
                    <tr
                        on:click={() =>
                            goto(`/call_for_papers/${conference.acronym}`)}
                        class="border-b last:border-none cursor-pointer hover:bg-slate-50"
                    >
                        <th scope="row" class="px-4 py-3">
                            {conference.short_name}
                        </th>
                        <td class="px-4 py-3">
                            {conference.name}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {conference.start_date?.toLocaleDateString()}
                        </td>
                        <td class="px-4 py-3 text-center">
                            {conference.submission_deadline?.toLocaleDateString()}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <!-- <Pagination callback={onPaginationClick} bind:current amount={10} /> -->
</div>
