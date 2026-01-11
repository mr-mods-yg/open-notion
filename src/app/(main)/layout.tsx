import QueryProvider from "@/providers/QueryProvider";
import { LayoutWrapper } from "@/components/layout-wrapper";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <QueryProvider>
            <LayoutWrapper>
                {children}
            </LayoutWrapper>
        </QueryProvider>
    );
}
