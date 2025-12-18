import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            // create new workspace when the user has signed up
            if (ctx.path.startsWith("/sign-up")) {
                const newSession = ctx.context.newSession;
                const userId = newSession?.user.id;
                if (newSession && userId) {
                    
                    await prisma.$transaction(async (tx) => {
                        const existingWorkspace = await tx.workspace.findFirst({
                            where: {
                                userId: userId
                            }
                        })
                        if (!existingWorkspace) {
                            await tx.workspace.create({
                                data: {
                                    name: "Workspace 1",
                                    userId: userId
                                }
                            })
                        }
                    })
                }
            }
        }),
    }
});
