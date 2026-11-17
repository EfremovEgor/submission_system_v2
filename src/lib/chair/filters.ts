// Filters of the chair submission lists (dashboard and mailing). Every filter narrows the
// list; an empty multi-choice filter means "any". The state round-trips through the URL
// so a filtered list can be bookmarked or sent to a colleague.

export type TriState = "any" | "yes" | "no";

export interface ChairFilters {
    q: string;
    ids: string;
    statuses: string[];
    formats: string[];
    topics: number[];
    countries: string[];
    withdrawn: TriState;
    confirmed: TriState;
    presentation: TriState;
    manuscript: TriState;
}

export interface FilterableSubmission {
    id: number;
    local_id: number;
    title: string;
    status: string;
    presentation_format: string;
    withdrawn: boolean;
    particiaption_confirmed: boolean;
    presentation_file: unknown;
    manuscript_file: unknown;
    topic: { id: number; name: string };
    authors: {
        first_name: string;
        last_name: string;
        email: string;
        country: string;
        affiliation: string;
    }[];
}

export const STATUS_OPTIONS = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under review" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
];

export const FORMAT_OPTIONS = [
    { value: "offline", label: "On-site" },
    { value: "online", label: "Online" },
];

export const TRI_FILTERS = [
    { key: "withdrawn", label: "Withdrawn" },
    { key: "confirmed", label: "Confirmed" },
    { key: "presentation", label: "Presentation" },
    { key: "manuscript", label: "Manuscript" },
] as const;

export const emptyFilters = (): ChairFilters => ({
    q: "",
    ids: "",
    statuses: [],
    formats: [],
    topics: [],
    countries: [],
    withdrawn: "any",
    confirmed: "any",
    presentation: "any",
    manuscript: "any",
});

/** "1-10, 15 22" -> {1..10, 15, 22}; null when empty, "invalid" when it can't be read. */
export const parseIdList = (text: string): Set<number> | null | "invalid" => {
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) return null;
    const out = new Set<number>();
    for (const part of parts) {
        const m = part.replace(/^#/, "").match(/^(\d+)(?:-(\d+))?$/);
        if (!m) return "invalid";
        const from = Number(m[1]);
        const to = m[2] ? Number(m[2]) : from;
        if (to < from || to - from > 10000) return "invalid";
        for (let i = from; i <= to; i++) out.add(i);
    }
    return out;
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");

const tri = (value: TriState, actual: boolean) =>
    value == "any" || (value == "yes") == actual;

export const matchesFilters = (s: FilterableSubmission, f: ChairFilters, ids = parseIdList(f.ids)) => {
    if (ids == "invalid") return false;
    if (ids && !ids.has(s.local_id)) return false;
    if (f.statuses.length && !f.statuses.includes(s.status)) return false;
    if (f.formats.length && !f.formats.includes(s.presentation_format)) return false;
    if (f.topics.length && !f.topics.includes(s.topic.id)) return false;
    if (f.countries.length && !s.authors.some((a) => f.countries.includes(a.country))) return false;
    if (!tri(f.withdrawn, s.withdrawn)) return false;
    if (!tri(f.confirmed, s.particiaption_confirmed)) return false;
    if (!tri(f.presentation, !!s.presentation_file)) return false;
    if (!tri(f.manuscript, !!s.manuscript_file)) return false;
    const words = norm(f.q).split(/\s+/).filter(Boolean);
    if (words.length) {
        const haystack = norm(
            [
                `#${s.local_id}`,
                s.title,
                s.topic.name,
                ...s.authors.flatMap((a) => [
                    `${a.first_name} ${a.last_name}`,
                    a.email,
                    a.affiliation,
                    a.country,
                ]),
            ].join(" \u0001 "),
        );
        if (!words.every((w) => haystack.includes(w))) return false;
    }
    return true;
};

export const applyFilters = <T extends FilterableSubmission>(list: T[], f: ChairFilters) => {
    const ids = parseIdList(f.ids);
    return list.filter((s) => matchesFilters(s, f, ids));
};

/** How many submissions a facet value would show, keeping all the other filters. */
export const facetCount = <T extends FilterableSubmission>(
    list: T[],
    f: ChairFilters,
    patch: Partial<ChairFilters>,
) => applyFilters(list, { ...f, ...patch }).length;

export const activeFilterCount = (f: ChairFilters) => {
    const e = emptyFilters();
    return (Object.keys(e) as (keyof ChairFilters)[]).filter(
        (k) => JSON.stringify(f[k]) != JSON.stringify(e[k]),
    ).length;
};

const LIST_KEYS = ["statuses", "formats", "countries"] as const;
const TRI_KEYS = ["withdrawn", "confirmed", "presentation", "manuscript"] as const;

export const filtersToParams = (f: ChairFilters, params = new URLSearchParams()) => {
    for (const k of ["q", "ids", ...LIST_KEYS, "topics", ...TRI_KEYS]) params.delete(k);
    if (f.q) params.set("q", f.q);
    if (f.ids) params.set("ids", f.ids);
    for (const k of LIST_KEYS) if (f[k].length) params.set(k, f[k].join("|"));
    if (f.topics.length) params.set("topics", f.topics.join("|"));
    for (const k of TRI_KEYS) if (f[k] != "any") params.set(k, f[k]);
    return params;
};

export const filtersFromParams = (params: URLSearchParams): ChairFilters => {
    const f = emptyFilters();
    f.q = params.get("q") ?? "";
    f.ids = params.get("ids") ?? "";
    for (const k of LIST_KEYS) f[k] = (params.get(k) ?? "").split("|").filter(Boolean);
    f.topics = (params.get("topics") ?? "").split("|").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    for (const k of TRI_KEYS) {
        const v = params.get(k);
        if (v == "yes" || v == "no") f[k] = v;
    }
    return f;
};
