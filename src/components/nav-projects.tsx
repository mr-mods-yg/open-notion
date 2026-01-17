"use client"

import {
  FileText,
  LoaderCircle,
  MoreHorizontal,
  Share,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "./ui/button"
import { useState } from "react"
import ky from "ky"
import { queryClient } from "@/providers/QueryProvider"
import { redirect } from "next/navigation"

export function NavProjects({
  pages,
  workspace
}: {
  pages: {
    name: string
    id: string
  }[],
  workspace?: string
}) {
  const { isMobile } = useSidebar()
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState<boolean>();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {pages?.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={"/page/" + item.id}>
                <FileText />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Share className="text-muted-foreground" />
                  <span>Share Page</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Dialog open={open} onOpenChange={(open)=>setOpen(open)}>
                    <DialogTrigger className="w-full relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none outline-hidden text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/15 focus:text-destructive dark:hover:bg-destructive/20 dark:focus:bg-destructive/25 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 [&_svg]:text-destructive!">
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Page</span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </DialogDescription>
                        <DialogFooter className="sm:justify-center">
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              No, dont
                            </Button>
                          </DialogClose>
                          <Button type="button" variant="destructive" disabled={isDeleting} onClick={async ()=>{
                            setIsDeleting(true);
                            await ky.delete(`/api/page/${item.id}`);
                            if(workspace) {
                                await queryClient.refetchQueries({
                                  queryKey: ['pages', workspace]
                                })
                            }
                            setIsDeleting(false);
                            setOpen(false);
                            redirect("/dashboard");
                          }}>
                            {isDeleting ? <span className="flex gap-1 items-center">
                              <LoaderCircle className="animate-spin" /> Deleting
                            </span> : "Yes, delete it"}
                          </Button>
                        </DialogFooter>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton>
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
