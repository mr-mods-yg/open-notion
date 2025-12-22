import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if (!session) {
        return NextResponse.json({ error: "Unauthenticated" }, {
            status: 401
        });
    }
    const userId = session?.user.id;
    const pageId = (await params).pageId;
    if (!pageId) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const blocks = await prisma.block.findMany({
        where: {
            pageId,
            userId
        },
        orderBy: {
            order: 'asc'
        }
    })
    return NextResponse.json({ blocks });
}