<script lang="ts">
    import AuthorSelect from "./../../components/authorSelect.svelte";
    import PresenterRadio from "./../../components/presenterRadio.svelte";
    import CorrespondingSelect from "./../../components/correspondingSelect.svelte";
    import AuthorInput from "./../../components/authorInput.svelte";
    import type { IAuthor, IUserDetails } from "./interfaces";
    import { titles } from "$src/lib/aliases";
    import AuthorCountrySelect from "$components/submission/components/authorCountrySelect.svelte";
    import AuthorEmailInput from "$components/submission/components/authorEmailInput.svelte";

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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<section class="min-w-[400px] px-5 min-h-20 flex flex-col shadow-lg pb-8">
    <div class="min-h-9 mt-4 flex flex-row justify-end">
        {#if deleteCallback}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
                class="text-3xl cursor-pointer hover:text-[#0172ad]"
                on:click={() => {
                    deleteCallback(author.id);
                }}
            >
                &times;
            </span>
        {/if}
    </div>
    <h4 class="text-center mb-0">Author {author.id + 1}</h4>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
        class="mb-3 text-sm cursor-pointer text-center text-[#0172ad] hover:underline"
        on:click={putUserDetails}
    >
        Click here to add yourself
    </span>
    <AuthorSelect
        placeholder="Choose"
        bind:value={author.title}
        label="Title"
        name="#{author.id}#_title"
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
    <AuthorEmailInput
        bind:value={author.email}
        label="Email"
        name="#{author.id}#_email"
    />
    <AuthorCountrySelect
        placeholder="Choose"
        bind:value={author.country}
        label="Country"
        name="#{author.id}#_country"
    />
    <AuthorInput
        bind:value={author.affiliation}
        label="Affiliation"
        name="#{author.id}#_affiliation"
        placeholder="Organization name"
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
