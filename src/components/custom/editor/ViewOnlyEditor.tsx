import { Page, Block } from "@/generated/prisma/client"
import { useQuery } from "@tanstack/react-query"
import ky from "ky"
import { LoaderCircle } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import HighlightedText from "./HighlightedText";
import { BlockContent, HEADING_CLASSES, getHeadingLevel } from "@/types/block";
import { Checkbox } from "@/components/ui/checkbox";

function ViewOnlyEditor({ shareId }: { shareId: string }) {
    const sharePageQuery = useQuery<{ page: Page & {blocks: Block[]} }>({
        queryKey: ['share', shareId],
        queryFn: () => ky.get("/api/share/" + shareId).json(),

    })
    if (sharePageQuery.isLoading) {
        return <div className="min-h-svh flex items-center flex-col gap-8 px-4 py-8 md:px-16 md:py-16">
            <div className="flex flex-col gap-2 items-center">
                <LoaderCircle className="animate-spin" size={50} /> Loading Page </div>
        </div>
    }
    const blocks = sharePageQuery.data?.page.blocks;
    return (
        <div className="flex flex-1 flex-col gap-8 px-6 py-8 sm:px-16 md:px-32 lg:px-64 md:py-16">
            <TextareaAutosize disabled placeholder='Your Title' maxRows={2} className='text-3xl sm:text-4xl font-semibold focus:outline-none focus:ring-0 resize-none' value={sharePageQuery.data?.page.name} />
            <div className='flex flex-col gap-2'>
                {blocks?.map((block) =>
                    <div key={block.id} className="relative h-auto">
                        <div
                            className="pointer-events-none whitespace-pre-wrap wrap-break-word flex gap-1 items-center text-base sm:text-lg border-l-2 pl-2"
                            aria-hidden
                        >
                            {block.type === "paragraph" && <HighlightedText text={(block.content as BlockContent).text} />}
                            {block.type === "heading" && <div className={HEADING_CLASSES[getHeadingLevel(block.content)]}>
                                <HighlightedText text={(block.content as BlockContent).text} />
                            </div>}
                            {block.type === "todo" && <>
                                <Checkbox
                                    checked={(block.content as { task: boolean }).task || false}
                                />
                                <HighlightedText text={(block.content as BlockContent).text}
                                    lineThrough={(block.content as { task: boolean }).task || false} /></>}
                        </div>
                    </div>
                )}
                {blocks?.length === 0 && <p className='text-base md:text-lg focus:outline-none focus:ring-0 resize-none border-l-2 px-1'>no blocks found!</p>}
            </div>
        </div>
    )
}

export default ViewOnlyEditor
