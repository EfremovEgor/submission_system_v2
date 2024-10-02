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
    wordCount = data?.trim().split(/\s+/).length;
    export let counterFunction: "whitespace" | "newline" = "whitespace";

    const counterFunctions = {
        whitespace: () => {
            wordCount = data.trim().split(/\s+/).length;
        },
        newline: () => {
            wordCount = data.trim().split(/\r\n|\r|\n/).length;
        },
    };

    if (data.trim() == "") {
        wordCount = 0;
    } else {
        counterFunctions[counterFunction]();
    }

    function handleChange(event) {
        preventLanguages(allowedLanguages, event);
        if (data.trim() == "") {
            wordCount = 0;
        } else {
            counterFunctions[counterFunction]();
        }
    }
</script>

<div class="relative w-full">
    <textarea
        class="m-0 pr-8 w-full {maximumWords != null
            ? wordCount >= maximumWords
                ? 'invalid'
                : ''
            : ''} 
            {minimumWords != null
            ? wordCount < minimumWords
                ? 'invalid'
                : ''
            : ''}"
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
        cols="30"
        rows="10"
    />

    <p class="absolute bottom-2 right-5">{wordCount}</p>
</div>
