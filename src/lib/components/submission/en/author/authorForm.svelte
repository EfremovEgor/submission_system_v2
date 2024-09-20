<script lang="ts">
    import AuthorSelect from "./../../components/authorSelect.svelte";
    import PresenterRadio from "./../../components/presenterRadio.svelte";
    import CorrespondingSelect from "./../../components/correspondingSelect.svelte";
    import AuthorInput from "./../../components/authorInput.svelte";
    import type { IAuthor, IUserDetails } from "./interfaces";
    import { titles } from "$src/lib/aliases";

    export let userDetails: IUserDetails;
    export let author: IAuthor;
    export let deleteCallback: CallableFunction | null = null;
    export let changePresenterCallback: CallableFunction;
    const putUserDetails = () => {
        Object.entries(userDetails).forEach(([key, value]) => {
            if (key in author) author[key] = value;
        });
    };
</script>

<section class="min-w-[400px] px-5 min-h-20 flex flex-col shadow-lg pb-8">
    <div class="min-h-7 mt-4">
        {#if deleteCallback}
            <button
                class="text-3xl float-end flex items-center justify-center leading-6"
                on:click={() => {
                    deleteCallback(author.id);
                }}
                type="button"
            >
                &times;
            </button>
        {/if}
    </div>
    <h1 class="text-center">Author {author.id + 1}</h1>

    <button
        on:click={putUserDetails}
        type="button"
        class="text-blue-700 hover:underline text-sm"
    >
        Click here to add yourself
    </button>
    <AuthorSelect
        placeholder="Choose"
        bind:value={author.title}
        label="First name"
        name="#{author.id}#_first_name"
        options={titles}
    />
    <AuthorInput
        bind:value={author.first_name}
        label="First name"
        name="#{author.id}#_first_name"
    />
    <AuthorInput
        bind:value={author.last_name}
        label="Last name"
        name="#{author.id}#_last_name"
    />
    <AuthorInput
        bind:value={author.email}
        label="Email"
        name="#{author.id}#_email"
    />
    <AuthorInput
        bind:value={author.country}
        label="Country"
        name="#{author.id}#_country"
    />
    <AuthorInput
        bind:value={author.affiliation}
        label="Affiliation"
        name="#{author.id}#_affiliation"
    />
    <AuthorInput
        bind:value={author.web_page}
        label="Web Page"
        required={false}
        name="#{author.id}#_web_page"
    />
    <div class="flex flex-col items-end mt-5">
        <CorrespondingSelect
            bind:checked={author.is_corresponding}
            name="#{author.id}#_is_corresponding"
        />
        <PresenterRadio
            {changePresenterCallback}
            checked={author.is_presenter}
            name="is_presenter"
            authorId={author.id}
        />
    </div>
</section>
