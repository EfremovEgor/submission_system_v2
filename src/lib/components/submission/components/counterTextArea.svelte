<script lang="ts">
    export let name: string;
    export let data: string = "";
    export let placeholder: string;
    export let wordCount: number = 0;
    export let required: boolean = true;
    export let maximumWords: number | null = null;
    export let minimumWords: number | null = null;
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

    function handleChange() {
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
