"use client";
import { Block, BlockType } from "@/generated/prisma/client"
import { queryClient } from "@/providers/QueryProvider"
import { BlockContent } from "@/types/block";
import { useMutation } from "@tanstack/react-query"
import ky from "ky"

import React, { useEffect, useState } from "react"
import SlashMenu from "../SlashMenu";
import { filterCommands } from "@/commands/SlashCommands";
import { Checkbox } from "@/components/ui/checkbox";
import HighlightedText from "./HighlightedText";

type UpdateBlockMutation = {
    type: BlockType
    text: string;
    blockId: string
    checked?: boolean
}
type BlockEditorProps = {
    block: Block;
} & React.HTMLAttributes<HTMLDivElement>;

function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
    const innerRef = React.useRef<T>(null);

    React.useImperativeHandle(ref, () => innerRef.current as T);

    return innerRef;
}
const BlockEditor = React.forwardRef<HTMLDivElement, BlockEditorProps>(({ block, ...props }, ref) => {
    const [blockText, setBlockText] = useState<string>((block.content as BlockContent).text);
    const [blockType, setBlockType] = useState<BlockType>(block.type);
    const [menu, setMenu] = useState<{
        open: boolean;
        query: string;
    } | null>(null);
    const [checked, setChecked] = useState<boolean | undefined>(
        (block.content as BlockContent & { task?: boolean }).task ?? undefined
    );
    const [menuPos, setMenuPos] = useState({ left: 0 });

    const contentRef = useForwardedRef(ref);


    const updateBlockMutation = useMutation({
        retry: 3,
        mutationFn: async ({ text, checked, type }: UpdateBlockMutation) => {
            return ky.patch("/api/block/" + block.id, {
                json: {
                    type,
                    text,
                    task: checked
                }
            })
        },
        onMutate: async ({ text, type, checked, blockId }: UpdateBlockMutation) => {
            await queryClient.cancelQueries({ queryKey: ['blocks', block.pageId] });
            const previousBlocksData = queryClient.getQueryData<{ blocks: Block[] }>(['blocks', block.pageId]);

            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', block.pageId], (old) => {
                if (!old) return old;
                if (type == "todo") {
                    return {
                        ...old,
                        blocks: old.blocks.map((block) => (
                            block.id === blockId ? {
                                ...block,
                                type: "todo",
                                content: {
                                    text: text,
                                    task: checked ? checked : false,
                                }
                            } : block
                        ))
                    }
                }
                return {
                    ...old,
                    blocks: old.blocks.map((block) => (
                        block.id === blockId ? {
                            ...block,
                            type: "paragraph",
                            content: {
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
        if (checked == null) return;
        type TodoContent = {
            text: string;
            task: boolean;
        }
        if (block.type == "todo" && checked != (block.content as TodoContent).task) {
            console.log("mutating block - checked changed");
            const timeout = setTimeout(() => {
                updateBlockMutation.mutate({ blockId: block.id, type: blockType, text: blockText, checked })
            }, 100);

            return () => {
                clearTimeout(timeout);
            }
        }

    }, [block.content, block.id, block.type, blockText, blockType, checked, updateBlockMutation])
    useEffect(() => {
        if (blockText == null) return;
        if (blockText === (block.content as BlockContent).text && (block.type === blockType)) return;

        console.log("mutating block - text or type changed");
        console.log("blockText:", blockText);
        console.log("block.content.text:", (block.content as BlockContent).text);
        console.log("block.type:", block.type);
        console.log("blockType:", blockType);
        const timeoutDuration = (block.type != blockType) ? 100 : 300;
        // faster timeout for type : 100ms, slower timeout for content : 300ms
        const timeout = setTimeout(() => {
            updateBlockMutation.mutate({ blockId: block.id, type: blockType, text: blockText })
        }, timeoutDuration);

        return () => {
            clearTimeout(timeout);
        }

    }, [blockText, blockType, block.type, checked, block.content, block.id, updateBlockMutation])

    const handleBlockChange = (e: React.FormEvent<HTMLDivElement>) => {
        const event = e as unknown as React.KeyboardEvent<HTMLDivElement>;
        // Handle "/" key input to open the slash menu
        if (event.type === "input" && contentRef.current) {
            const value = contentRef.current.innerText;
            // If there's a "/" at beginning or after whitespace, open slash menu
            const sel = window.getSelection();
            let shouldOpenMenu = false;
            let query = "";
            if (sel && sel.anchorNode) {
                // Get the text up to cursor
                const anchorOffset = sel.anchorOffset;
                const currentText = value.slice(0, anchorOffset);
                // Check if there is a "/" just before the cursor
                const match = currentText.match(/(?:^|\s)\/(\w*)$/);
                if (match) {
                    shouldOpenMenu = true;
                    query = match[1] ?? "";
                }
            }
            if (shouldOpenMenu) {
                setMenu({
                    open: true,
                    query,
                });
                // Improved positioning: place menu under caret when "/" is typed
                if (contentRef.current) {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0).cloneRange();
                        // Insert a temporary span at the caret to get position
                        const tempSpan = document.createElement("span");
                        // Prevent changing layout
                        tempSpan.textContent = "\u200b";
                        range.insertNode(tempSpan);

                        // Get relative position to the contentRef
                        const tempRect = tempSpan.getBoundingClientRect();
                        const parentRect = contentRef.current.getBoundingClientRect();

                        // Calculate left position relative to parent
                        let left = tempRect.left - parentRect.left;

                        // Clean up the temp node
                        tempSpan.parentNode?.removeChild(tempSpan);

                        // Do not allow negative (left of box) position
                        if (left < 0) left = 0;

                        setMenuPos({ left });
                    } else {
                        setMenuPos({ left: 0 });
                    }
                } else {
                    setMenuPos({ left: 0 });
                }
            } else if (menu?.open) {
                setMenu(null);
            }
        }
        // Handle Other keys
        if (event.type === "input" && contentRef.current) {

        }
    }

    React.useEffect(() => {
        if (!contentRef.current) return;

        contentRef.current.innerText =
            (block.content as BlockContent).text ?? "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentRef, blockType]);

    const filtered = menu
        ? filterCommands(menu.query)
        : [];
    return <div className="relative w-full">
        {/* Highlight layer */}
        <div
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap wrap-break-word flex gap-1 items-center text-base sm:text-lg border-l-2 pl-2"
            aria-hidden
        >
            {blockType === "paragraph" && <HighlightedText text={blockText} />}
            {blockType === "todo" && <><span className="size-4" /><HighlightedText text={blockText} lineThrough={checked} /></>}
        </div>

        {/* New Editing Layer - Editable Div */}
        {blockType === "paragraph" && <div className="border-l-2 pl-2 flex items-center">
            <p contentEditable suppressContentEditableWarning
                ref={contentRef}
                className="flex-1 focus:outline-none text-transparent bg-transparent focus:ring-0 text-base sm:text-lg caret-black dark:caret-white"
                onInput={(e) => { handleBlockChange(e); setBlockText(e.currentTarget.innerText); }}
                {...props}
            /></div>}

        {blockType === "todo" && <div className="border-l-2 pl-2 flex items-center gap-1">
            <Checkbox
                checked={checked}
                onCheckedChange={(checkedValue) => setChecked(checkedValue === true)}
            />
            <p contentEditable suppressContentEditableWarning
                ref={contentRef}
                className={`flex-1 focus:outline-none text-transparent bg-transparent focus:ring-0 text-base sm:text-lg caret-black dark:caret-white`}
                onInput={(e) => { handleBlockChange(e); setBlockText(e.currentTarget.innerText); }}
                {...props}
            /></div>}


        {/* Additional Layer - Slash Menu */}
        {menu?.open && filtered.length > 0 && (
            <SlashMenu
                items={filtered}
                onSelect={(cmd) => {
                    if (blockType != cmd.id) {
                        console.log("old text: " + blockText);
                        const newText = blockText.replace(`/${menu.query}`, "");
                        console.log("new text: " + newText);
                        setBlockText((prev) => prev.replace(`/${menu.query}`, ""));
                        setTimeout(() => {
                            if (contentRef.current) {
                                contentRef.current.innerText = newText.replace(/ $/, '\u00A0'); // with trailing spaces
                            }
                        }, 0);
                        setBlockType(cmd.id as BlockType)
                    }
                    setMenu({ open: false, query: "" })
                }}
                position={menuPos}
            />
        )}
    </div>
});

BlockEditor.displayName = 'BlockEditor';




export default BlockEditor