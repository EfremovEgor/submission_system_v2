<script lang="ts">
    import { presentation_formats } from "$src/lib/aliases";
    import SubmissionStatusText from "$components/common/submissionStatusText.svelte";
    import { getFileExtension } from "$src/lib/utils.client";

    interface Row {
        id: number;
        local_id: number;
        title: string;
        status: string;
        presentation_format: string;
        withdrawn: boolean;
        particiaption_confirmed: boolean;
        created_at: Date;
        presentation_file: { id: string; original_name: string } | null;
        manuscript_file: { id: string; original_name: string } | null;
        topic: { name: string };
        authors: {
            first_name: string;
            last_name: string;
            email: string;
            country: string;
            affiliation: string;
            is_corresponding: boolean;
            is_presenter: boolean;
        }[];
    }

    export let rows: Row[];
    export let acronym: string;
    /** Selected submission ids; the table only reads and replaces it. */
    export let selected: Set<number>;
    export let compact = false;

    type SortKey = "local_id" | "authors" | "title" | "topic" | "format" | "status" | "created_at" | "presentation" | "manuscript";
    let sortKey: SortKey = "local_id";
    let sortDir: 1 | -1 = 1;

    const sortValue = (r: Row, key: SortKey): string | number => {
        switch (key) {
            case "authors":
                return r.authors.map((a) => a.last_name).join(", ").toLowerCase();
            case "title":
                return r.title.toLowerCase();
            case "topic":
                return r.topic.name.toLowerCase();
            case "format":
                return r.presentation_format;
            case "status":
                return `${r.withdrawn ? 1 : 0}${r.status}${r.particiaption_confirmed ? 0 : 1}`;
            case "created_at":
                return new Date(r.created_at).getTime();
            case "presentation":
                return r.presentation_file ? 1 : 0;
            case "manuscript":
                return r.manuscript_file ? 1 : 0;
            default:
                return r.local_id;
        }
    };
    $: sorted = [...rows].sort((a, b) => {
        const x = sortValue(a, sortKey);
        const y = sortValue(b, sortKey);
        return (x < y ? -1 : x > y ? 1 : a.local_id - b.local_id) * sortDir;
    });
    const sortBy = (key: SortKey) => {
        if (sortKey == key) sortDir = sortDir == 1 ? -1 : 1;
        else {
            sortKey = key;
            sortDir = 1;
        }
    };

    $: allShownSelected = sorted.length > 0 && sorted.every((r) => selected.has(r.id));
    $: someShownSelected = sorted.some((r) => selected.has(r.id));
    const toggleAll = () => {
        const next = new Set(selected);
        if (allShownSelected) sorted.forEach((r) => next.delete(r.id));
        else sorted.forEach((r) => next.add(r.id));
        selected = next;
    };

    // Shift+click selects the range from the previous click.
    let lastIndex: number | null = null;
    const toggleRow = (index: number, event: MouseEvent) => {
        const next = new Set(selected);
        const row = sorted[index];
        const on = !selected.has(row.id);
        if (event.shiftKey && lastIndex != null) {
            const [from, to] = [Math.min(lastIndex, index), Math.max(lastIndex, index)];
            for (let i = from; i <= to; i++) on ? next.add(sorted[i].id) : next.delete(sorted[i].id);
        } else on ? next.add(row.id) : next.delete(row.id);
        lastIndex = index;
        selected = next;
    };

    const columns: [SortKey, string][] = [
        ["local_id", "#"],
        ["authors", "Authors"],
        ["title", "Title"],
        ["topic", "Topic"],
        ["format", "Format"],
        ["status", "Status"],
        ["presentation", "Pres."],
        ["manuscript", "Manus."],
        ["created_at", "Submitted"],
    ];
    const indeterminate = (node: HTMLInputElement, value: boolean) => {
        node.indeterminate = value;
        return { update: (v: boolean) => (node.indeterminate = v) };
    };
    $: visibleColumns = compact ? columns.filter(([k]) => k != "created_at") : columns;
</script>

<div class="wrap">
    <table class="striped">
        <thead>
            <tr>
                <th class="check">
                    <input
                        type="checkbox"
                        checked={allShownSelected}
                        use:indeterminate={!allShownSelected && someShownSelected}
                        on:change={toggleAll}
                        title="Select all shown"
                    />
                </th>
                {#each visibleColumns as [key, label]}
                    <th>
                        <button type="button" class="sort" on:click={() => sortBy(key)}
                            >{label}<span class="arrow"
                                >{sortKey == key ? (sortDir == 1 ? "▲" : "▼") : ""}</span
                            ></button
                        >
                    </th>
                {/each}
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each sorted as r, i (r.id)}
                <tr class:sel={selected.has(r.id)} class:withdrawn={r.withdrawn}>
                    <td class="check">
                        <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            on:click={(e) => toggleRow(i, e)}
                        />
                    </td>
                    <td class="num">{r.local_id}</td>
                    <td class="authors">
                        {#each r.authors as a, j}
                            <span
                                title="{a.email} · {a.affiliation}, {a.country}{a.is_corresponding
                                    ? ' · corresponding'
                                    : ''}{a.is_presenter ? ' · presenter' : ''}"
                                class:corr={a.is_corresponding}
                                >{a.first_name} {a.last_name}</span
                            >{j < r.authors.length - 1 ? ", " : ""}
                        {/each}
                    </td>
                    <td class="title">{r.title}</td>
                    <td class="topic">{r.topic.name}</td>
                    <td class="center">{presentation_formats[r.presentation_format] ?? r.presentation_format}</td>
                    <td class="center">
                        <SubmissionStatusText status={r.status} />
                        {#if r.withdrawn}
                            <br /><span class="red">Withdrawn</span>
                        {:else if r.particiaption_confirmed}
                            <br /><span class="green">Confirmed</span>
                        {/if}
                    </td>
                    <td class="center">
                        {#if r.presentation_file}
                            <a
                                class="green"
                                href="/uploads/{r.presentation_file.id}"
                                download="{acronym}-presentation-{r.local_id}.{getFileExtension(
                                    r.presentation_file.original_name,
                                )}">Yes</a
                            >
                        {:else}<span class="red">No</span>{/if}
                    </td>
                    <td class="center">
                        {#if r.manuscript_file}
                            <a
                                class="green"
                                href="/uploads/{r.manuscript_file.id}"
                                download="{acronym}-manuscript-{r.local_id}.{getFileExtension(
                                    r.manuscript_file.original_name,
                                )}">Yes</a
                            >
                        {:else}<span class="red">No</span>{/if}
                    </td>
                    {#if !compact}
                        <td class="date">{new Date(r.created_at).toLocaleDateString()}</td>
                    {/if}
                    <td class="links">
                        <a
                            href="/call_for_papers/{acronym}/submissions/{r.id}/chair"
                            target="_blank"
                            title="Open">Open</a
                        >
                        <a
                            href="/pdf/submissions/{r.id}"
                            target="_blank"
                            download="{acronym}-abstract-{r.local_id}.pdf"
                            title="Abstract PDF">PDF</a
                        >
                    </td>
                </tr>
            {:else}
                <tr><td colspan="12" class="empty">No papers match the filters</td></tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .wrap {
        overflow: auto;
    }
    table {
        font-size: 14px;
    }
    th,
    td {
        padding: 6px 8px !important;
        vertical-align: top;
    }
    th {
        white-space: nowrap;
    }
    .sort {
        width: auto;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font-weight: 600;
        font-size: 14px;
    }
    .arrow {
        display: inline-block;
        width: 1em;
        font-size: 10px;
        margin-left: 2px;
    }
    .check {
        width: 32px;
    }
    .check input {
        margin: 0;
    }
    .num {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
    }
    .authors {
        min-width: 180px;
    }
    .corr {
        text-decoration: underline dotted;
    }
    .title {
        min-width: 260px;
    }
    .topic {
        min-width: 140px;
    }
    .center {
        text-align: center;
    }
    .date {
        white-space: nowrap;
    }
    .links {
        white-space: nowrap;
    }
    .links a + a {
        margin-left: 8px;
    }
    tr.sel td {
        background: color-mix(in srgb, var(--pico-primary-background) 12%, transparent) !important;
    }
    tr.withdrawn td.title {
        opacity: 0.6;
    }
    .red {
        color: var(--red);
    }
    .green {
        color: var(--green);
    }
    .empty {
        text-align: center;
        padding: 30px !important;
        color: var(--pico-muted-color);
    }
</style>
