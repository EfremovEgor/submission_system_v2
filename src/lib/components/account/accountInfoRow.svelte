<script lang="ts">
    export let name: string;
    export let value: any | null;
    export let isEditing: boolean = false;
    export let required: boolean = false;
</script>

<tr>
    <td class="basis-1/3"
        >{name}{#if isEditing && required}
            <span class="text-red-500">*</span>
        {/if}</td
    >
    {#if isEditing}
        <td><slot /></td>
    {:else}
        <td>{value ?? ""}</td>
    {/if}
</tr>
