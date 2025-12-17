"use client";

import LoginPage from "@/components/login"
import { signIn } from "@/lib/auth-client";

export default function LoginPageRouted() {
    async function handleLogin() {
        await signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
        });
    }

    return (
        <LoginPage handleLogin={handleLogin} />
    );
}
