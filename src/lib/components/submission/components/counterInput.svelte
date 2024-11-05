<script lang="ts">
    import {
        languageIsAvailable,
        preventLanguages,
    } from "$src/lib/utils.client";

    export let name: string;
    export let data: string = "";
    export let placeholder: string;
    export let wordCount: number = 0;
    export let required: boolean = true;
    export let maximumWords: number | null = null;
    export let minimumWords: number | null = null;
    export let allowedLanguages: Array<string> | null = ["en"];
    wordCount = data.trim() == "" ? 0 : data.trim().split(/\s+/).length;
    let isValid = false;
    function handleChange(event) {
        wordCount = data.trim() == "" ? 0 : data.trim().split(/\s+/).length;
        isValid = languageIsAvailable(allowedLanguages, data);
        preventLanguages(allowedLanguages, event);
    }
</script>

<div class="relative w-full">
    <input
        class="pr-12 w-full m-0"
        style="background-image:none"
        aria-invalid={!isValid ||
            (maximumWords != null && wordCount > maximumWords) ||
            (minimumWords != null && wordCount < minimumWords)}
        type="text"
        on:keydown={handleChange}
        on:keyup={handleChange}
        on:change={handleChange}
        on:input={handleChange}
        on:paste={handleChange}
        bind:value={data}
        {placeholder}
        {name}
        {required}
    />
    <p
        class="absolute bottom-1 right-5"
        style={!isValid ||
        (maximumWords != null && wordCount > maximumWords) ||
        (minimumWords != null && wordCount < minimumWords)
            ? "color:var(--red)"
            : "color:var(--green)"}
    >
        {wordCount}
    </p>
</div>
