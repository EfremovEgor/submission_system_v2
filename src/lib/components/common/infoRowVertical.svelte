<script lang="ts">
    export let name: string;
    export let value: string;
    let className: string = "";
    export { className as class };
</script>

<tr class={className}>
    <td class="bg-slate-50 uppercase font-bold px-4 py-3"><p>{name}</p></td>
    <td class="px-4 py-3">
        {#each value.split("\n") as paragraph}
            <p>{paragraph}</p>
        {/each}
    </td>
</tr>
