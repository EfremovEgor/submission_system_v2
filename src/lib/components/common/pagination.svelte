<script lang="ts">
    // @ts-nocheck

    export let amount: number;
    export let current: number = 0;
    export let callback: CallableFunction = (page: number) => {};

    let arrayToRender: Array = [];
    function changePagination() {
        arrayToRender = [];

        const start = current >= 4 ? current - 1 : 0;
        let stop = current >= 4 ? current + 2 : 5;
        if (current + 3 >= amount) stop = amount;

        for (let pageIndex = start; pageIndex < stop; pageIndex++) {
            arrayToRender.push(pageIndex);
        }
    }
    $: current, changePagination();
</script>

<div class="mt-5 pagination flex justify-center">
    {#if current != 0}
        <span
            on:click={() => {
                callback(parseInt(current - 1));
            }}
            on:keydown={() => {
                callback(parseInt(current - 1));
            }}
            tabindex="0"
            role="link"
            class="px-3 py-1 first:rounded-l select-none
            last:rounded-r border hover:bg-slate-50 cursor-pointer"
        >
            Previous
        </span>
    {/if}

    {#if current >= 4}
        <span
            on:click={(event) => {
                callback(event.target.getAttribute("pagenumber"));
            }}
            on:keydown={(event) => {
                callback(event.target.getAttribute("pagenumber"));
            }}
            tabindex="0"
            role="link"
            pagenumber="0"
            class="px-3 py-1 first:rounded-l
            select-none
            last:rounded-r border hover:bg-slate-50 cursor-pointer"
        >
            1
        </span>
        <span class="px-3 py-1 border select-none">...</span>
    {/if}
    {#each arrayToRender as value}
        <span
            on:click={(event) => {
                callback(parseInt(event.target.getAttribute("pagenumber")));
            }}
            on:keydown={(event) => {
                callback(parseInt(event.target.getAttribute("pagenumber")));
            }}
            tabindex="0"
            role="link"
            pagenumber={value}
            class="px-3 py-1 first:rounded-l select-none
            {value == current ? 'bg-slate-50' : ''} 
            last:rounded-r border hover:bg-slate-50 cursor-pointer"
        >
            {value + 1}
        </span>
    {/each}
    {#if current + 2 < amount - 1}
        <span class="px-3 py-1 border select-none">...</span>

        <span
            on:click={(event) => {
                callback(event.target.getAttribute("pagenumber"));
            }}
            on:keydown={(event) => {
                callback(event.target.getAttribute("pagenumber"));
            }}
            tabindex="0"
            role="link"
            pagenumber={amount - 1}
            class="px-3 py-1 first:rounded-l
            select-none
            last:rounded-r border hover:bg-slate-50 cursor-pointer"
        >
            {amount}
        </span>
    {/if}
    {#if current != amount - 1}
        <span
            on:click={() => {
                callback(parseInt(current + 1));
            }}
            on:keydown={() => {
                callback(parseInt(current + 1));
            }}
            tabindex="0"
            role="link"
            class="px-3 py-1 first:rounded-l
            select-none
            last:rounded-r border hover:bg-slate-50 cursor-pointer"
        >
            Next
        </span>
    {/if}
</div>
