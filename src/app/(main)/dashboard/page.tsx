import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function Page() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <textarea placeholder="Your Text" className="text-xl" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
