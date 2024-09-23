<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    export let Class: string = "";
    export let onClick: MouseEventHandler<HTMLButtonElement> = (event) => {};
</script>

<button class="primary-button-hover outline {Class}" on:click={onClick}>
    <slot />
</button>
