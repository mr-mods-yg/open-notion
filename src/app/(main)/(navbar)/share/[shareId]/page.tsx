"use client";
import ViewOnlyEditor from "@/components/custom/editor/ViewOnlyEditor";
import { useParams } from "next/navigation"

function Page() {
    const params = useParams();
    const shareId = params.shareId?.toString();
    if(!shareId){
        return <div>ShareId not found!</div>
    }
    return (
        <ViewOnlyEditor shareId={shareId}/>
    )
}

export default Page
