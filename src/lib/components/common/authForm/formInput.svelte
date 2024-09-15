<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    export let id: string;
    export let name: string;
    export let label: string;
    export let required: boolean = true;
    export let type: string = "text";
    export let autocomplete: string = "on";
    export let error: string | null = null;
</script>

<div class="input-container mt-2 w-full">
    <label for={id}>{label}{required ? "*" : ""}</label><input
        class="w-full"
        {type}
        {id}
        {name}
        {required}
        {autocomplete}
    />
    {#if error}
        {#each error as err}
            <span class="text-red-500">{err}</span>
        {/each}
    {/if}
</div>
