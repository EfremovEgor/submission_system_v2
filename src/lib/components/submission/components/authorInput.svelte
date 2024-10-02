<script lang="ts">
    import { preventLanguages } from "$src/lib/utils.client";

    export let name;
    export let required = true;
    export let label;
    export let placeholder = label;
    export let value: string;
    export let allowedLanguages: Array<string> | null = ["en"];
</script>

<label class="flex flex-row justify-between font-normal items-center gap-5">
    <span>
        {label}{#if required}<span class="text-red-500">*</span>{/if}
    </span>
    <input
        style="width: 200px;"
        bind:value
        on:keydown={(event) => {
            preventLanguages(allowedLanguages, event);
        }}
        on:change={(event) => {
            preventLanguages(allowedLanguages, event);
        }}
        type="text"
        {placeholder}
        {name}
        {required}
    />
</label>
