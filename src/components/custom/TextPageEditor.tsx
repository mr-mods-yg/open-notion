"use client";
import { Block, Page, Workspace } from '@/generated/prisma/client';
import { useSession } from '@/lib/auth-client';
import { queryClient } from '@/providers/QueryProvider';
import { useMutation, useQuery } from '@tanstack/react-query';
import ky from 'ky';
import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import BlockEditor from './BlockEditor';

const TextPageEditor = ({ pageId }: { pageId: string }) => {
    const [inputTitle, setInputTitle] = useState<string>();
    const [inputFirstBlock, setInputFirstBlock] = useState<string>();
    const [firstBlockId, setFirstBlockId] = React.useState<string | null>(null)

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

    type CreateBlockMutation = {
        tempId: string;
        text: string;
    }

    const createBlockMutation = useMutation({
        mutationFn: async ({ text }: CreateBlockMutation) => {
            return (await ky.post("/api/block/create/" + pageId, {
                json: { text }
            })).json<{ block: Block }>()
        },
        onMutate: async ({ tempId, text }: CreateBlockMutation) => {
            await queryClient.cancelQueries({ queryKey: ['blocks', pageId] });
            const previousQueryData = queryClient.getQueryData<{ blocks: Block[] }>(['blocks', pageId]);
            const previousBlocks = previousQueryData ? previousQueryData.blocks ? previousQueryData.blocks : [] : [];
            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', pageId], {
                blocks: [...previousBlocks, {
                    id: tempId,
                    pageId: pageId,
                    userId: userId || crypto.randomUUID(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    type: "paragraph",
                    order: previousBlocks.length + 1,
                    content: { text: text },
                }]
            })
            return { previousQueryData, tempId }
        },
        onSuccess: (data, _vars, ctx) => {
            queryClient.setQueryData<{ blocks: Block[] }>(['blocks', pageId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    blocks: old.blocks.map((block) => block.id === ctx.tempId ? data.block : block)
                }
            })
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previousQueryData) {
                queryClient.setQueryData(['blocks', pageId], ctx.previousQueryData)
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

    const blocks = blocksQuery.isFetched ? blocksQuery.data ? blocksQuery.data.blocks : [] : [];

    return (
        <div className="flex flex-1 flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            <TextareaAutosize placeholder='Your Title' maxRows={2} className='text-2xl focus:outline-none focus:ring-0 resize-none' value={inputTitle} onChange={(e) => { setInputTitle(e.target.value) }} />
            {blocks.map((block) => <BlockEditor key={block.id} block={block} />)}
            {blocks.length === 0 && <textarea placeholder={"Write something..."} onChange={(e) => setInputFirstBlock(e.target.value)} rows={1} className='text-xl focus:outline-none focus:ring-0 resize-none' />}
        </div>
    )
}

export default TextPageEditor
