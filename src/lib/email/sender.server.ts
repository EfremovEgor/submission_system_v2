import { error } from "@sveltejs/kit";
import nodemailer from "nodemailer";

// Same rule as for recipients (recipients.server.ts), kept here so this module needs no database.
const EMAIL_PATTERN = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

// A chair mailing can go out through the chair's own SMTP account instead of the site's
// address: host, port, login and password typed on the mailing page. The password is never
// stored in the browser; on the server it lives only while the batch is being sent.

export type SmtpSecurity = "ssl" | "starttls";

export interface SmtpSender {
    host: string;
    port: number;
    security: SmtpSecurity;
    user: string;
    pass: string;
    /** Address in the "From" header; the login when empty. */
    from: string;
    /** Display name in the "From" header, optional. */
    name: string;
}

// Only mail ports: the chair should not be able to make the server knock on anything else.
export const SMTP_PORTS = [25, 465, 587, 2525];
const HOST_PATTERN = /^(?=.{1,253}$)[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/** Validated sender from a request body, or null for the site's own address. */
export const parseSender = (raw: unknown): SmtpSender | null => {
    if (raw == null || raw === false) return null;
    const s = raw as Record<string, unknown>;
    const str = (v: unknown) => (typeof v == "string" ? v.trim() : "");
    const host = str(s.host).toLowerCase();
    const port = Number(s.port);
    const security: SmtpSecurity = s.security == "starttls" ? "starttls" : "ssl";
    const user = str(s.user);
    const pass = typeof s.pass == "string" ? s.pass : "";
    const from = str(s.from) || user;
    const name = str(s.name).replace(/[\r\n"]/g, "");
    if (!HOST_PATTERN.test(host)) error(422, "SMTP: invalid server name");
    if (!SMTP_PORTS.includes(port)) error(422, `SMTP: port must be one of ${SMTP_PORTS.join(", ")}`);
    if (!user) error(422, "SMTP: login is empty");
    if (!pass) error(422, "SMTP: password is empty");
    if (!EMAIL_PATTERN.test(from)) error(422, "SMTP: invalid sender address");
    return { host, port, security, user, pass, from, name };
};

export const createSenderTransport = (s: SmtpSender) =>
    nodemailer.createTransport({
        host: s.host,
        port: s.port,
        secure: s.security == "ssl",
        requireTLS: s.security == "starttls",
        auth: { user: s.user, pass: s.pass },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 60_000,
    });

export const senderFrom = (s: SmtpSender) => (s.name ? { name: s.name, address: s.from } : s.from);

/** Human-readable label of a sender, e.g. for the batch history. */
export const senderLabel = (s: SmtpSender) => `${s.from} via ${s.host}:${s.port}`;

/** Readable reason for an SMTP failure. */
export const smtpErrorMessage = (e: unknown) => {
    const err = e as { code?: string; responseCode?: number; response?: string; message?: string };
    if (err?.code == "EAUTH") return `login or password rejected (${err.response ?? err.message})`;
    if (err?.code == "ETIMEDOUT" || (err?.code == "ESOCKET" && /timed? ?out/i.test(err.message ?? "")))
        return "the server did not answer in time: check the server name, port and security";
    if (err?.code == "EDNS" || /ENOTFOUND|EAI_AGAIN/.test(err?.message ?? ""))
        return "server name not found";
    if (err?.code == "ECONNECTION" || /ECONNREFUSED|ECONNRESET/.test(err?.message ?? ""))
        return `connection failed: ${err.message}`;
    if (/wrong version number|ssl3_get_record|EPROTO/i.test(err?.message ?? ""))
        return "TLS handshake failed: try the other security option (SSL/TLS for 465, STARTTLS for 587)";
    return err?.response ?? err?.message ?? String(e);
};

/**
 * Connects and logs in; with `deliver`, also sends a short letter from the sender to itself,
 * which proves the server accepts the "From" address. Throws a 422 with the reason.
 */
export const checkSender = async (s: SmtpSender, { deliver = false } = {}) => {
    const transport = createSenderTransport(s);
    let step = "connection and login";
    try {
        await transport.verify();
        if (deliver) {
            step = "sending";
            await transport.sendMail({
                from: senderFrom(s),
                to: s.from,
                subject: "SMTP check",
                text: `This letter checks that the conference mailing can send from ${s.from} via ${s.host}:${s.port}. No reply needed.`,
            });
        }
    } catch (e) {
        error(422, `SMTP check failed (${step}): ${smtpErrorMessage(e)}`);
    } finally {
        transport.close();
    }
};
