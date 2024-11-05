<script lang="ts">
    import { MoveLeft } from "lucide-svelte";
    let Class = "";
    export { Class as class };
    export let url;
</script>

<a href={url} class="no-underline text-lg{Class}">
    <MoveLeft size={32} /> Back
</a>
