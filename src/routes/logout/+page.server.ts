import { deleteSession } from "$src/lib/auth.sever";
import { redis } from "$src/lib/redis/redis.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
    const sessionToken = cookies.get("SESSION");
    if (sessionToken == null) redirect(302, "/sign-in");
    await deleteSession(redis, sessionToken);
    cookies.delete("SESSION", { path: "/" });
    redirect(302, "/sign-in");
};
