"use client";
import React from 'react'
import TextareaAutosize from 'react-textarea-autosize';
const TextEditor = () => {
    return (
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            <TextareaAutosize placeholder='Your Title' maxRows={2} className='text-2xl focus:outline-none focus:ring-0 resize-none' />
            <TextareaAutosize placeholder='Your Description' maxRows={9999} className='text-xl focus:outline-none focus:ring-0 resize-none' />
        </div>
    )
}

export default TextEditor
