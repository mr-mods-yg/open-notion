"use client"
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from './logo'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { signOut } from '@/lib/auth-client'
import { useRouter } from "next/navigation";


function Navbar() {
    const router = useRouter();
    const [menuState, setMenuState] = useState(false)
    return (
        <nav
            data-state={menuState && 'active'}
            className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
            <div className="m-auto max-w-5xl px-6">
                <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                    <div className="flex w-full justify-between lg:w-auto">
                        <Link
                            href="/"
                            aria-label="home"
                            className="flex items-center space-x-2">
                            <Logo />
                        </Link>

                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                        </button>
                    </div>

                    <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                        <div className="lg:pr-4">
                            <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                <li>
                                    <button
                                        // onClick={() => { if (item.to && item.to != "#") scrollToSection(item.to) }}
                                        className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                        <span>{"Account"}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                            <Button
                                asChild
                                size="sm">
                                <Button onClick={async () => {
                                    await signOut();
                                    router.push("/login");
                                }}>
                                    <span>Logout</span>
                                </Button>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
