<script lang="ts">
    export let name: string;
    export let required: boolean = true;
    export let label: string;
    export let value: string;
    export let placeholder: string;
    export let options: object;
</script>

<label class="flex flex-row justify-between font-normal items-center gap-5">
    <span>
        {label}{#if required}<span class="text-red-500">*</span>{/if}
    </span>
    <select bind:value {required} {placeholder} {name} style="width: 200px;">
        <option selected disabled value hidden>{placeholder}</option>
        {#each Object.entries(options) as [_value, alias]}
            <option value={_value}>{alias}</option>
        {/each}
    </select>
</label>
