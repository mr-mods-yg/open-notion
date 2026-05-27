import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if (!session) {
        return NextResponse.json({ error: "Unauthenticated" }, {
            status: 401
        });
    }
    const userId = session?.user.id;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
        return NextResponse.json({ results: [] });
    }

    try {
        const queryStr = `%${query}%`;
        
        // Search in the content JSON field (where content->>'text' matches the query)
        const results = await prisma.$queryRaw<any[]>`
            SELECT 
                b.id,
                b.type,
                b.content,
                b."pageId",
                p.name as "pageName"
            FROM "Block" b
            INNER JOIN pages p ON b."pageId" = p.id
            WHERE b."userId" = ${userId}
              AND b.content->>'text' ILIKE ${queryStr}
            ORDER BY b."updatedAt" DESC
            LIMIT 50
        `;

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
