import { getUserSubmissions } from "$src/lib/database/submissions";
import { error } from "@sveltejs/kit";

export const load = async ({ parent }: { parent: any }) => {
    const data = await parent();

    if (data.user == null) error(403);
    const submissions = await getUserSubmissions(data.user.id, {
        id: true,
        local_id: true,
        conference: { select: { short_name: true, acronym: true } },
        title: true,
        status: true,
        created_at: true,
    });
    return { submissions };
};
