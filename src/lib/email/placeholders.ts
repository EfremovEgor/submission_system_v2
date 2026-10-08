// Renders chair-written mailing templates. Only "<%= path.to.value %>" placeholders
// are supported: compiling user-supplied templates with EJS would let anyone who can
// send a mailing run arbitrary code on the server.
const PLACEHOLDER = /<%[=-]\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*%>/g;

const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const formatValue = (value: unknown) => {
    if (value == null) return "";
    if (value instanceof Date)
        return value.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });
    return String(value);
};

const lookup = (data: Record<string, unknown>, path: string) =>
    path.split(".").reduce<unknown>((value, key) => {
        if (value == null || typeof value != "object") return undefined;
        return Object.hasOwn(value, key)
            ? (value as Record<string, unknown>)[key]
            : undefined;
    }, data);

export const renderPlaceholders = (
    template: string,
    data: Record<string, unknown>,
    { escape }: { escape: boolean } = { escape: true },
) =>
    template.replace(PLACEHOLDER, (_, path: string) => {
        const value = formatValue(lookup(data, path));
        return escape ? escapeHtml(value) : value;
    });

// Any "<% ... %>" tag left after rendering is unsupported template code.
export const findUnsupportedTag = (template: string) =>
    template.replace(PLACEHOLDER, "").match(/<%[\s\S]*?%>/)?.[0] ?? null;
