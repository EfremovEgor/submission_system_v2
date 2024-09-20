<script>
    export let checked = false;
    export let name;
</script>

<label class="flex flex-row font-normal items-center gap-5">
    Corresponding Author
    <input type="checkbox" bind:checked {name} />
</label>
