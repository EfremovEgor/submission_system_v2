<script lang="ts">
    import Pagination from "$components/common/pagination.svelte";
    import { goto } from "$app/navigation";
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
                    <th scope="col" class="px-6 py-3">Short Name</th>
                    <th scope="col" class="px-6 py-3">Name</th>
                    <th scope="col" class="px-6 py-3">Submission deadline</th>
                    <th scope="col" class="px-6 py-3">Start date</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    on:click={() => goto("/")}
                    class="border-b last:border-none cursor-pointer hover:bg-slate-50"
                >
                    <th scope="row" class="px-6 py-3"> SCO/CIS CITS 2025 </th>
                    <td class="px-6 py-3">
                        SCO/CIS Conference on Information and Technical Systems
                    </td>
                    <td class="px-6 py-3"> 30.09.2024 </td>
                    <td class="px-6 py-3"> 02.10.2024 </td>
                </tr>
                <tr
                    on:click={() => goto("/")}
                    class="border-b last:border-none cursor-pointer hover:bg-slate-50"
                >
                    <th scope="row" class="px-6 py-3">
                        5th BRICS SciTech Forum 2024
                    </th>
                    <td class="px-6 py-3">
                        5th BRICS SciTech Forum 2024 on Space Flight Mechanics
                        and Space Structures and Materials
                    </td>
                    <td class="px-6 py-3"> 30.09.2024 </td>
                    <td class="px-6 py-3"> 02.10.2024 </td>
                </tr>
            </tbody>
        </table>
    </div>
    <Pagination callback={onPaginationClick} bind:current amount={10} />
</div>
