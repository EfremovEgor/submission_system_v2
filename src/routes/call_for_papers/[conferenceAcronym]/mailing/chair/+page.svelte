<script lang="ts">
    import { browser } from "$app/environment";
    import { afterNavigate, replaceState } from "$app/navigation";
    import { page } from "$app/stores";
    import BackButton from "$components/common/buttons/backButton.svelte";
    import FilterPanel from "$components/chair/FilterPanel.svelte";
    import MailBatches from "$components/chair/MailBatches.svelte";
    import SubmissionsTable from "$components/chair/SubmissionsTable.svelte";
    import { applyFilters, filtersFromParams, filtersToParams } from "$src/lib/chair/filters";
    import { html as htmlLang } from "@codemirror/lang-html";
    import type { EditorView } from "@codemirror/view";
    import { onMount } from "svelte";
    import CodeMirror from "svelte-codemirror-editor";

    export let data;

    const acronym = data.conference.acronym;
    const submissions = data.submissions;
    const endpoint = `/call_for_papers/${acronym}/mailing/chair`;

    // ---- recipients ----
    let filters = filtersFromParams($page.url.searchParams);
    let mounted = false;
    // replaceState needs the router, which is ready only after the first navigation.
    let routerReady = false;
    afterNavigate(() => (routerReady = true));
    $: if (routerReady && browser) {
        const url = new URL(window.location.href);
        filtersToParams(filters, url.searchParams);
        if (url.href != window.location.href) replaceState(url, {});
    }
    $: shown = applyFilters(submissions, filters);

    // "?sel=1,2,3" comes from the dashboard's "Mailing to N selected".
    let selected = new Set<number>(
        ($page.url.searchParams.get("sel") ?? "")
            .split(",")
            .map(Number)
            .filter((id) => submissions.some((s) => s.id == id)),
    );
    let audience: "all" | "corresponding" | "presenters" = "corresponding";
    let extra = "";
    $: extraLines = extra.split(/\r?\n/).filter((l) => l.trim()).length;
    $: selectedRows = submissions.filter((s) => selected.has(s.id));
    $: estimate =
        selectedRows.reduce(
            (n, s) =>
                n +
                new Set(
                    s.authors
                        .filter(
                            (a) =>
                                audience == "all" ||
                                (audience == "corresponding" && a.is_corresponding) ||
                                (audience == "presenters" && a.is_presenter),
                        )
                        .map((a) => a.email.trim().toLowerCase())
                        .filter(Boolean),
                ).size,
            0,
        ) + extraLines;

    // ---- template ----
    type Draft = { name: string; subject: string; html: string };
    const DRAFTS_KEY = `chair-mailing-drafts:${acronym}`;
    const STATE_KEY = `chair-mailing-current:${acronym}`;
    const TEST_KEY = "chair-mailing-test-address";
    let mode: string = "custom"; // "custom" or a system template key
    let subject = "";
    let html = "<p style=\"color: black\">Dear <%= recipient.title %> <%= recipient.first_name %> <%= recipient.last_name %>,</p>\n<p style=\"color: black\"></p>\n<p style=\"color: black\">Best Regards,<br />\n<%= conference.short_name %> Organizing Committee</p>\n";
    let drafts: Draft[] = [];
    let draftName = "";
    let testEmail = "";
    let view: EditorView | null = null;
    let lastFocus: "subject" | "body" = "body";
    let subjectInput: HTMLInputElement;

    $: system = data.systemTemplates.find((t) => t.key == mode) ?? null;

    onMount(() => {
        try {
            drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? "[]");
            const current = JSON.parse(localStorage.getItem(STATE_KEY) ?? "null");
            if (current?.html) ({ subject, html } = current);
            testEmail = localStorage.getItem(TEST_KEY) ?? "";
        } catch {}
        mounted = true;
    });
    // The letter being written survives a reload.
    $: if (mounted)
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify({ subject, html }));
            localStorage.setItem(TEST_KEY, testEmail);
        } catch {}

    const saveDraft = () => {
        const name = draftName.trim() || subject.trim() || "Untitled";
        drafts = [...drafts.filter((d) => d.name != name), { name, subject, html }];
        draftName = name;
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    };
    const loadDraft = (name: string) => {
        const d = drafts.find((d) => d.name == name);
        if (!d) return;
        ({ subject, html } = d);
        draftName = d.name;
        mode = "custom";
    };
    const deleteDraft = () => {
        drafts = drafts.filter((d) => d.name != draftName);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
        draftName = "";
    };
    const editSystemCopy = () => {
        if (!system?.source) return;
        html = system.source;
        subject = `${system.label}: paper #<%= submission.local_id %>`;
        mode = "custom";
    };

    const insertPlaceholder = (path: string) => {
        const tag = `<%= ${path} %>`;
        if (lastFocus == "subject" && subjectInput) {
            const start = subjectInput.selectionStart ?? subject.length;
            const end = subjectInput.selectionEnd ?? start;
            subject = subject.slice(0, start) + tag + subject.slice(end);
            setTimeout(() => {
                subjectInput.focus();
                subjectInput.setSelectionRange(start + tag.length, start + tag.length);
            });
            return;
        }
        if (!view) {
            html += tag;
            return;
        }
        const { from, to } = view.state.selection.main;
        view.dispatch({ changes: { from, to, insert: tag }, selection: { anchor: from + tag.length } });
        view.focus();
    };

    // ---- sender ----
    // The site's address, or the chair's own SMTP account. Everything but the password is
    // remembered in this browser; the password stays only in this page.
    const SMTP_KEY = "chair-mailing-smtp";
    let senderMode: "system" | "own" = "system";
    let smtp = { host: "", port: 465, security: "ssl", user: "", pass: "", from: "", name: "" };
    let smtpStatus: { ok: boolean; text: string } | null = null;
    let smtpChecking = false;
    onMount(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(SMTP_KEY) ?? "null");
            if (saved) {
                senderMode = saved.mode == "own" ? "own" : "system";
                smtp = { ...smtp, ...saved.smtp, pass: "" };
            }
        } catch {}
    });
    $: if (mounted)
        try {
            const { pass, ...rest } = smtp;
            localStorage.setItem(SMTP_KEY, JSON.stringify({ mode: senderMode, smtp: rest }));
        } catch {}
    // Any change to the account makes the last check stale.
    const resetCheck = (..._deps: unknown[]) => (smtpStatus = null);
    $: resetCheck(smtp, senderMode);
    const setSecurity = (security: string) => {
        smtp.security = security;
        if (security == "ssl" && smtp.port == 587) smtp.port = 465;
        if (security == "starttls" && smtp.port == 465) smtp.port = 587;
    };
    $: senderAddress = senderMode == "own" ? smtp.from.trim() || smtp.user.trim() : data.systemFrom;
    const senderBody = () => (senderMode == "own" ? { sender: smtp } : {});
    const checkSmtp = async () => {
        smtpChecking = true;
        let status: { ok: boolean; text: string };
        try {
            const r = await post({ action: "smtp-check", sender: smtp });
            status = {
                ok: true,
                text: `Works: logged in and sent a check letter from ${r.from} to itself.`,
            };
        } catch (e) {
            status = { ok: false, text: (e as Error).message };
        }
        smtpChecking = false;
        smtpStatus = status;
    };

    // ---- server calls ----
    const payload = (action: string, extraBody: object = {}) => ({
        action,
        template: mode == "custom" ? { mode: "custom", subject, html } : { mode: "system", key: mode },
        submissions: [...selected],
        audience,
        extra,
        ...senderBody(),
        ...extraBody,
    });
    const post = async (body: object) => {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body),
        });
        const json = await response.json().catch(() => null);
        if (!response.ok) throw new Error(json?.message ?? `HTTP ${response.status}`);
        return json;
    };

    let preview: {
        count: number;
        recipients: { to: string; note: string }[];
        index: number;
        letter: { subject: string; html: string } | null;
    } | null = null;
    let previewError = "";
    let previewIndex = 0;
    let loading = false;
    const loadPreview = async (index = previewIndex) => {
        loading = true;
        previewError = "";
        try {
            preview = await post(payload("preview", { index }));
            previewIndex = preview!.index;
        } catch (e) {
            preview = null;
            previewError = (e as Error).message;
        } finally {
            loading = false;
        }
    };

    let testStatus = "";
    const sendTest = async () => {
        testStatus = "Sending…";
        try {
            const r = await post(payload("test", { testEmail, index: previewIndex }));
            testStatus = `Test sent to ${r.sent} (as for ${r.as})`;
        } catch (e) {
            testStatus = `Failed: ${(e as Error).message}`;
        }
    };

    let batches = data.batches;
    let sending = false;
    let sendStatus = "";
    const send = async () => {
        let count: number;
        try {
            count = (await post(payload("preview", { index: 0 }))).count;
        } catch (e) {
            alert((e as Error).message);
            return;
        }
        if (!count) {
            alert("No recipients: tick papers and/or add addresses.");
            return;
        }
        const what = mode == "custom" ? `“${subject}”` : `“${system?.label}”`;
        if (senderMode == "own" && !smtpStatus?.ok) {
            alert("Check the SMTP account first (the Check button in the Sender block).");
            return;
        }
        if (!confirm(`Send ${what} to ${count} recipient(s) from ${senderAddress}?`)) return;
        sending = true;
        try {
            const r = await post(payload("send"));
            sendStatus = `${r.total} letter(s) queued.`;
            const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
            if (response.ok) batches = await response.json();
        } catch (e) {
            alert(`Sending failed: ${(e as Error).message}`);
        } finally {
            sending = false;
        }
    };
</script>

<svelte:head>
    <title>Mailing · {data.conference.name}</title>
</svelte:head>

<div class="page">
    <div class="top">
        <BackButton url="/call_for_papers/{acronym}/submissions/view/chair" />
        <h3>Mailing · {data.conference.name}</h3>
    </div>

    <div class="grid">
        <section class="col">
            <h5>1. Recipients</h5>
            <FilterPanel bind:filters {submissions} topics={data.topics} shown={shown.length} />
            <div class="selbar">
                <span><strong>{selected.size}</strong> paper(s) selected</span>
                <button
                    class="link"
                    on:click={() => (selected = new Set([...selected, ...shown.map((s) => s.id)]))}
                    >Select all {shown.length} shown</button
                >
                {#if selected.size}<button class="link" on:click={() => (selected = new Set())}
                        >Clear</button
                    >{/if}
            </div>
            <div class="tablebox">
                <SubmissionsTable rows={shown} {acronym} bind:selected compact />
            </div>
            <div class="aud">
                <span class="caption">Send to</span>
                <label><input type="radio" bind:group={audience} value="corresponding" /> Corresponding authors</label>
                <label><input type="radio" bind:group={audience} value="all" /> All authors</label>
                <label><input type="radio" bind:group={audience} value="presenters" /> Presenters</label>
            </div>
            <label class="extra">
                <span class="caption">Additional addresses (one per line)</span>
                <textarea
                    bind:value={extra}
                    rows="5"
                    placeholder={"someone@example.com\nauthor.new@example.com #12\nguest@example.com Ivan Petrov"}
                ></textarea>
            </label>
            <small class="muted">
                Add a paper number (<code>#12</code>) to fill in that paper and its author's name — e.g. to
                resend a letter to a corrected address. A name after the address fills
                <code>recipient.first_name</code>/<code>last_name</code>. System letters need a paper number.
            </small>
            <p class="estimate">≈ <strong>{estimate}</strong> letter(s)</p>
        </section>

        <section class="col">
            <h5>2. Letter</h5>
            <div class="row">
                <label class="grow">
                    <span class="caption">Template</span>
                    <select bind:value={mode}>
                        <option value="custom">Custom letter</option>
                        <optgroup label="System letters">
                            {#each data.systemTemplates as t}
                                <option value={t.key}>{t.label}</option>
                            {/each}
                        </optgroup>
                    </select>
                </label>
                {#if mode == "custom"}
                    <label class="grow">
                        <span class="caption">Saved drafts</span>
                        <select value={draftName} on:change={(e) => loadDraft(e.currentTarget.value)}>
                            <option value="">—</option>
                            {#each drafts as d}<option value={d.name}>{d.name}</option>{/each}
                        </select>
                    </label>
                {/if}
            </div>

            {#if system}
                <p class="muted">
                    The system letter is sent exactly as the site sends it, with its own subject and the
                    paper's data.
                    {#if system.source}
                        <button class="link" on:click={editSystemCopy}>Edit a copy as a custom letter</button>
                    {/if}
                </p>
            {:else}
                <label>
                    <span class="caption">Subject</span>
                    <input
                        bind:this={subjectInput}
                        bind:value={subject}
                        on:focus={() => (lastFocus = "subject")}
                        placeholder="Subject"
                    />
                </label>
                <span class="caption">Body (HTML)</span>
                <div class="editor" on:focusin={() => (lastFocus = "body")}>
                    <CodeMirror
                        bind:value={html}
                        lang={htmlLang()}
                        lineWrapping
                        on:ready={(e) => (view = e.detail)}
                    />
                </div>
                <div class="placeholders">
                    <span class="caption">Insert placeholder (into {lastFocus == "subject" ? "subject" : "body"})</span>
                    {#each data.placeholders as g}
                        <div class="ph-group">
                            <b>{g.name}</b>
                            {#each g.fields as f}
                                <button class="ph" on:click={() => insertPlaceholder(`${g.name}.${f}`)}>{f}</button>
                            {/each}
                        </div>
                    {/each}
                </div>
                <div class="row">
                    <input class="grow" bind:value={draftName} placeholder="Draft name" />
                    <button class="small secondary" on:click={saveDraft}>Save draft</button>
                    {#if drafts.some((d) => d.name == draftName)}
                        <button class="small secondary outline" on:click={deleteDraft}>Delete</button>
                    {/if}
                </div>
            {/if}

            <h5>3. Sender</h5>
            <div class="aud">
                <label><input type="radio" bind:group={senderMode} value="system" /> Site address ({data.systemFrom})</label>
                <label><input type="radio" bind:group={senderMode} value="own" /> Own SMTP account</label>
            </div>
            {#if senderMode == "own"}
                <div class="smtp">
                    <label class="span2">
                        <span class="caption">SMTP server</span>
                        <input bind:value={smtp.host} placeholder="smtp.example.com" autocomplete="off" />
                    </label>
                    <label>
                        <span class="caption">Security</span>
                        <select value={smtp.security} on:change={(e) => setSecurity(e.currentTarget.value)}>
                            <option value="ssl">SSL/TLS</option>
                            <option value="starttls">STARTTLS</option>
                        </select>
                    </label>
                    <label>
                        <span class="caption">Port</span>
                        <select bind:value={smtp.port}>
                            {#each data.smtpPorts as p}<option value={p}>{p}</option>{/each}
                        </select>
                    </label>
                    <label class="span2">
                        <span class="caption">Login</span>
                        <input bind:value={smtp.user} placeholder="name@example.com" autocomplete="off" />
                    </label>
                    <label class="span2">
                        <span class="caption">Password</span>
                        <input type="password" bind:value={smtp.pass} autocomplete="new-password" />
                    </label>
                    <label class="span2">
                        <span class="caption">From address (if not the login)</span>
                        <input type="email" bind:value={smtp.from} placeholder={smtp.user || "name@example.com"} />
                    </label>
                    <label class="span2">
                        <span class="caption">From name</span>
                        <input bind:value={smtp.name} placeholder="Organizing Committee" />
                    </label>
                </div>
                <div class="row">
                    <button
                        class="small"
                        on:click={checkSmtp}
                        disabled={smtpChecking || !smtp.host || !smtp.user || !smtp.pass}
                        >{smtpChecking ? "Checking…" : "Check"}</button
                    >
                    {#if smtpStatus}
                        <small class={smtpStatus.ok ? "green" : "error"}>{smtpStatus.text}</small>
                    {:else}
                        <small class="muted">
                            Logs in and sends a short check letter from this address to itself. Gmail,
                            Yandex and Mail.ru need an app password, not the account password. The
                            password is not saved.
                        </small>
                    {/if}
                </div>
            {/if}

            <h5>4. Check and send</h5>
            <div class="row">
                <button class="small" on:click={() => loadPreview(0)} disabled={loading}
                    >{loading ? "Rendering…" : "Preview"}</button
                >
                <input class="grow" type="email" bind:value={testEmail} placeholder="Test address" />
                <button class="small secondary" on:click={sendTest} disabled={!testEmail}>Send test</button>
            </div>
            {#if testStatus}<small class="muted">{testStatus}</small>{/if}
            {#if previewError}<p class="error">{previewError}</p>{/if}
            {#if preview}
                <div class="preview">
                    <div class="nav">
                        <button
                            class="small secondary"
                            disabled={previewIndex <= 0}
                            on:click={() => loadPreview(previewIndex - 1)}>‹</button
                        >
                        <span
                            >{preview.count ? previewIndex + 1 : 0} / {preview.count} recipients{#if preview.count}
                                — <b>{preview.recipients[previewIndex].to}</b>
                                <small>{preview.recipients[previewIndex].note}</small>{/if}</span
                        >
                        <button
                            class="small secondary"
                            disabled={previewIndex >= preview.count - 1}
                            on:click={() => loadPreview(previewIndex + 1)}>›</button
                        >
                    </div>
                    {#if preview.letter}
                        <div class="subj"><span class="caption">Subject</span> {preview.letter.subject}</div>
                        <iframe title="Letter preview" sandbox="" srcdoc={preview.letter.html}></iframe>
                    {:else}
                        <p class="muted">No recipients yet.</p>
                    {/if}
                    <details>
                        <summary>All recipients ({preview.count})</summary>
                        <ol class="rlist">
                            {#each preview.recipients as r}<li>{r.to} <small>{r.note}</small></li>{/each}
                        </ol>
                    </details>
                </div>
            {/if}
            <div class="row send">
                <button class="send-btn" disabled={sending} on:click={send}
                    >{sending ? "Queuing…" : `Send (≈${estimate})`}</button
                >
                <small class="muted">from {senderAddress || "—"}</small>
                {#if sendStatus}<span class="green">{sendStatus}</span>{/if}
            </div>
            <MailBatches {acronym} bind:batches />
        </section>
    </div>
</div>

<style>
    .page {
        --txt: var(--pico-color);
        max-width: 1700px;
        margin: 0 auto;
        padding: 0 16px 40px;
    }
    .top {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 10px;
    }
    .top h3 {
        margin: 0;
    }
    .grid {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
        gap: 24px;
    }
    @media (max-width: 1200px) {
        .grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
    h5 {
        margin: 6px 0 10px;
    }
    .tablebox {
        max-height: 520px;
        overflow: auto;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
    }
    .selbar,
    .aud,
    .row {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin: 8px 0;
    }
    .aud label,
    .row label {
        margin: 0;
        font-size: 14px;
    }
    .grow {
        flex: 1 1 200px;
    }
    .caption {
        display: block;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pico-muted-color);
        margin-bottom: 4px;
    }
    .aud .caption {
        margin: 0;
    }
    .extra {
        margin: 10px 0 4px;
    }
    .muted {
        color: var(--pico-muted-color);
        font-size: 13px;
    }
    .estimate {
        margin: 10px 0 0;
    }
    .editor {
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 6px;
        max-height: 520px;
        overflow: auto;
        font-size: 13px;
    }
    .placeholders {
        margin: 8px 0;
    }
    .ph-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        margin: 3px 0;
        font-size: 13px;
    }
    .ph-group b {
        min-width: 86px;
    }
    .ph,
    .small,
    .link {
        width: auto;
        min-width: 0;
        margin: 0;
    }
    .ph {
        padding: 1px 8px;
        font-size: 12px;
        font-family: monospace;
        border-radius: 999px;
        background: transparent;
        color: var(--pico-primary);
        border: 1px solid var(--pico-muted-border-color);
    }
    .small {
        padding: 6px 14px;
        font-size: 14px;
    }
    .link {
        padding: 0;
        border: 0;
        background: none;
        color: var(--pico-primary);
        text-decoration: underline;
        font-size: 14px;
    }
    input {
        height: 40px !important;
    }
    .preview {
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 8px;
        padding: 10px;
        margin: 8px 0;
    }
    .nav {
        display: flex;
        gap: 10px;
        align-items: center;
        font-size: 14px;
    }
    .nav span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .subj {
        margin: 8px 0;
        font-size: 14px;
    }
    .subj .caption {
        display: inline;
        margin-right: 6px;
    }
    iframe {
        width: 100%;
        height: 480px;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 6px;
        background: white;
    }
    .rlist {
        max-height: 240px;
        overflow: auto;
        font-size: 13px;
    }
    .error {
        color: var(--red);
        white-space: pre-line;
        font-size: 14px;
    }
    .send {
        margin-top: 16px;
    }
    .smtp {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0 12px;
    }
    .smtp label {
        margin: 0;
        font-size: 14px;
    }
    .smtp .span2 {
        grid-column: span 2;
    }
    @media (max-width: 600px) {
        .smtp {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
    .send-btn {
        width: auto;
        min-width: 0;
        margin: 0;
        background: var(--green);
        border-color: var(--green);
    }
    .green {
        color: var(--green);
    }
</style>
