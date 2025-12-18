import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if (!session) {
        return NextResponse.json({ error: "Unauthenticated" }, {
            status: 401
        });
    }
    const userId = session?.user.id;
    const body = await req.json();
    const { name, workspaceId } = body;
    if (!workspaceId) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const { workspaceFound, page } = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.findUnique({
            where: {
                id: workspaceId
            }
        })
        if (!workspace) {
            return { workspaceFound: false }
        }
        const page = await tx.page.create({
            data: {
                name: name || "Untitled",
                workspaceId: workspaceId,
                userId: userId
            }
        })
        return { workspaceFound: true, page }
    })
    if (!workspaceFound) {
        return NextResponse.json({ error: "Workspace not found" }, {
            status: 400
        });
    }
    return NextResponse.json({ success: true, page });
}