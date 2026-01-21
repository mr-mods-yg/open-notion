import Navbar from "@/components/navbar";



export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
        <Navbar/>
        <div className="w-full h-12"/>
        {children}
        </>
    );
}
