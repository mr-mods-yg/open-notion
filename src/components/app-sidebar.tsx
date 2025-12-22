"use client"

import {
  FileText,
  PlusIcon,
  SquarePen,
} from "lucide-react"
import ky from "ky";
// import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { TeamSwitcher } from "./team-switcher"
import { Page, Workspace } from "@/generated/prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "New Page",
      url: "#",
      icon: PlusIcon,
      isActive: true,
      items: [

      ],
    }
  ],
  navSecondary: [
    // {
    //   title: "Support",
    //   url: "#",
    //   icon: LifeBuoy,
    // },
  ],
  pages: [
    {
      name: "Design Engineering",
      url: "#",
      icon: FileText,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: FileText,
    },
    {
      name: "Travel",
      url: "#",
      icon: FileText,
    },
  ],
}
type PageCreateResponse = {
  page: { id: string; name: string; }
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;
  const [workspace, setWorkspace] = useState<string>();
  const workspaceQuery = useQuery<{ workspaces: Workspace[] }>({
    queryKey: ['workspaces'], queryFn: () => {
      return ky.get("/api/workspace/all").json();
    }
  })

  const pagesQuery = useQuery<{ pages: Page[] }>({
    queryKey: ['pages', workspace],
    queryFn: () => {
      return ky.get(`/api/page/all/${workspace}`).json();
    },
    enabled: workspaceQuery.isSuccess && !!workspace
  })

  if (!user) {
    return <></>
  }

  const userInfo = {
    name: user.name,
    email: user.email,
    avatar: user.image ?? "/avatars/shadcn.jpg",
  }
  if (workspaceQuery.isFetched && !workspace) {
    setWorkspace(workspaceQuery.data?.workspaces[0].id)
  }
  if (pagesQuery.isFetched) {
    console.log(pagesQuery.data);
  }
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        {workspaceQuery.isFetched && <TeamSwitcher teams={workspaceQuery.data?.workspaces as { name: string }[]} />}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={async () => {
              if (workspace) {
                const res: PageCreateResponse = await ky.post("/api/page", {
                  json: {
                    workspaceId: workspace
                  }
                }).json()
                pagesQuery.refetch();
                router.push("/page/" + res.page.id);
              }
            }}>
              <div className="flex gap-2 items-center px-1">
                <SquarePen className="size-5" />
                New Page
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects pages={pagesQuery.data?.pages as { name: string, id: string }[]} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  )
}
