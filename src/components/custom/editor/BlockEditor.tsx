"use client";
import { Block } from "@/generated/prisma/client"
import { queryClient } from "@/providers/QueryProvider"
import { BlockContent } from "@/types/block";
import { useMutation } from "@tanstack/react-query"
import ky from "ky"
import { ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react"
// import { TextareaAutosizeProps } from 'react-textarea-autosize';
// import SlashMenu from "../SlashMenu";
// import { filterCommands } from "@/commands/SlashCommands";

type UpdateBlockMutation = {
    text: string;
    blockId: string
}
type BlockEditorProps = {
    block: Block;
} & React.HTMLAttributes<HTMLDivElement>;

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
    const innerRef = React.useRef<T>(null);

    React.useImperativeHandle(ref, () => innerRef.current as T);

    return innerRef;
}

const BlockEditor = React.forwardRef<HTMLDivElement, BlockEditorProps>(({ block, ...props }, ref) => {
    const [blockText, setBlockText] = useState<string>((block.content as BlockContent).text);
    // const [menu, setMenu] = useState<{
    //     open: boolean;
    //     query: string;
    //     slashIndex: number;
    // } | null>(null);
    // const [menuPos, setMenuPos] = useState({ left: 0 });

    const contentRef = useForwardedRef(ref);

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

    // console.log(menuPos)


    React.useEffect(() => {
        if (!contentRef.current) return;

        contentRef.current.innerText =
            (block.content as BlockContent).text ?? "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // console.log(blockText)
    // const filtered = menu
    //     ? filterCommands(menu.query)
    //     : [];
    return <div className="relative w-full">
        {/* Highlight layer */}
        <div
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap wrap-break-word text-base sm:text-lg border-l-2 pl-2"
            aria-hidden
        >
            <HighlightedText text={blockText} />
        </div>

        <div contentEditable suppressContentEditableWarning
            ref={contentRef}
            className="border-l-2 pl-2 focus:outline-none text-transparent bg-transparent focus:ring-0 text-base sm:text-lg caret-black dark:caret-white"
            onInput={(e) => { setBlockText(e.currentTarget.innerText); }}
            {...props}

        />


        {/* Textarea */}
        {/* <TextareaAutosize ref={textareaRef}
            value={blockText}
            onChange={(e) => { handleBlockChange(e); setBlockText(e.target.value) }}
            {...props}
            className='relative w-full text-base sm:text-lg bg-transparent text-transparent focus:outline-none focus:ring-0 caret-black dark:caret-white resize-none border-l-2 border-l-transparent pl-2 outline-none' /> */}
        {/* {menu?.open && filtered.length > 0 && (
            <SlashMenu
                items={filtered}
                onSelect={() => { }}
                position={menuPos}
            />
        )} */}
    </div>
});

BlockEditor.displayName = 'BlockEditor';

function HighlightedText({ text }: { text: string }) {
    const parts: { text: string; isUrl: boolean }[] = [];
    const [hoverLink, setHoverLink] = useState<string | null>(null);
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
                    <span
                        key={i}
                        className="relative inline-block"
                        onMouseEnter={() => setHoverLink(p.text)}
                        onMouseLeave={() => setHoverLink(null)}
                    >
                        {/* link */}
                        <span
                            className="
                                text-blue-700 dark:text-blue-400
                                underline
                                pointer-events-auto
                                cursor-pointer
                            "
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = p.text.startsWith("http") ? p.text : `https://${p.text}`;
                                window.open(url, "_blank");
                            }}
                        >
                            {p.text}
                        </span>

                        {/* tooltip */}
                        {hoverLink === p.text && (
                            <span
                                className="
                                    absolute left-0 top-full mt-1
                                    z-50
                                    bg-foreground text-background
                                    text-xs
                                    px-2 py-1
                                    rounded
                                    whitespace-nowrap
                                    shadow flex gap-1
                                    "
                            >
                                Open link <ExternalLink size={15} />
                            </span>
                        )}
                    </span>
                ) : (
                    <span key={i}>{p.text}</span>
                )
            )}
        </span>
    );
}


export default BlockEditor