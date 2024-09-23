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
        aria-invalid={error ? true : undefined}
        style="margin: 0;"
        class="w-full {error ? 'invalid' : 'valid'}"
        {type}
        {id}
        {name}
        {required}
        {autocomplete}
    />
    <div>
        {#if error}
            {#each error as err}
                <small style="color: var(--pico-del-color)">{err}</small> <br />
            {/each}
        {/if}
    </div>
</div>
