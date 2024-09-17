<script lang="ts">
    export let data;
    const conference = data.conference;
</script>

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
            <a href="{conference.acronym}/submit" class="nav-link"
                >Submit an abstract</a
            >
            <a
                href={conference.site_url}
                target="_blank"
                rel="noopener noreferrer"
                class="nav-link">Learn more</a
            >
        </aside>
        <section class="p-2">
            <article class="text-justify">
                {@html conference.description}
            </article>
        </section>
    </div>
</div>
