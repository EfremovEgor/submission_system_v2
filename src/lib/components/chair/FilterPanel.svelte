<script lang="ts">
    import {
        activeFilterCount,
        emptyFilters,
        facetCount,
        FORMAT_OPTIONS,
        parseIdList,
        STATUS_OPTIONS,
        TRI_FILTERS,
        type ChairFilters,
        type FilterableSubmission,
        type TriState,
    } from "$src/lib/chair/filters";

    export let filters: ChairFilters;
    export let submissions: FilterableSubmission[];
    export let topics: { id: number; name: string; symposium: string | null }[];
    export let shown: number;

    const toggle = <T,>(list: T[], value: T) =>
        list.includes(value) ? list.filter((v) => v != value) : [...list, value];

    $: idsInvalid = parseIdList(filters.ids) == "invalid";
    $: active = activeFilterCount(filters);

    $: symposiums = [...new Set(topics.map((t) => t.symposium))];
    $: countries = [...new Set(submissions.flatMap((s) => s.authors.map((a) => a.country)))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    // Facet counts: how many papers each choice would show with the other filters kept.
    $: statusCounts = Object.fromEntries(
        STATUS_OPTIONS.map((o) => [o.value, facetCount(submissions, filters, { statuses: [o.value] })]),
    );
    $: formatCounts = Object.fromEntries(
        FORMAT_OPTIONS.map((o) => [o.value, facetCount(submissions, filters, { formats: [o.value] })]),
    );
    $: topicCounts = Object.fromEntries(
        topics.map((t) => [t.id, facetCount(submissions, filters, { topics: [t.id] })]),
    );
    $: countryCounts = Object.fromEntries(
        countries.map((c) => [c, facetCount(submissions, filters, { countries: [c] })]),
    );
    $: triCounts = Object.fromEntries(
        TRI_FILTERS.map((t) => [
            t.key,
            {
                yes: facetCount(submissions, filters, { [t.key]: "yes" }),
                no: facetCount(submissions, filters, { [t.key]: "no" }),
            },
        ]),
    );
    const setTri = (key: (typeof TRI_FILTERS)[number]["key"], value: string) => {
        filters[key] = value as TriState;
    };
    let countrySearch = "";
    $: visibleCountries = countries.filter((c) =>
        c.toLowerCase().includes(countrySearch.trim().toLowerCase()),
    );
</script>

<section class="filters">
    <div class="row">
        <label class="grow">
            <span class="caption">Search</span>
            <input
                type="search"
                bind:value={filters.q}
                placeholder="Title, author, email, affiliation, country, #number"
            />
        </label>
        <label class="ids">
            <span class="caption">Paper numbers</span>
            <input
                type="text"
                bind:value={filters.ids}
                placeholder="e.g. 1-20, 35, 41"
                aria-invalid={idsInvalid ? "true" : undefined}
            />
        </label>
    </div>

    <div class="row">
        <div class="group">
            <span class="caption">Status</span>
            <div class="chips">
                {#each STATUS_OPTIONS as o}
                    <button
                        type="button"
                        class="chip status-{o.value}"
                        class:on={filters.statuses.includes(o.value)}
                        on:click={() => (filters.statuses = toggle(filters.statuses, o.value))}
                        >{o.label} <b>{statusCounts[o.value]}</b></button
                    >
                {/each}
            </div>
        </div>
        <div class="group">
            <span class="caption">Format</span>
            <div class="chips">
                {#each FORMAT_OPTIONS as o}
                    <button
                        type="button"
                        class="chip"
                        class:on={filters.formats.includes(o.value)}
                        on:click={() => (filters.formats = toggle(filters.formats, o.value))}
                        >{o.label} <b>{formatCounts[o.value]}</b></button
                    >
                {/each}
            </div>
        </div>
        {#each TRI_FILTERS as t}
            <div class="group">
                <span class="caption">{t.label}</span>
                <div class="seg">
                    {#each [["any", "Any"], ["yes", "Yes"], ["no", "No"]] as [value, label]}
                        <button
                            type="button"
                            class:on={filters[t.key] == value}
                            on:click={() => setTri(t.key, value)}
                            >{label}{#if value != "any"}
                                <b>{triCounts[t.key][value]}</b>{/if}</button
                        >
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div class="row">
        <details class="drop">
            <summary
                >Topics {#if filters.topics.length}<span class="badge">{filters.topics.length}</span
                    >{/if}</summary
            >
            <div class="panel">
                <div class="panel-actions">
                    <button type="button" class="link" on:click={() => (filters.topics = [])}
                        >Any topic</button
                    >
                </div>
                {#each symposiums as symposium}
                    {#if symposium}<div class="sym">{symposium}</div>{/if}
                    {#each topics.filter((t) => t.symposium == symposium) as t}
                        <label class="opt">
                            <input
                                type="checkbox"
                                checked={filters.topics.includes(t.id)}
                                on:change={() => (filters.topics = toggle(filters.topics, t.id))}
                            />
                            <span class="grow">{t.name}</span>
                            <b>{topicCounts[t.id]}</b>
                        </label>
                    {/each}
                {/each}
            </div>
        </details>
        <details class="drop">
            <summary
                >Countries {#if filters.countries.length}<span class="badge"
                        >{filters.countries.length}</span
                    >{/if}</summary
            >
            <div class="panel">
                <div class="panel-actions">
                    <input type="search" placeholder="Find country" bind:value={countrySearch} />
                    <button type="button" class="link" on:click={() => (filters.countries = [])}
                        >Any country</button
                    >
                </div>
                {#each visibleCountries as c}
                    <label class="opt">
                        <input
                            type="checkbox"
                            checked={filters.countries.includes(c)}
                            on:change={() => (filters.countries = toggle(filters.countries, c))}
                        />
                        <span class="grow">{c}</span>
                        <b>{countryCounts[c]}</b>
                    </label>
                {/each}
            </div>
        </details>
        <div class="summary">
            <span class="counter"
                >Shown <strong>{shown}</strong> of {submissions.length}</span
            >
            {#if active}
                <button type="button" class="link" on:click={() => (filters = emptyFilters())}
                    >Reset {active} filter{active == 1 ? "" : "s"}</button
                >
            {/if}
        </div>
    </div>
</section>

<style>
    .filters {
        --txt: var(--pico-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
        margin-bottom: 12px;
    }
    .row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        align-items: flex-end;
    }
    .grow {
        flex: 1 1 auto;
    }
    .ids {
        flex: 0 1 240px;
    }
    label {
        margin: 0;
    }
    .caption {
        display: block;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pico-muted-color);
        margin-bottom: 4px;
    }
    .chips,
    .seg {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .chip,
    .seg button {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 4px 10px;
        font-size: 14px;
        border-radius: 999px;
        border: 1px solid var(--pico-muted-border-color);
        background: transparent;
        color: var(--txt);
        line-height: 1.4;
    }
    .seg {
        gap: 0;
    }
    .seg button {
        border-radius: 0;
    }
    .seg button:first-child {
        border-radius: 999px 0 0 999px;
    }
    .seg button:last-child {
        border-radius: 0 999px 999px 0;
    }
    .seg button + button {
        border-left: 0;
    }
    .chip b,
    .seg b,
    .opt b {
        font-weight: 600;
        opacity: 0.6;
        margin-left: 2px;
    }
    .chip.on,
    .seg button.on {
        background: var(--pico-primary-background);
        border-color: var(--pico-primary-background);
        color: var(--pico-primary-inverse);
    }
    .chip.on b,
    .seg button.on b {
        opacity: 0.85;
    }
    .drop {
        position: relative;
        margin: 0;
    }
    .drop summary {
        padding: 6px 12px;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 6px;
        font-size: 14px;
    }
    .drop[open] .panel {
        position: absolute;
        z-index: 20;
        top: calc(100% + 4px);
        left: 0;
        width: min(520px, 90vw);
        max-height: 420px;
        overflow: auto;
        padding: 10px;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
        background: var(--pico-background-color);
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
    }
    .panel-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
    }
    .sym {
        margin: 8px 0 2px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--pico-muted-color);
    }
    .opt {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 3px 0;
        font-size: 14px;
    }
    .opt input {
        margin: 0;
    }
    .badge {
        display: inline-block;
        min-width: 20px;
        padding: 0 6px;
        margin-left: 4px;
        border-radius: 999px;
        background: var(--pico-primary-background);
        color: var(--pico-primary-inverse);
        font-size: 12px;
        text-align: center;
    }
    .summary {
        margin-left: auto;
        display: flex;
        gap: 14px;
        align-items: center;
    }
    .counter {
        font-size: 16px;
    }
    .link {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        color: var(--pico-primary);
        text-decoration: underline;
        font-size: 14px;
    }
    input[type="search"],
    input[type="text"] {
        height: 40px !important;
    }
    input[type="search"] {
        padding-left: 2.6rem !important;
    }
</style>
