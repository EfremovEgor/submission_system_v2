<script lang="ts">
    import { onDestroy } from "svelte";

    interface Batch {
        id: string;
        label: string;
        created_at: string;
        created_by: string;
        total: number;
        sent: number;
        failed: number;
        failures: { to: string; note?: string; error: string }[];
    }

    export let acronym: string;
    export let batches: Batch[];
    export let limit = 10;

    $: running = batches.some((b) => b.sent + b.failed < b.total);

    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = async () => {
        const response = await fetch(`/call_for_papers/${acronym}/mailing/chair`, {
            headers: { Accept: "application/json" },
        });
        if (response.ok) batches = await response.json();
    };
    // Poll while letters are still going out.
    $: {
        if (timer) clearTimeout(timer);
        timer = running ? setTimeout(refresh, 3000) : null;
    }
    onDestroy(() => timer && clearTimeout(timer));

    /** Lets a page show a batch it has just queued. */
    export const reload = refresh;
</script>

{#if batches.length}
    <section class="batches">
        <h6>Mailings {#if running}<small class="live">sending…</small>{/if}</h6>
        <ul>
            {#each batches.slice(0, limit) as b (b.id)}
                {@const done = b.sent + b.failed}
                <li>
                    <div class="line">
                        <span class="label" title={b.label}>{b.label}</span>
                        <span class="meta"
                            >{new Date(b.created_at).toLocaleString()} · {b.created_by}</span
                        >
                    </div>
                    <div class="line">
                        <progress value={done} max={Math.max(b.total, 1)}></progress>
                        <span class="nums">
                            {b.sent}/{b.total} sent{#if b.failed}, <span class="red">{b.failed} failed</span>{/if}
                        </span>
                    </div>
                    {#if b.failures.length}
                        <details>
                            <summary>Failed addresses</summary>
                            <ul class="fails">
                                {#each b.failures as f}
                                    <li><b>{f.to}</b> {f.note ?? ""} — {f.error}</li>
                                {/each}
                            </ul>
                        </details>
                    {/if}
                </li>
            {/each}
        </ul>
    </section>
{/if}

<style>
    .batches {
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
        padding: 10px 14px;
        margin: 12px 0;
    }
    h6 {
        margin: 0 0 6px;
    }
    .live {
        color: var(--orange);
        font-weight: normal;
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style: none;
        padding: 6px 0;
        font-size: 14px;
    }
    li + li {
        border-top: 1px solid var(--pico-muted-border-color);
    }
    .line {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
    }
    .label {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .meta,
    .nums {
        color: var(--pico-muted-color);
        white-space: nowrap;
        font-size: 13px;
    }
    progress {
        margin: 4px 0;
        flex: 1;
    }
    .red {
        color: var(--red);
    }
    details {
        margin: 4px 0 0;
    }
    .fails li {
        padding: 2px 0;
        border: 0;
        font-size: 13px;
    }
</style>
