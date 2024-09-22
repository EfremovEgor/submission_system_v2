<script lang="ts">
    export let name: string;
    export let value: any | null;
    export let isEditing = false;
</script>

<section class="flex items-center flex-row justify-between gap-4">
    <span class="basis-1/3">{name}</span>
    {#if isEditing}
        <div class="basis-2/3"><slot /></div>
    {:else}
        <span class="basis-2/3">{value ?? ""}</span>
    {/if}
</section>
