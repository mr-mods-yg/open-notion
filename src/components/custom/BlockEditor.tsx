import { Block } from "@/generated/prisma/client"
import { queryClient } from "@/providers/QueryProvider"
import { useMutation } from "@tanstack/react-query"
import ky from "ky"
import React, { useEffect, useState } from "react"

type BlockContent = {
    text: string
}
type UpdateBlockMutation = {
    text: string;
    blockId: string
}
function BlockEditor({ block }: { block: Block }) {
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
        if (!blockText) return;
        if (blockText === (block.content as BlockContent).text) return
        const timeout = setTimeout(() => {
            updateBlockMutation.mutate({ blockId: block.id, text: blockText })
        }, 700)

        return () => {
            clearTimeout(timeout);
        }
    }, [blockText, block.content, block.id, updateBlockMutation])

    React.useEffect(() => {
        setBlockText((block.content as BlockContent).text)
    }, [block.content])

    return <textarea key={block.id} rows={1}
        value={blockText}
        onChange={(e) => setBlockText(e.target.value)}
        className='text-xl focus:outline-none focus:ring-0 resize-none' />
}

export default BlockEditor