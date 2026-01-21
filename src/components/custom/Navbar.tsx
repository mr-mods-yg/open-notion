import React from 'react'
import { Separator } from '../ui/separator'
import { SearchForm } from '../search-form'

function Navbar() {
    return (
        <header className="bg-background sticky top-0 z-50 flex flex-none w-full items-center border-b">
            <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
                <p>HelLO</p>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <SearchForm className="w-full sm:ml-auto sm:w-auto" />
            </div>
        </header>
    )
}

export default Navbar
