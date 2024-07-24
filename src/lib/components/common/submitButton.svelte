<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    export let Class: string = "";
    export let onClick: MouseEventHandler<HTMLButtonElement> = (event) => {};
</script>

<button
    class="bg-blue-700 font-medium p-2 hover:bg-blue-900 text-white rounded-xl {Class}"
    on:click={onClick}
>
    <slot />
</button>
