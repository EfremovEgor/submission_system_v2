import prisma from "$src/lib/database/prisma.js";
import { error, json } from "@sveltejs/kit";
const confirmParticipation = async (submissionId: number) => {
    await prisma.submission.update({data:{
        particiaption_confirmed: true,
        withdrawn:false,
    },
    where:{
        id:submissionId
    }
})
};
export async function POST({ request, cookies, params }) {
    const {
        action,
    }: {
        action: string;
    } = await request.json();
    if (!["confirm"].includes(action)) error(422);
    if (action == "confirm")
        await confirmParticipation(parseInt(params.submissionId));
    return json({ status: "ok" });
}
