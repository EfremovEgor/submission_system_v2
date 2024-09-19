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
    <h1 class="heading">
        {conference.name}
    </h1>
    <div class="flex flex-row justify-between gap-4 mt-8">
        <aside class="basis-1/3">
            <p class=" text-slate-900 p-2 rounded-xl font-medium">
                Submission Deadline: {conference.submission_deadline?.toLocaleDateString()}
            </p>
            <p class=" text-slate-900 p-2 rounded-xl font-medium">
                Start Date: {conference.start_date?.toLocaleDateString()}
            </p>
            <button
                on:click={() => (modalIsOpen = !modalIsOpen)}
                class="nav-link w-full">Submit an abstract</button
            >
            <a
                href={conference.site_url}
                target="_blank"
                rel="noopener noreferrer"
                class="nav-link"><button class="flex">Learn more</button></a
            >
        </aside>
        <section class="p-2">
            <article class="text-justify">
                {@html conference.description}
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
