import QueryProvider from "@/providers/QueryProvider";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <QueryProvider>
            {children}
        </QueryProvider>
    );
}
