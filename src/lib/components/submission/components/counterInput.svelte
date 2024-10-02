<script lang="ts">
    import { preventLanguages } from "$src/lib/utils.client";

    export let name: string;
    export let data: string = "";
    export let placeholder: string;
    export let wordCount: number = 0;
    export let required: boolean = true;
    export let maximumWords: number | null = null;
    export let minimumWords: number | null = null;
    export let allowedLanguages: Array<string> | null = ["en"];
    wordCount = data.trim() == "" ? 0 : data.trim().split(/\s+/).length;

    function handleChange(event) {
        wordCount = data.trim() == "" ? 0 : data.trim().split(/\s+/).length;
        preventLanguages(allowedLanguages, event);
    }
</script>

<div class="relative w-full">
    <input
        class="pr-12 w-full m-0 {maximumWords != null
            ? wordCount >= maximumWords
                ? 'invalid'
                : ''
            : ''} 
            {minimumWords != null
            ? wordCount < minimumWords
                ? 'invalid'
                : ''
            : ''}"
        type="text"
        on:keydown={(event) => {
            preventLanguages(allowedLanguages, event);
        }}
        on:keyup={handleChange}
        on:change={handleChange}
        on:input={handleChange}
        bind:value={data}
        {placeholder}
        {name}
        {required}
    />
    <p class="absolute bottom-1 right-5">{wordCount}</p>
</div>
