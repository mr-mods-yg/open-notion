"use client";
import { Block } from "@/generated/prisma/client"
import { queryClient } from "@/providers/QueryProvider"
import { BlockContent } from "@/types/block";
import { useMutation } from "@tanstack/react-query"
import ky from "ky"
import React, { useEffect, useState } from "react"
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';


type UpdateBlockMutation = {
    text: string;
    blockId: string
}
type BlockEditorProps = {
    block: Block;
} & TextareaAutosizeProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

const BlockEditor = React.forwardRef<HTMLTextAreaElement, BlockEditorProps>(({ block, ...props }, ref) => {
    const [blockText, setBlockText] = useState<string>((block.content as BlockContent).text);
    const updateBlockMutation = useMutation({
        mutationFn: async ({ text }: UpdateBlockMutation) => {
            return ky.patch("/api/block/" + block.id, {
                json: {
                    text
                }
            })
        },
        onMutate: async ({ text, blockId }: UpdateBlockMutation) => {
            await queryClient.cancelQueries({ queryKey: ['blocks', block.pageId] });
            const previousBlocksData = queryClient.getQueryData<{ blocks: Block[] }>(['blocks', block.pageId]);

            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', block.pageId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    blocks: old.blocks.map((block) => (
                        block.id === blockId ? {
                            ...block,
                            content: {
                                ...(block.content as BlockContent),
                                text: text,
                            }
                        } : block
                    ))
                }
            })
            return { previousBlocksData }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previousBlocksData) {
                queryClient.setQueryData(['blocks', block.pageId], ctx.previousBlocksData)
            }

        }
    })

    useEffect(() => {
        if (blockText == null) return;
        if (blockText === (block.content as BlockContent).text) return
        const timeout = setTimeout(() => {
            updateBlockMutation.mutate({ blockId: block.id, text: blockText })
        }, 300)

        return () => {
            clearTimeout(timeout);
        }
    }, [blockText, block.content, block.id, updateBlockMutation])

    React.useEffect(() => {
        setBlockText((block.content as BlockContent).text)
    }, [block.content])
    // console.log(blockText)
    return <div className="relative w-full">
        {/* Highlight layer */}
        <div
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap wrap-break-word text-base sm:text-lg border-l-2 pl-2"
            aria-hidden
        >
            <HighlightedText text={blockText} />
        </div>

        {/* Textarea */}
        <TextareaAutosize ref={ref} key={block.id}
            value={blockText}
            onChange={(e) => setBlockText(e.target.value)}
            {...props}
            className='relative w-full text-base sm:text-lg bg-transparent text-transparent focus:outline-none focus:ring-0 caret-black resize-none border-l-2 pl-2 outline-none' />
    </div>
});

BlockEditor.displayName = 'BlockEditor';

function HighlightedText({ text }: { text: string }) {
    const parts: { text: string; isUrl: boolean }[] = [];
    let lastIndex = 0;

    text.replace(URL_REGEX, (match, _, offset) => {
        if (offset > lastIndex) {
            parts.push({ text: text.slice(lastIndex, offset), isUrl: false });
        }
        parts.push({ text: match, isUrl: true });
        lastIndex = offset + match.length;
        return match;
    });

    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), isUrl: false });
    }

    return (
        <span>
            {parts.map((p, i) =>
                p.isUrl ? (
                    <span key={i} className="text-blue-700 dark:text-blue-400 underline">
                        {p.text}
                    </span>
                ) : (
                    <span key={i}>{p.text}</span>
                )
            )}
        </span>
    );
}


export default BlockEditor