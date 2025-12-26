"use client";
import { Block, Page, Workspace } from '@/generated/prisma/client';
import { useSession } from '@/lib/auth-client';
import { queryClient } from '@/providers/QueryProvider';
import { useMutation, useQuery } from '@tanstack/react-query';
import ky from 'ky';
import React, { useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import BlockEditor from './BlockEditor';
import { BlockContent } from '@/types/block';

function computeOrder(prev?: number, next?: number) {
    if (prev == null && next == null) return 1
    else if (prev == null) return 1;
    else if (next == null) return prev + 1;
    return (prev + next) / 2
}
type CreateBlockMutation = {
    tempId: string;
    text: string;
    order?: number;
}

type DeleteBlockMutation = {
    blockId: string
    prevBlockId?: string
}

const TextPageEditor = ({ pageId }: { pageId: string }) => {
    const [inputTitle, setInputTitle] = useState<string>();
    const [inputFirstBlock, setInputFirstBlock] = useState<string>();
    const [firstBlockId, setFirstBlockId] = React.useState<string | null>(null)
    const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)
    const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

    const session = useSession();
    const userId = session.data?.user.id;
    const pageQuery = useQuery<{ page: Page }>({
        queryKey: ['page', pageId],
        queryFn: () => ky.get("/api/page/" + pageId).json(),

    })
    const blocksQuery = useQuery<{ blocks: Block[] }>({
        queryKey: ['blocks', pageId],
        queryFn: () => ky.get("/api/blocks/" + pageId).json()
    })

    const updateTitleMutation = useMutation({
        mutationFn: async (title: string) => {
            return ky.patch(`/api/page/${pageId}`, {
                json: {
                    title
                }
            })
        },
        onMutate: async (newTitle: string) => {
            await queryClient.cancelQueries({ queryKey: ["page", pageId] })
            const previous = queryClient.getQueryData<{ page: Page }>([
                "page",
                pageId,
            ])
            queryClient.setQueryData(["page", pageId], {
                page: { ...previous!.page, name: newTitle },
            })

            return { previous }
        },
        onError: (_err, _newTitle, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(["page", pageId], ctx.previous)
            }
        },
        onSuccess: () => {
            const workspacesQueryData = queryClient.getQueryData<{ workspaces: Workspace[] }>(['workspaces']);
            const currentWorkspace = workspacesQueryData?.workspaces[0].id;
            queryClient.invalidateQueries({ queryKey: ['pages', currentWorkspace] })
        }
    })

    const createBlockMutation = useMutation({
        mutationFn: async ({ text, order }: CreateBlockMutation) => {
            return (await ky.post("/api/block/create/" + pageId, {
                json: { text, order }
            })).json<{ block: Block }>()
        },
        onMutate: async ({ tempId, text, order }: CreateBlockMutation) => {
            await queryClient.cancelQueries({ queryKey: ['blocks', pageId] });
            const previousQueryData = queryClient.getQueryData<{ blocks: Block[] }>(['blocks', pageId]);
            const previousBlocks = previousQueryData ? previousQueryData.blocks ? previousQueryData.blocks : [] : [];
            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', pageId], (old) => {
                if (!old) return old;
                return {
                    blocks: [...old.blocks, {
                        id: tempId,
                        pageId: pageId,
                        userId: userId || crypto.randomUUID(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        type: "paragraph" as Block["type"],
                        order: order ? order : previousBlocks.length + 1,
                        content: { text: text },
                    }]
                }
            })
            return { previousQueryData, tempId }
        },
        onSuccess: async (data, _vars, ctx) => {
            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', pageId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    blocks: old.blocks.map((block) => block.id === ctx.tempId ? data.block : block)
                }
            })
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    blockRefs.current[data.block.id]?.focus();
                });
            });

        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previousQueryData) {
                queryClient.setQueryData(['blocks', pageId], ctx.previousQueryData)
            }
        }
    })

    const deleteBlockMutation = useMutation({
        mutationFn: async ({ blockId }: DeleteBlockMutation) => {
            return (await ky.delete("/api/block/" + blockId)).json<{ success: boolean, deleted: boolean }>()
        },
        onMutate: async ({ blockId }: DeleteBlockMutation) => {
            await queryClient.cancelQueries({ queryKey: ['blocks', pageId] });
            const previous = queryClient.getQueryData<{ blocks: Block[] }>(['blocks', pageId]);
            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', pageId],
                (old) => {
                    if (!old) return old;
                    return {
                        blocks: old.blocks.filter((block) => block.id !== blockId)
                    }
                }
            )
            return { previous }
        },
        onSuccess(data, variables) {
            if (variables.prevBlockId) {
                blockRefs.current[variables.prevBlockId]?.focus();

            }
        },
        onError(_err, _vars, ctx) {
            if (ctx?.previous) {
                queryClient.setQueryData(['blocks', pageId], ctx.previous);
            }
        }
    })
    if (pageQuery.isLoading) {
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            Loading..
        </div>
    }
    React.useEffect(() => {
        if (pageQuery.data?.page.name) {
            setInputTitle(pageQuery.data.page.name)
        }
    }, [pageQuery.data?.page.name])

    const serverTitle = pageQuery.data?.page.name

    React.useEffect(() => {
        if (!inputTitle) return
        if (inputTitle === serverTitle) return

        const timeout = setTimeout(() => {
            updateTitleMutation.mutate(inputTitle)
        }, 700)

        return () => clearTimeout(timeout)
    }, [inputTitle, serverTitle, updateTitleMutation])

    React.useEffect(() => {
        if (!inputFirstBlock) return;
        if (firstBlockId) return; // to stop duplicates
        const timeout = setTimeout(() => {
            const tempId = `${crypto.randomUUID()}`;
            createBlockMutation.mutate({ tempId, text: inputFirstBlock })
            setFirstBlockId(tempId)
        }, 700);
        return () => {
            clearTimeout(timeout)
        }
    }, [inputFirstBlock, firstBlockId, createBlockMutation])

    const HandleBlockKeyDown = ({ e, currentBlockId }: { e: React.KeyboardEvent<HTMLTextAreaElement>, currentBlockId: string}) => {
        if (e.key != "ArrowUp" && e.key != "ArrowDown" && e.key != "Enter" && e.key != "Backspace") return;
        const blocksData = blocksQuery.data?.blocks;
        if(!blocksData) return;
        
        const index = blocksData.findIndex(b => b.id === currentBlockId);
        const prevBlock = index > 0 ? blocksData[index - 1] : null;
        const blockContent = blocksData[index].content;

        if (e.key == "Backspace" && blockContent && (blockContent as BlockContent).text == "") {
            deleteBlockMutation.mutate({ blockId: currentBlockId, prevBlockId: prevBlock?.id })
        }
        if (e.key == "Backspace") return; // makes sure backspace key is functional

        e.preventDefault(); // prevent all default actions

        // ARROWS HANDLING
        const currentBlock = index >= 0 ? blocksData[index] : null;
        const nextBlock = index < blocksData.length - 1 ? blocksData[index + 1] : null;
        
        if (e.key === "ArrowUp" && prevBlock) {
            e.preventDefault()
            blockRefs.current[prevBlock.id]?.focus()
        }

        if (e.key === "ArrowDown" && nextBlock) {
            e.preventDefault()
            blockRefs.current[nextBlock.id]?.focus()
        }

        if (e.key !== "Enter") return // move in this block only if Enter key is pressed
        // CREATE NEW BLOCK

        const newOrder = computeOrder(currentBlock?.order, nextBlock?.order);
        const tempId = crypto.randomUUID()
        setPendingFocusId(tempId)
        createBlockMutation.mutate({ tempId, text: "", order: newOrder });
    }

    React.useEffect(() => {
        if (!pendingFocusId) return
        requestAnimationFrame(() => {
            blockRefs.current[pendingFocusId]?.focus()
        })
        const el = blockRefs.current[pendingFocusId]
        if (!el) return

        el.focus()
        setPendingFocusId(null)
    }, [blocksQuery.dataUpdatedAt, pendingFocusId])

    const blocks =
        blocksQuery.isFetched
            ? [...(blocksQuery.data?.blocks ?? [])].sort(
                (a, b) => a.order - b.order
            )
            : [];

    return (
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            <TextareaAutosize placeholder='Your Title' maxRows={2} className='text-lg sm:text-2xl focus:outline-none focus:ring-0 resize-none' value={inputTitle} onChange={(e) => { setInputTitle(e.target.value) }} />
            <div className='flex flex-col gap-2'>
                {blocks.map((block) =>
                    <BlockEditor
                        key={block.id}
                        onKeyDown={(e) => HandleBlockKeyDown({ e, currentBlockId: block.id })}
                        ref={(el) => {
                            if (el) blockRefs.current[block.id] = el
                            else delete blockRefs.current[block.id]
                        }}
                        block={block}
                    />)}
                {blocks.length === 0 && <textarea placeholder={"Write something..."} onChange={(e) => setInputFirstBlock(e.target.value)} rows={1} className='text-base md:text-lg focus:outline-none focus:ring-0 resize-none border-l-2 px-1' />}
            </div>
        </div>
    )
}

export default TextPageEditor
