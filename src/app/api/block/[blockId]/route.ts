import { BlockType } from "@/generated/prisma/enums";
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
    const inputBlockType = body.type;

    if (body.text == null) {
        return NextResponse.json({ error: "Bad Request : Text is null" }, {
            status: 400
        });
    }

    if (inputBlockType == null || !Object.keys(BlockType).includes(inputBlockType)) {
        return NextResponse.json({ error: "Bad Request : Invalid Type " }, {
            status: 400
        });
    }
    if (body.task != null && typeof body.task !== "boolean") {
        return NextResponse.json({ error: "Bad Request : Invalid task" }, {
            status: 400
        });
    }
    let block;
    if (inputBlockType == "paragraph") {
        block = await prisma.block.update({
            where: {
                id: blockId,
                userId
            },
            data: {
                type: inputBlockType,
                content: { text: body.text || "" }
            }
        })
    }
    else if (inputBlockType == "todo") {
        block = await prisma.block.update({
            where: {
                id: blockId,
                userId
            },
            data: {
                type: inputBlockType,
                content: { task: body.task ? body.task : false, text: body.text || "" }
            }
        })
    }
    return NextResponse.json({ success: true, block });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ blockId: string }> }) {
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
    try {
        await prisma.block.delete({
            where: {
                id: blockId,
                userId,
            },
        })
        return NextResponse.json({ success: true, deleted: true })
    } catch (error) {
        console.log((error as Error).message);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}