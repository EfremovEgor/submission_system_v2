<script lang="ts">
    import { goto } from "$app/navigation";
    import Modal from "$components/common/modal/modal.svelte";
    export let data;
    const conference = data.conference;
    let modalIsOpen = false;
    let language = "en";
</script>

<svelte:head>
    <title>{conference.name}</title>
</svelte:head>

<div class="container">
    <h3>
        {conference.name}
    </h3>
    <div class="flex flex-row gap-5">
        {#if new Date() <= new Date(conference.submission_deadline.getTime() + 60 * 60 * 21 * 1000 - 1)}
            {#if conference.allow_ru}
                <button
                    class="primary-button-hover outline"
                    on:click={() => (modalIsOpen = !modalIsOpen)}
                >
                    Submit an abstract
                </button>
            {:else}
                <a
                    href="{conference.acronym}/submit?lang=en"
                    rel="noopener noreferrer"
                    class="primary-button-hover outline"
                    role="button">Submit an abstract</a
                >
            {/if}
        {/if}
        <a
            href={conference.site_url}
            target="_blank"
            rel="noopener noreferrer"
            class="primary-button-hover outline"
            role="button">Learn more</a
        >
    </div>
    <div class="flex flex-row justify-between mt-8">
        <article class="basis-1/3 mt-2 h-fit">
            <p>
                Submission Deadline: <br />
                {conference.submission_deadline?.toLocaleDateString()}
            </p>
            <p>
                Start Date: {conference.start_date?.toLocaleDateString()}
            </p>
        </article>
        <section class="p-2">
            <article>
                <div class="text-justify">
                    {@html conference.description}
                </div>
                {#each conference.symposiums as symposium}
                    <b class="mt-2 font-bold">{symposium.name}</b>
                    <ul class="pl-10 list-disc">
                        {#each symposium.topics as topic}
                            <li>{topic.name}</li>
                        {/each}
                    </ul>
                {/each}
            </article>
        </section>
    </div>
</div>
<Modal name="Submission language" bind:open={modalIsOpen}>
    <svelte:fragment slot="body">
        <select bind:value={language} class="w-full my-auto">
            <option value="en">English</option>
            <option value="ru">Russian</option>
        </select>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
        <button on:click={() => (modalIsOpen = false)} class="button button-red"
            >Cancel</button
        >
        <button
            class="button button-green"
            on:click={() => {
                goto(`${conference.acronym}/submit?lang=${language}`);
            }}>Proceed</button
        >
    </svelte:fragment>
</Modal>
