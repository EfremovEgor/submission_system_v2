<script lang="ts">
    export let name: string;
    export let required: boolean = true;
    export let label: string;
    export let value: string;
    export let placeholder: string;

    import { getNames } from "country-list";
    let countries = getNames();
    countries.sort();
</script>

<label class="flex flex-row justify-between font-normal items-center gap-5">
    <span>
        {label}{#if required}<span class="text-red-500">*</span>{/if}
    </span>
    <select {required} {placeholder} bind:value {name} style="width: 200px;">
        <option selected disabled value hidden>{placeholder}</option>
        {#each countries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
</label>
