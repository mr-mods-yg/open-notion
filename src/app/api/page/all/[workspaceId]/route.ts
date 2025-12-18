import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if (!session) {
        return NextResponse.json({ error: "Unauthenticated" }, {
            status: 401
        });
    }
    const userId = session?.user.id;
    const workspaceId = (await params).workspaceId;
    if(!workspaceId){
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const pages = await prisma.page.findMany({
        where: {
            userId: userId,
            workspaceId: workspaceId
        }
    })
    return NextResponse.json({ pages });
}