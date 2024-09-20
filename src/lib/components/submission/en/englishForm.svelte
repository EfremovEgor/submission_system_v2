<script lang="ts">
    import { presentation_formats } from "$lib/aliases";
    import { type form } from "./interfaces";
    import CounterInput from "./../components/counterInput.svelte";
    import { onMount } from "svelte";
    import AuthorForm from "./author/authorForm.svelte";
    import type { IAuthor } from "./author/interfaces";
    import CounterTextArea from "../components/counterTextArea.svelte";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    let busy = false;
    let authors: Array<IAuthor> = [];
    let submission: form = {
        title: "",
        abstarct: "",
        keywords: "",
        topic: -1,
        presentation_format: "",
    };

    const resolveAuthorsIds = () => {
        authors.forEach((author, index) => {
            author.id = index;
        });
        authors = authors;
    };
    export let userDetails;
    export let conference;
    onMount(() => {
        addNewAuthor();
        addNewAuthor();
    });
    const removeAuthor = (position: number) => {
        authors.splice(position, 1);
        resolveAuthorsIds();
        authors = authors;
    };
    const addNewAuthor = () => {
        let author: IAuthor = {
            id: authors.length,
            title: "",
            first_name: "",
            last_name: "",
            email: "",
            country: "",
            affiliation: "",
            web_page: "",
            is_corresponding: false,
            is_presenter: false,
        };
        if (authors.length == 0) {
            author.is_corresponding = true;
            author.is_presenter = true;
        }

        authors = [...authors, author];
    };
    const changePresenterCallback = (index: number) => {
        authors.forEach((author) => {
            author.is_presenter = author.id == index;
        });
        authors = authors;
    };
</script>

{#if busy}
    <h1>Loading...</h1>
{:else}
    <form
        method="POST"
        use:enhance={({ formElement, formData, action, cancel }) => {
            formData.append("authors", JSON.stringify(authors));
            busy = true;
            return async ({ result }) => {
                if (result.status == 200) {
                    return;
                }
                busy = false;
                if (result.type == "redirect") {
                    goto(result.location);
                }
            };
        }}
    >
        <h1 class="text-3xl">New Submission for {conference.short_name}</h1>
        <h2 class="text-2xl mt-5">Authors Information</h2>
        <article class="text-lg">
            For each author, please fill out the form below. Some items on the
            form are explained here:
            <ul class="pl-10 mt-2 list-disc">
                <li class="">
                    <strong>Email address</strong> will only be used for communication
                    with the authors. It will not appear in public Web pages of this
                    conference.
                </li>
                <li>
                    <strong>Web page</strong> can be used on the conference web pages,
                    for example, for making the program. It should be a Web page
                    of the author, not the web page of her or his organization.
                </li>
                <li>
                    One of the authors should be marked as a
                    <strong>Presenter</strong>. If you are not sure, make your
                    best choice, it could be updated later.
                </li>
                <li>
                    Each author marked as a <strong>Corresponding author</strong
                    > will receive email messages from the system about this submission
                    and updated information about this event. There must be at least
                    one Corresponding author.
                </li>
            </ul>
        </article>
        <div class="mt-5 flex items-center flex-wrap gap-4">
            {#each authors as author, index}
                <AuthorForm
                    {changePresenterCallback}
                    deleteCallback={index ? removeAuthor : null}
                    {author}
                    {userDetails}
                />
            {/each}
        </div>
        <button
            type="button"
            class="button mt-5"
            on:click={() => {
                addNewAuthor();
            }}>Add new author</button
        >
        <h2 class="text-2xl mt-5">Title and Abstract</h2>
        <article class="text-lg">
            <p>
                Abstracts must be written in plain text and must not contain
                tables, figures, photographs or HTML elements.
            </p>
        </article>
        <section class="shadow-lg p-5 mt-5">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label
                class="flex flex-row justify-between font-normal items-center gap-5"
            >
                <span>Title<span class="text-red-500">*</span></span>
                <div class="basis-5/6">
                    <CounterInput
                        bind:data={submission.title}
                        name="title"
                        minimumWords={1}
                        maximumWords={30}
                        placeholder="Not more than 30 words"
                    />
                </div>
            </label>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label
                class="flex flex-row justify-between font-normal items-center gap-5 mt-5"
            >
                <span>Abstract<span class="text-red-500">*</span></span>
                <div class="basis-5/6">
                    <CounterTextArea
                        bind:data={submission.abstarct}
                        minimumWords={3}
                        name="abstract"
                        maximumWords={500}
                        placeholder="Not more than 500 words"
                    />
                </div>
            </label>
        </section>
        <section class="shadow-lg p-5 mt-5">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label
                class="flex flex-row justify-between font-normal items-center gap-5 mt-5"
            >
                <span>Keywords<span class="text-red-500">*</span></span>
                <div class="basis-5/6">
                    <CounterTextArea
                        bind:data={submission.keywords}
                        counterFunction="newline"
                        name="keywords"
                        minimumWords={3}
                        placeholder="Not less than 3 keywords. One per line"
                    />
                </div>
            </label>
        </section>
        <h2 class="text-2xl mt-5">Topics<span class="text-red-500">*</span></h2>
        <article class="text-lg">
            <p>Choose preferable topic for your paper.</p>
        </article>
        <section class="shadow-lg p-5 mt-5">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <div class="flex flex-col gap-2">
                {#each conference.symposiums as symposium}
                    <div>
                        <h2 class="font-bold">{symposium.name}</h2>
                        {#each symposium.topics as topic}
                            <label
                                class="font-normal flex flex-row align-middle gap-3 mt-1"
                            >
                                <input
                                    bind:group={submission.topic}
                                    type="radio"
                                    value={topic.id}
                                    required
                                    name="topic"
                                />
                                {topic.name}
                            </label>
                        {/each}
                    </div>
                {/each}
            </div>
        </section>
        <label class="font-normal flex flex-row align-middle gap-3 mt-5"
            ><h2 class="text-2xl">
                Presentation format<span class="text-red-500">*</span>
            </h2>
            <select
                required
                bind:value={submission.presentation_format}
                name="presentation_format"
            >
                <option selected disabled hidden value="">Choose</option>
                {#each conference.settings.presentation_formats as format}
                    <option value={format}
                        >{presentation_formats[format]}</option
                    >
                {/each}
            </select>
        </label>
        <h2 class="text-2xl mt-5">
            Important Notice<span class="text-red-500">*</span>
        </h2>
        <article class="text-lg">
            <p>
                It is the responsibility of authors to obtain any required
                government or company reviews and/or clearances of their paper
                prior to submission, as well as any necessary reprinting
                permissions.
            </p>
        </article>
        <label class="font-normal flex flex-row align-middle gap-3 mt-5">
            <input type="checkbox" name="can_be_published" required />
            Paper can be published
        </label>
        <h2 class="text-2xl mt-5">Finished?</h2>
        <article class="text-lg">
            <p>If you filled out the form, press the 'Submit' button below.</p>
            <p>
                <strong>
                    Do not press the button twice: uploading may take time!
                </strong>
            </p>
            <p>
                <strong
                    >Please note that abstracts could be edited during 24 hours
                    after submission</strong
                >
            </p>
        </article>
        <button class="button mt-5" type="submit">Submit</button>
    </form>
{/if}
