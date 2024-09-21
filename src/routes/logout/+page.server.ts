import { redis } from "$src/lib/redis/redis.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
    const sessionToken = cookies.get("SESSION");
    if (sessionToken == null) redirect(302, "/sign-in");
    redis.del(sessionToken);
    cookies.delete("SESSION", { path: "/", secure: false });
    redirect(302, "/sign-in");
};
