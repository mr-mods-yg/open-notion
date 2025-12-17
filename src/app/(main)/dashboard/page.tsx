import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
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
            <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:px-16 md:py-16">
              <textarea placeholder="Your Title" className="flex-0 text-xl focus:outline-none focus:ring-0" />
              <textarea placeholder="Your Description" className="flex-1 text-xl focus:outline-none focus:ring-0" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
