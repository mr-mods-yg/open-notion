import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/QueryProvider";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <QueryProvider>
                <div className="[--header-height:calc(--spacing(14))]">
                    <SidebarProvider className="flex flex-col">
                        <SiteHeader />
                        <div className="flex flex-1">
                            <AppSidebar />
                            <SidebarInset>
                                {children}
                            </SidebarInset>
                        </div>
                    </SidebarProvider>
                </div>
            </QueryProvider>
        </ThemeProvider>
    );
}
