<script lang="ts">
    export let name;
    export let required = true;
    export let label;
    export let placeholder = label;
    export let value: string;
</script>

<label
    class="flex flex-row justify-between font-normal items-center gap-5 mt-5"
>
    <span>
        {label}{#if required}<span class="text-red-500">*</span>{/if}
    </span>
    <input
        class="w-52"
        bind:value
        type="text"
        {placeholder}
        {name}
        {required}
    />
</label>
