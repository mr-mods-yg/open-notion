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
    try {
        const prisma_res = await prisma.$transaction(async (tx) => {
            const pageShare = await tx.pageShare.findUnique({
                where: {
                    pageId: pageId
                }
            })
            if (pageShare) return { pageShare }
            const page = await tx.page.findUnique({
                where: {
                    userId,
                    id: pageId
                }
            })
            if (!page) return { errCode: "PAGE_NOT_FOUND" }
            const createdPageShare = await tx.pageShare.create({
                data: {
                    pageId,
                    IsPublic: true,
                }
            })
            return { pageShare: createdPageShare }
        })
        const errCode = prisma_res?.errCode;
        if (errCode && errCode === "PAGE_NOT_FOUND") {
            return NextResponse.json({ error: "Page not found!" }, {
                status: 401
            });
        }
        return NextResponse.json({ pageShare: prisma_res?.pageShare });
    } catch (error) {
        console.error("error during creating share : " + (error as Error).message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}