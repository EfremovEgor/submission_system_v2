<script lang="ts">
    import { submission_statuses } from "$src/lib/aliases";

    export let status;
    let Class = "";
    export { Class as class };
    const statusToColors = {
        submitted: "var(--pico-color)",
        under_review: "var(--orange)",
        rejected: "var(--red)",
        accepted: "var(--green)",
    };
</script>

<span class={Class} style="color:{statusToColors[status]}"
    >{submission_statuses[status]}</span
>
