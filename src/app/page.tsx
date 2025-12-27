import HeroSection from "@/components/hero-section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders
  });
  if (session?.user.id) {
    redirect("/dashboard");
  }
  return (
    <HeroSection />
  );
}
