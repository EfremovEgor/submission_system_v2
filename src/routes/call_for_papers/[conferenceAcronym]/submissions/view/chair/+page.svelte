<script lang="ts">
    import { browser } from "$app/environment";
    import { afterNavigate, invalidateAll, replaceState } from "$app/navigation";
    import { page } from "$app/stores";
    import BackButton from "$components/common/buttons/backButton.svelte";
    import FilterPanel from "$components/chair/FilterPanel.svelte";
    import MailBatches from "$components/chair/MailBatches.svelte";
    import SubmissionsTable from "$components/chair/SubmissionsTable.svelte";
    import {
        buildExportXLSX,
        defaultExportColumns,
        EXPORT_COLUMNS,
        saveBlob,
    } from "$src/lib/chair/columns";
    import { applyFilters, filtersFromParams, filtersToParams } from "$src/lib/chair/filters";
    import { generateSubmissionsWord } from "$src/lib/generators/word/submissions_list.client";
    import { MIME_TYPES } from "$src/lib/mime_types";
    import { onMount } from "svelte";

    export let data;

    const conference = data.conference;
    const acronym = conference.acronym;
    $: submissions = data.submissions;

    // Filters live in the URL so a filtered view can be bookmarked or shared.
    let filters = filtersFromParams($page.url.searchParams);
    let mounted = false;
    // replaceState needs the router, which is ready only after the first navigation.
    let routerReady = false;
    onMount(() => (mounted = true));
    afterNavigate(() => (routerReady = true));
    $: if (routerReady && browser) {
        const url = new URL(window.location.href);
        filtersToParams(filters, url.searchParams);
        if (url.href != window.location.href) replaceState(url, {});
    }
    $: shown = applyFilters(submissions, filters);

    let selected = new Set<number>();
    // Papers removed from the list (e.g. deleted) drop out of the selection.
    $: {
        const known = new Set(submissions.map((s) => s.id));
        if ([...selected].some((id) => !known.has(id)))
            selected = new Set([...selected].filter((id) => known.has(id)));
    }
    $: selectedRows = submissions.filter((s) => selected.has(s.id));
    $: selectedShown = shown.filter((s) => selected.has(s.id)).length;

    // ---- bulk actions ----
    const ACTIONS = {
        accept: { label: "Accept", verb: "Accept", letter: true, cls: "green" },
        reject: { label: "Reject", verb: "Reject", letter: true, cls: "red" },
        under_review: { label: "Under review", verb: "Set “Under review” for", letter: false, cls: "" },
        submitted: { label: "Submitted", verb: "Set “Submitted” for", letter: false, cls: "" },
        withdraw: { label: "Withdraw", verb: "Withdraw", letter: false, cls: "red" },
        restore: { label: "Restore", verb: "Restore (un-withdraw)", letter: false, cls: "" },
        confirm: { label: "Confirm participation", verb: "Mark as confirmed", letter: false, cls: "" },
        unconfirm: { label: "Unconfirm", verb: "Remove confirmation for", letter: false, cls: "" },
    } as const;
    type Action = keyof typeof ACTIONS;

    let dialogAction: Action | null = null;
    let notify = true;
    let audience: "all" | "corresponding" = "all";
    let busy = false;
    let message = "";
    let batches = data.batches;
    let batchList: MailBatches;

    const letterCount = (rows: typeof submissions, who: "all" | "corresponding") =>
        rows
            .filter((s) => !s.withdrawn)
            .reduce(
                (n, s) =>
                    n +
                    new Set(
                        s.authors
                            .filter((a) => who == "all" || a.is_corresponding)
                            .map((a) => a.email.trim().toLowerCase())
                            .filter(Boolean),
                    ).size,
                0,
            );

    $: dialogInfo =
        dialogAction &&
        (() => {
            const rows = selectedRows;
            const status =
                dialogAction == "accept" ? "accepted" : dialogAction == "reject" ? "rejected" : null;
            return {
                rows,
                same: status ? rows.filter((s) => s.status == status).length : 0,
                withdrawn: rows.filter((s) => s.withdrawn).length,
                letters: letterCount(rows, audience),
            };
        })();

    const openDialog = (key: string, letter: boolean) => {
        dialogAction = key as Action;
        notify = letter;
    };

    const runAction = async () => {
        if (!dialogAction) return;
        busy = true;
        try {
            const response = await fetch(`/call_for_papers/${acronym}/submissions/view/chair/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: dialogAction,
                    ids: [...selected],
                    notify: ACTIONS[dialogAction].letter && notify,
                    audience,
                }),
            });
            const body = await response.json().catch(() => null);
            if (!response.ok) {
                alert(`Failed: ${body?.message ?? response.status}`);
                return;
            }
            message = `${ACTIONS[dialogAction].label}: ${body.updated} paper(s) updated${
                body.letters ? `, ${body.letters} letter(s) queued` : ""
            }.`;
            dialogAction = null;
            await invalidateAll();
            batches = data.batches;
        } finally {
            busy = false;
        }
    };

    // ---- export ----
    let exportOpen = false;
    let scope: "selected" | "shown" = "shown";
    $: if (selected.size == 0) scope = "shown";
    $: scopeRows = scope == "selected" ? selectedRows : shown;

    const COLUMNS_KEY = "chair-export-columns";
    let columns: string[] = defaultExportColumns();
    onMount(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(COLUMNS_KEY) ?? "null");
            if (Array.isArray(saved)) columns = saved;
        } catch {}
    });
    $: if (mounted)
        try {
            localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
        } catch {}
    const toggleColumn = (key: string) =>
        (columns = columns.includes(key) ? columns.filter((k) => k != key) : [...columns, key]);

    const stamp = () => new Date().toISOString().slice(0, 10);
    const exportExcel = () => {
        const buffer = buildExportXLSX(scopeRows, columns, { origin: location.origin, acronym });
        saveBlob(new Blob([buffer], { type: MIME_TYPES[".xlsx"] }), `${acronym}-submissions-${stamp()}.xlsx`);
    };
    const exportWord = async () => {
        const blob = await generateSubmissionsWord({
            submissions: scopeRows.filter((s) => s.status == "accepted" && !s.withdrawn),
            conference: { acronym },
        });
        saveBlob(new Blob([blob], { type: MIME_TYPES[".docx"] }), `${acronym}-accepted-${stamp()}.docx`);
    };

    let fileKinds = { abstracts: false, presentations: true, manuscripts: false };
    let byTopic = false;
    $: zipKinds = Object.entries(fileKinds)
        .filter(([, on]) => on)
        .map(([k]) => k);
    $: zipCounts = {
        abstracts: scopeRows.length,
        presentations: scopeRows.filter((s) => s.presentation_file).length,
        manuscripts: scopeRows.filter((s) => s.manuscript_file).length,
    };
    $: zipHref = (() => {
        const p = new URLSearchParams();
        zipKinds.forEach((k) => p.append("kind", k));
        p.set("ids", scopeRows.map((s) => s.id).join(","));
        if (byTopic) p.set("folders", "topic");
        return `/call_for_papers/${acronym}/submissions/view/chair/files?${p}`;
    })();

    // ---- emails ----
    let copyAudience: "all" | "corresponding" | "presenters" = "corresponding";
    let copied = "";
    const copyEmails = async () => {
        const emails = [
            ...new Set(
                scopeRows.flatMap((s) =>
                    s.authors
                        .filter(
                            (a) =>
                                copyAudience == "all" ||
                                (copyAudience == "corresponding" && a.is_corresponding) ||
                                (copyAudience == "presenters" && a.is_presenter),
                        )
                        .map((a) => a.email.trim())
                        .filter(Boolean),
                ),
            ),
        ];
        await navigator.clipboard.writeText(emails.join(", "));
        copied = `${emails.length} address(es) copied`;
        setTimeout(() => (copied = ""), 4000);
    };

    $: mailingHref = `/call_for_papers/${acronym}/mailing/chair${
        selected.size ? `?sel=${[...selected].join(",")}` : ""
    }`;
</script>

<svelte:head>
    <title>Chair · {conference.short_name}</title>
</svelte:head>

<div class="page">
    <div class="top">
        <BackButton url="/chair" />
        <h3>{conference.name}</h3>
        <a class="mail-link" href={mailingHref} role="button"
            >✉ Mailing{selected.size ? ` to ${selected.size} selected` : ""}</a
        >
    </div>

    <FilterPanel bind:filters {submissions} topics={data.topics} shown={shown.length} />

    <div class="bar" class:has={selected.size > 0}>
        <div class="sel-info">
            {#if selected.size}
                <strong>{selected.size}</strong> selected
                {#if selectedShown != selected.size}<small>({selectedShown} of them shown)</small>{/if}
                <button class="link" on:click={() => (selected = new Set())}>Clear</button>
            {:else}
                <span class="muted">Tick papers to act on them (Shift+click selects a range)</span>
            {/if}
            {#if shown.length && selectedShown < shown.length}
                <button
                    class="link"
                    on:click={() => (selected = new Set([...selected, ...shown.map((s) => s.id)]))}
                    >Select all {shown.length} shown</button
                >
            {/if}
        </div>
        <div class="actions">
            {#each Object.entries(ACTIONS) as [key, a]}
                <button
                    class="act {a.cls}"
                    disabled={!selected.size}
                    on:click={() => openDialog(key, a.letter)}>{a.label}</button
                >
            {/each}
            <button class="act" on:click={() => (exportOpen = !exportOpen)} aria-expanded={exportOpen}
                >Export / download…</button
            >
        </div>
    </div>
    {#if message}
        <p class="msg">{message} <button class="link" on:click={() => (message = "")}>×</button></p>
    {/if}

    {#if exportOpen}
        <section class="export">
            <div class="scope">
                <span class="caption">Papers</span>
                <label
                    ><input type="radio" bind:group={scope} value="shown" /> All shown ({shown.length})</label
                >
                <label class:disabled={!selected.size}
                    ><input
                        type="radio"
                        bind:group={scope}
                        value="selected"
                        disabled={!selected.size}
                    /> Selected ({selected.size})</label
                >
            </div>
            <div class="cols">
                <div class="box">
                    <span class="caption">Excel columns</span>
                    <div class="colgrid">
                        {#each EXPORT_COLUMNS as c}
                            <label
                                ><input
                                    type="checkbox"
                                    checked={columns.includes(c.key)}
                                    on:change={() => toggleColumn(c.key)}
                                />
                                {c.label}</label
                            >
                        {/each}
                    </div>
                    <div class="row">
                        <button class="link" on:click={() => (columns = EXPORT_COLUMNS.map((c) => c.key))}
                            >All</button
                        >
                        <button class="link" on:click={() => (columns = defaultExportColumns())}
                            >Default</button
                        >
                        <button class="link" on:click={() => (columns = [])}>None</button>
                        <button
                            class="primary"
                            disabled={!columns.length || !scopeRows.length}
                            on:click={exportExcel}>Download Excel ({scopeRows.length})</button
                        >
                    </div>
                    <div class="row">
                        <button class="secondary" disabled={!scopeRows.length} on:click={exportWord}
                            >Word list of accepted ({scopeRows.filter(
                                (s) => s.status == "accepted" && !s.withdrawn,
                            ).length})</button
                        >
                    </div>
                </div>
                <div class="box">
                    <span class="caption">Files (one zip)</span>
                    <label
                        ><input type="checkbox" bind:checked={fileKinds.presentations} /> Presentations
                        ({zipCounts.presentations})</label
                    >
                    <label
                        ><input type="checkbox" bind:checked={fileKinds.manuscripts} /> Manuscripts ({zipCounts.manuscripts})</label
                    >
                    <label
                        ><input type="checkbox" bind:checked={fileKinds.abstracts} /> Abstract PDFs ({zipCounts.abstracts})</label
                    >
                    <label><input type="checkbox" bind:checked={byTopic} /> Folders by topic</label>
                    <div class="row">
                        {#if zipKinds.length && scopeRows.length}
                            <a class="primary-link" role="button" href={zipHref} download
                                >Download zip</a
                            >
                        {:else}
                            <button class="primary" disabled>Download zip</button>
                        {/if}
                    </div>
                    <small class="muted"
                        >Papers without a file are listed in _missing.txt inside the archive.</small
                    >
                </div>
                <div class="box">
                    <span class="caption">Email addresses</span>
                    <select bind:value={copyAudience}>
                        <option value="corresponding">Corresponding authors</option>
                        <option value="all">All authors</option>
                        <option value="presenters">Presenters</option>
                    </select>
                    <div class="row">
                        <button class="secondary" disabled={!scopeRows.length} on:click={copyEmails}
                            >Copy addresses</button
                        >
                        {#if copied}<small class="green">{copied}</small>{/if}
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <MailBatches bind:this={batchList} {acronym} bind:batches limit={5} />

    <SubmissionsTable rows={shown} {acronym} bind:selected />
</div>

{#if dialogAction && dialogInfo}
    <dialog open>
        <article>
            <header>
                <strong>{ACTIONS[dialogAction].verb} {dialogInfo.rows.length} paper(s)?</strong>
            </header>
            <p class="ids">
                #{dialogInfo.rows
                    .slice(0, 60)
                    .map((s) => s.local_id)
                    .join(", #")}{dialogInfo.rows.length > 60 ? ", …" : ""}
            </p>
            {#if dialogInfo.same}
                <p class="warn">{dialogInfo.same} of them already have this status.</p>
            {/if}
            {#if dialogInfo.withdrawn && ACTIONS[dialogAction].letter}
                <p class="warn">{dialogInfo.withdrawn} withdrawn paper(s) get the status but no letter.</p>
            {/if}
            {#if ACTIONS[dialogAction].letter}
                <label><input type="checkbox" bind:checked={notify} /> Email the decision letter</label>
                {#if notify}
                    <div class="aud">
                        <label><input type="radio" bind:group={audience} value="all" /> All authors</label>
                        <label
                            ><input type="radio" bind:group={audience} value="corresponding" /> Corresponding
                            only</label
                        >
                    </div>
                    <p class="muted">
                        {dialogInfo.letters} letter(s) will be queued and sent one by one; progress is shown
                        under “Mailings”.
                    </p>
                {/if}
            {/if}
            <footer>
                <button class="secondary" disabled={busy} on:click={() => (dialogAction = null)}
                    >Cancel</button
                >
                <button class="act-confirm {ACTIONS[dialogAction].cls}" disabled={busy} on:click={runAction}
                    >{busy ? "Working…" : ACTIONS[dialogAction].label}</button
                >
            </footer>
        </article>
    </dialog>
{/if}

<style>
    .page {
        --txt: var(--pico-color);
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 16px 40px;
    }
    .top {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    .top h3 {
        margin: 0;
        flex: 1;
    }
    .mail-link {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 6px 14px;
        font-size: 15px;
    }
    .bar {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--pico-background-color);
        border: 1px solid var(--pico-muted-border-color);
        margin-bottom: 8px;
    }
    .bar.has {
        border-color: var(--pico-primary-background);
        box-shadow: 0 4px 14px rgb(0 0 0 / 0.08);
    }
    .sel-info {
        display: flex;
        gap: 10px;
        align-items: baseline;
        flex-wrap: wrap;
    }
    .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    .act,
    .act-confirm {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 4px 12px;
        font-size: 14px;
        background: transparent;
        color: var(--txt);
        border: 1px solid var(--pico-muted-border-color);
    }
    .act.green,
    .act-confirm.green {
        border-color: var(--green);
        color: var(--green);
    }
    .act.red,
    .act-confirm.red {
        border-color: var(--red);
        color: var(--red);
    }
    .act-confirm {
        background: var(--pico-primary-background);
        color: var(--pico-primary-inverse);
        border-color: var(--pico-primary-background);
    }
    .act-confirm.green {
        background: var(--green);
        color: white;
    }
    .act-confirm.red {
        background: var(--red);
        color: white;
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
    .muted {
        color: var(--pico-muted-color);
        font-size: 14px;
    }
    .msg {
        padding: 8px 12px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--green) 12%, transparent);
        font-size: 14px;
    }
    .export {
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
        padding: 12px 14px;
        margin-bottom: 10px;
    }
    .scope {
        display: flex;
        gap: 18px;
        align-items: center;
        margin-bottom: 10px;
    }
    .scope label,
    .box label {
        margin: 0;
        font-size: 14px;
    }
    .disabled {
        opacity: 0.5;
    }
    .cols {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 14px;
    }
    @media (max-width: 1000px) {
        .cols {
            grid-template-columns: 1fr;
        }
    }
    .box {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--pico-muted-border-color) 25%, transparent);
    }
    .colgrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2px 12px;
    }
    .caption {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pico-muted-color);
    }
    .row {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 6px;
    }
    .row button,
    .primary-link {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 6px 14px;
        font-size: 14px;
    }
    .green {
        color: var(--green);
    }
    dialog article {
        max-width: 640px;
    }
    .ids {
        font-size: 13px;
        max-height: 120px;
        overflow: auto;
    }
    .warn {
        color: var(--orange);
        font-size: 14px;
    }
    .aud {
        display: flex;
        gap: 18px;
        margin: 6px 0 0 28px;
    }
    footer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    footer button {
        width: auto;
        min-width: 0;
        margin: 0;
    }
</style>
