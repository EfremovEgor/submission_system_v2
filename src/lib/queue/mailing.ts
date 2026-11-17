import { MAILING_SETTINGS } from "$src/lib/email/mailing";
import transporter from "$src/lib/email/setup.server";
import { redis } from "$src/lib/redis/redis";
import { Queue, Worker, type Job } from "bullmq";
import { connection } from "./queues";

// Chair mailings and decision letters go through this queue: one job per letter, sent one
// at a time with a pause, so a long mailing neither blocks the request nor floods the SMTP
// server. Progress of every batch lives in Redis (DB 0, under "mailbatch:" keys).

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
    total: number;
    sent: number;
    failed: number;
    failures: { to: string; note?: string; error: string }[];
}

const batchKey = (id: string) => `mailbatch:${id}`;
const failuresKey = (id: string) => `mailbatch:${id}:failures`;
const historyKey = (conferenceId: number) => `mailbatches:${conferenceId}`;

export const mailingQueue = new Queue<MailJobData>(QUEUE_NAME, { connection });

export const enqueueMailBatch = async ({
    conferenceId,
    label,
    createdBy,
    messages,
}: {
    conferenceId: number;
    label: string;
    createdBy: string;
    messages: MailMessage[];
}) => {
    const id = crypto.randomUUID();
    await redis.hSet(batchKey(id), {
        label,
        created_at: new Date().toISOString(),
        created_by: createdBy,
        total: messages.length,
        sent: 0,
        failed: 0,
    });
    await redis.expire(batchKey(id), BATCH_TTL_S);
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

export const sendNow = (message: MailMessage) =>
    transporter.sendMail({
        from: MAILING_SETTINGS.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
    });

const processor = async (job: Job<MailJobData>) => {
    await sendNow(job.data);
    await redis.hIncrBy(batchKey(job.data.batchId), "sent", 1);
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
});
mailingWorker.on("error", (e) => console.error("Mailing worker error", e));
