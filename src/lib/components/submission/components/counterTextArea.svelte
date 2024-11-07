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
    wordCount = data?.trim().split(/\s+/).length;
    export let counterFunction: "whitespace" | "newline" = "whitespace";
    let isValid = true;

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
        if (counterFunction == "newline")
            isValid = languageIsAvailable(allowedLanguages, data, {
                type: "onlyLettersAndNumbers",
            });
        else isValid = languageIsAvailable(allowedLanguages, data);
    }
</script>

<div class="relative w-full">
    <textarea
        style="background-image:none"
        class="m-0 pr-8 w-full"
        aria-invalid={!isValid ||
            (maximumWords != null && wordCount > maximumWords) ||
            (minimumWords != null && wordCount < minimumWords)}
        on:keydown={(event) => {
            preventLanguages(allowedLanguages, event);
        }}
        on:keyup={handleChange}
        on:change={handleChange}
        on:input={handleChange}
        on:paste={handleChange}
        bind:value={data}
        {placeholder}
        {name}
        {required}
        cols="30"
        rows="10"
    />

    <p
        class="absolute bottom-2 right-5"
        style={!isValid ||
        (maximumWords != null && wordCount > maximumWords) ||
        (minimumWords != null && wordCount < minimumWords)
            ? "color:var(--red)"
            : "color:var(--green)"}
    >
        {wordCount}
    </p>
</div>
