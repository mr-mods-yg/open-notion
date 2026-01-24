import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
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
    const body = await req.json();
    if (body.text == null) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const blocksLength = await prisma.block.count({
        where: {
            pageId,
            userId
        }
    })
    const block = await prisma.block.create({
        data: {
            id: body.id,
            type: body.type || "paragraph",
            userId,
            pageId,
            order: body.order || blocksLength + 1,
            content: { text: body.text }
        }
    })
    return NextResponse.json({ block });
}