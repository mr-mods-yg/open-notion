"use client";

import TextPageEditor from "@/components/custom/editor/TextPageEditor";
import { useParams } from "next/navigation"

function Page() {
    const params = useParams();
    const pageId = params.pageId?.toString();
    if(!pageId){
        return <div>Page not found!</div>
    }
    return (
        <TextPageEditor pageId={pageId}/>
    )
}

export default Page
