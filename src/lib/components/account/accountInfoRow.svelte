<script lang="ts">
    export let name: string;
    export let value: any | null;
</script>

<section class="flex flex-row justify-between gap-4">
    <span class="basis-1/3">{name}</span>
    <span class="basis-2/3">{value ?? ""}</span>
</section>
