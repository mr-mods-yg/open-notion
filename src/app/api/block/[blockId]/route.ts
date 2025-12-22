import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ blockId: string }> }) {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if (!session) {
        return NextResponse.json({ error: "Unauthenticated" }, {
            status: 401
        });
    }
    const userId = session?.user.id;
    const blockId = (await params).blockId;
    if (!blockId) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const body = await req.json();
    if (!body.text) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const block = await prisma.block.update({
        where: {
            id: blockId,
            userId
        },
        data: {
            content: { text: body.text || "" }
        }
    })
    return NextResponse.json({ block });
}