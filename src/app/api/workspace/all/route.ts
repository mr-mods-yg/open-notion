import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: (await headers())
    });
    if(!session){
        return NextResponse.json({ error: "Unauthenticated" },{
            status: 401
        });
    }
    const userId = session?.user.id;
    const workspaces = await prisma.workspace.findMany({
        where: {
            userId: userId
        }
    })
    return NextResponse.json({ workspaces });
}