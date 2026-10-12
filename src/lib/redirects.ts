// Keeps the page a visitor was heading to across sign-in, sign-up and email
// confirmation, so they land back on it once signed in.
export const REDIRECT_PARAM = "redirectTo";

const DEFAULT_AFTER_SIGN_IN = "/author";
// Sending someone back to these after signing in would loop or log them out.
const AUTH_PATHS = [
    "/sign-in",
    "/sign-up",
    "/logout",
    "/recovery",
    "/email_confirmation",
];

// Only same-site paths are accepted, so a crafted ?redirectTo= can't send people
// to another site ("//evil.com", "/\evil.com" and similar resolve off-site and are rejected).
export const safeRedirectPath = (
    path: string | null | undefined,
    fallback = DEFAULT_AFTER_SIGN_IN,
) => {
    if (!path?.startsWith("/")) return fallback;
    const base = "http://localhost";
    let url: URL;
    try {
        url = new URL(path, base);
    } catch {
        return fallback;
    }
    if (url.origin != base) return fallback;
    if (
        AUTH_PATHS.some(
            (authPath) =>
                url.pathname == authPath ||
                url.pathname.startsWith(authPath + "/"),
        )
    )
        return fallback;
    return url.pathname + url.search + url.hash;
};

// The redirect target carried by the current auth page URL, if any.
export const getRedirectParam = (url: URL) =>
    url.searchParams.get(REDIRECT_PARAM);

// `path` (an auth page) carrying the page to return to afterwards.
export const withRedirect = (path: string, redirectTo: string | null) =>
    redirectTo
        ? `${path}?${REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`
        : path;

// Sign-in URL that brings the visitor back to the page they requested.
export const signInUrl = (url: URL) =>
    withRedirect("/sign-in", url.pathname + url.search);
