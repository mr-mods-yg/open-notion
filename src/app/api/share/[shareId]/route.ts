import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
    const shareId = (await params).shareId;
    if (!shareId) {
        return NextResponse.json({ error: "Bad Request" }, {
            status: 400
        });
    }
    const page = await prisma.page.findFirst({
        where: {
            share: {
                id: shareId
            },
        },
        include: {
            blocks: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })
    return NextResponse.json({ page });
}