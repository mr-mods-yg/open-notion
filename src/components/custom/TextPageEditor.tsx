"use client";
import { Page } from '@/generated/prisma/client';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';

const TextPageEditor = ({ pageId }: { pageId: string }) => {
    const [inputTitle, setInputTitle] = useState<string>();
    const pageQuery = useQuery<{ page: Page }>({
        queryKey: ['page', pageId],
        queryFn: () => ky.get("/api/page/" + pageId).json()
    })
    if (pageQuery.isLoading) {
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            Loading..
        </div>
    }
    if(pageQuery.isFetched && inputTitle===undefined){
        setInputTitle(pageQuery.data?.page.name);
    }
    return (
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            <TextareaAutosize placeholder='Your Title' maxRows={2} className='text-2xl focus:outline-none focus:ring-0 resize-none' value={inputTitle} onChange={(e) => { setInputTitle(e.target.value) }} />
            <TextareaAutosize placeholder='Your Description' maxRows={9999} className='text-xl focus:outline-none focus:ring-0 resize-none' />
        </div>
    )
}

export default TextPageEditor
