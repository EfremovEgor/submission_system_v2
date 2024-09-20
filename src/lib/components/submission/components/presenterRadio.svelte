<script lang="ts">
    export let checked: boolean;
    export let name: string;
    export let authorId: number;
    export let changePresenterCallback: CallableFunction;
</script>

<label class="flex flex-row font-normal items-center gap-5">
    Presenter

    <input
        required
        type="radio"
        on:click={() => {
            changePresenterCallback(authorId);
        }}
        {checked}
        value={authorId}
        {name}
    />
</label>
