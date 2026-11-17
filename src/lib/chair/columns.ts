import { presentation_formats, submission_statuses, titles } from "$src/lib/aliases";
import { utils, write } from "xlsx";

export interface ExportSubmission {
    id: number;
    local_id: number;
    title: string;
    status: string;
    presentation_format: string;
    withdrawn: boolean;
    particiaption_confirmed: boolean;
    created_at: Date;
    updated_at: Date;
    presentation_file: { original_name: string } | null;
    manuscript_file: { original_name: string } | null;
    topic: { name: string; symposium: { name: string } | null };
    authors: {
        title: string;
        first_name: string;
        last_name: string;
        email: string;
        country: string;
        affiliation: string;
        is_corresponding: boolean;
        is_presenter: boolean;
    }[];
}

type Author = ExportSubmission["authors"][number];
const name = (a: Author) => `${a.first_name} ${a.last_name}`;
const yesNo = (v: boolean) => (v ? "Yes" : "No");
const uniq = (list: string[]) => [...new Set(list.filter(Boolean))];

export interface ExportColumn {
    key: string;
    label: string;
    value: (s: ExportSubmission, origin: string) => string | number;
    default?: boolean;
}

// Columns the chair can pick for the Excel export.
export const EXPORT_COLUMNS: ExportColumn[] = [
    { key: "local_id", label: "#", value: (s) => s.local_id, default: true },
    { key: "title", label: "Title", value: (s) => s.title, default: true },
    { key: "authors", label: "Authors", value: (s) => s.authors.map(name).join(", "), default: true },
    {
        key: "authors_full",
        label: "Authors with affiliations",
        value: (s) =>
            s.authors
                .map((a) => `${titles[a.title] ?? a.title} ${name(a)}, ${a.affiliation}, ${a.country}`.trim())
                .join("\n"),
    },
    {
        key: "corresponding",
        label: "Corresponding author",
        value: (s) => s.authors.filter((a) => a.is_corresponding).map(name).join(", "),
    },
    {
        key: "corresponding_email",
        label: "Corresponding email",
        value: (s) => uniq(s.authors.filter((a) => a.is_corresponding).map((a) => a.email)).join(", "),
        default: true,
    },
    { key: "emails", label: "All emails", value: (s) => uniq(s.authors.map((a) => a.email)).join(", ") },
    {
        key: "presenter",
        label: "Presenter",
        value: (s) => s.authors.filter((a) => a.is_presenter).map(name).join(", "),
    },
    { key: "countries", label: "Countries", value: (s) => uniq(s.authors.map((a) => a.country)).join(", "), default: true },
    { key: "affiliations", label: "Affiliations", value: (s) => uniq(s.authors.map((a) => a.affiliation)).join("; ") },
    { key: "authors_count", label: "Number of authors", value: (s) => s.authors.length },
    { key: "symposium", label: "Symposium", value: (s) => s.topic.symposium?.name ?? "" },
    { key: "topic", label: "Topic", value: (s) => s.topic.name, default: true },
    {
        key: "format",
        label: "Presentation format",
        value: (s) => presentation_formats[s.presentation_format] ?? s.presentation_format,
        default: true,
    },
    { key: "status", label: "Status", value: (s) => submission_statuses[s.status] ?? s.status, default: true },
    { key: "withdrawn", label: "Withdrawn", value: (s) => yesNo(s.withdrawn), default: true },
    { key: "confirmed", label: "Confirmed", value: (s) => yesNo(s.particiaption_confirmed), default: true },
    { key: "presentation", label: "Presentation uploaded", value: (s) => yesNo(!!s.presentation_file) },
    { key: "manuscript", label: "Manuscript uploaded", value: (s) => yesNo(!!s.manuscript_file) },
    { key: "created_at", label: "Submitted at", value: (s) => new Date(s.created_at).toLocaleString() },
    { key: "updated_at", label: "Last updated", value: (s) => new Date(s.updated_at).toLocaleString() },
    {
        key: "link",
        label: "Link",
        value: (s, origin) => `${origin}/call_for_papers/__ACRONYM__/submissions/${s.id}/chair`,
    },
];

export const defaultExportColumns = () => EXPORT_COLUMNS.filter((c) => c.default).map((c) => c.key);

export const buildExportXLSX = (
    submissions: ExportSubmission[],
    columnKeys: string[],
    { origin, acronym }: { origin: string; acronym: string },
) => {
    const columns = EXPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
    const rows = submissions.map((s) =>
        columns.map((c) => {
            const v = c.value(s, origin);
            return typeof v == "string" ? v.replace("__ACRONYM__", acronym) : v;
        }),
    );
    const sheet = utils.aoa_to_sheet([columns.map((c) => c.label), ...rows]);
    sheet["!cols"] = columns.map((c) =>
        ({ title: { wch: 60 }, authors: { wch: 40 }, authors_full: { wch: 60 }, link: { wch: 50 } })[
            c.key as "title"
        ] ?? { wch: Math.max(10, c.label.length + 2) },
    );
    sheet["!autofilter"] = { ref: utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: columns.length - 1 } }) };
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Submissions");
    return write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
};

/** Saves a Blob as a file in the browser. */
export const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
