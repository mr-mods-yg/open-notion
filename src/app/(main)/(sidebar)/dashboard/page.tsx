"use client";
import { useSession } from "@/lib/auth-client";

export default function Page() {
  const session = useSession();
  
  if (session.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-svh flex flex-col items-center">
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="text-2xl">Welcome back {session.data?.user.name.split(" ")[0]}</div>
        <div className="py-4 flex flex-col gap-2">
          <ul className="list-disc list-inside text-xl">
            <li>Create a new page from the sidebar</li>
            <li>Open a existing page from the sidebar</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
