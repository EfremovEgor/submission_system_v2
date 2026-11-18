import { MAILING_SETTINGS } from "$src/lib/email/mailing";
import {
    createSenderTransport,
    senderFrom,
    senderLabel,
    smtpErrorMessage,
    type SmtpSender,
} from "$src/lib/email/sender.server";
import transporter from "$src/lib/email/setup.server";
import { redis } from "$src/lib/redis/redis";
import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./queues";

// Chair mailings and decision letters go through this queue: one job per letter, sent one
// at a time with a pause, so a long mailing neither blocks the request nor floods the SMTP
// server. Progress of every batch lives in Redis (DB 0, under "mailbatch:" keys).
// A batch sent through the chair's own SMTP account keeps that account under
// "mailbatch:<id>:smtp" only until its last letter is sent or has failed.

const QUEUE_NAME = "chair_mailing";
const SEND_INTERVAL_MS = 1200;
const BATCH_TTL_S = 60 * 60 * 24 * 90;
const HISTORY_LENGTH = 50;

export interface MailMessage {
    to: string;
    subject: string;
    html: string;
    /** Shown in the batch log, e.g. "#12". */
    note?: string;
}

interface MailJobData extends MailMessage {
    batchId: string;
}

export interface MailBatch {
    id: string;
    label: string;
    created_at: string;
    created_by: string;
    /** Sender of a batch sent through the chair's own SMTP account. */
    from?: string;
    total: number;
    sent: number;
    failed: number;
    failures: { to: string; note?: string; error: string }[];
}

const batchKey = (id: string) => `mailbatch:${id}`;
const failuresKey = (id: string) => `mailbatch:${id}:failures`;
const historyKey = (conferenceId: number) => `mailbatches:${conferenceId}`;
const senderKey = (id: string) => `mailbatch:${id}:smtp`;
const SENDER_TTL_S = 60 * 60 * 24 * 3;

export const mailingQueue = new Queue<MailJobData>(QUEUE_NAME, { connection });

export const enqueueMailBatch = async ({
    conferenceId,
    label,
    createdBy,
    messages,
    sender = null,
}: {
    conferenceId: number;
    label: string;
    createdBy: string;
    messages: MailMessage[];
    sender?: SmtpSender | null;
}) => {
    const id = crypto.randomUUID();
    await redis.hSet(batchKey(id), {
        label,
        created_at: new Date().toISOString(),
        created_by: createdBy,
        ...(sender ? { from: senderLabel(sender) } : {}),
        total: messages.length,
        sent: 0,
        failed: 0,
    });
    await redis.expire(batchKey(id), BATCH_TTL_S);
    if (sender && messages.length) await redis.set(senderKey(id), JSON.stringify(sender), { EX: SENDER_TTL_S });
    await redis.lPush(historyKey(conferenceId), id);
    await redis.lTrim(historyKey(conferenceId), 0, HISTORY_LENGTH - 1);
    if (messages.length)
        await mailingQueue.addBulk(
            messages.map((message, i) => ({
                name: "send",
                data: { ...message, batchId: id },
                opts: {
                    jobId: `${id}-${i}`,
                    attempts: 3,
                    backoff: { type: "exponential", delay: 10_000 },
                    removeOnComplete: true,
                    removeOnFail: 1000,
                },
            })),
        );
    return id;
};

export const getMailBatch = async (id: string): Promise<MailBatch | null> => {
    const raw = await redis.hGetAll(batchKey(id));
    if (!raw.label) return null;
    const failures = (await redis.lRange(failuresKey(id), 0, -1)).map((f) =>
        JSON.parse(f),
    );
    return {
        id,
        label: raw.label,
        created_at: raw.created_at,
        created_by: raw.created_by,
        ...(raw.from ? { from: raw.from } : {}),
        total: Number(raw.total),
        sent: Number(raw.sent),
        failed: Number(raw.failed),
        failures,
    };
};

export const listMailBatches = async (conferenceId: number) => {
    const ids = await redis.lRange(historyKey(conferenceId), 0, -1);
    const batches = await Promise.all(ids.map(getMailBatch));
    return batches.filter((b): b is MailBatch => b != null);
};

/** Sends one letter right away: through the given SMTP account, or the site's address. */
export const sendNow = async (message: MailMessage, sender: SmtpSender | null = null) => {
    const letter = { to: message.to, subject: message.subject, html: message.html };
    if (!sender) return transporter.sendMail({ from: MAILING_SETTINGS.from, ...letter });
    const transport = createSenderTransport(sender);
    try {
        return await transport.sendMail({ from: senderFrom(sender), ...letter });
    } catch (e) {
        throw new Error(smtpErrorMessage(e));
    } finally {
        transport.close();
    }
};

// One pooled connection per batch that has its own SMTP account.
const batchTransports = new Map<string, { sender: SmtpSender; transport: ReturnType<typeof createSenderTransport> }>();

const batchSender = async (batchId: string) => {
    const cached = batchTransports.get(batchId);
    if (cached) return cached;
    const raw = await redis.get(senderKey(batchId));
    if (!raw) return null;
    const sender = JSON.parse(raw) as SmtpSender;
    const entry = { sender, transport: createSenderTransport(sender) };
    batchTransports.set(batchId, entry);
    return entry;
};

/** Forgets the batch's SMTP account once every letter is sent or has failed. */
const finishIfDone = async (batchId: string) => {
    const raw = await redis.hmGet(batchKey(batchId), ["total", "sent", "failed"]);
    const [total, sent, failed] = raw.map(Number);
    if (sent + failed < total) return;
    await redis.del(senderKey(batchId));
    batchTransports.get(batchId)?.transport.close();
    batchTransports.delete(batchId);
};

const processor = async (job: Job<MailJobData>) => {
    const { batchId, ...message } = job.data;
    // A batch made for the chair's own account never falls back to the site's address.
    const ownAccount = !!(await redis.hGet(batchKey(batchId), "from"));
    const own = ownAccount ? await batchSender(batchId) : null;
    if (ownAccount && !own) throw new Error("the SMTP account of this mailing is no longer stored; send it again");
    if (own) {
        try {
            await own.transport.sendMail({
                from: senderFrom(own.sender),
                to: message.to,
                subject: message.subject,
                html: message.html,
            });
        } catch (e) {
            throw new Error(smtpErrorMessage(e));
        }
    } else {
        await sendNow(message);
    }
    await redis.hIncrBy(batchKey(batchId), "sent", 1);
    await finishIfDone(batchId);
};

export const mailingWorker = new Worker<MailJobData>(QUEUE_NAME, processor, {
    connection,
    concurrency: 1,
    limiter: { max: 1, duration: SEND_INTERVAL_MS },
});
mailingWorker.on("failed", async (job, e) => {
    if (!job) return;
    console.error(`Mail to ${job.data.to} failed (attempt ${job.attemptsMade})`, e);
    // Count a letter as failed only once retries are exhausted.
    if (job.attemptsMade < (job.opts.attempts ?? 1)) return;
    await redis.hIncrBy(batchKey(job.data.batchId), "failed", 1);
    await redis.rPush(
        failuresKey(job.data.batchId),
        JSON.stringify({ to: job.data.to, note: job.data.note, error: String(e?.message ?? e) }),
    );
    await redis.expire(failuresKey(job.data.batchId), BATCH_TTL_S);
    await finishIfDone(job.data.batchId);
});
mailingWorker.on("error", (e) => console.error("Mailing worker error", e));
