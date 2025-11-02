import React, {useState} from 'react';
import {Handle, Position} from "@xyflow/react";
import {Merge} from "lucide-react";
import PlayButton from "@/components/PlayButton";
import {NodeDataType} from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";

const MergeNode = ({id}:{id:string}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [imageCount, setImageCount] = useState<number>(0);

    const getIncomming = useGetIncomming();
    const addData = useAddData();

    const handleMerge = async () => {
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 300));

        const inNodes = getIncomming(id);

        if (inNodes && inNodes.length > 0) {
            // Merge all incoming node data
            const mergedImageUrls: string[] = [];

            inNodes.forEach((node) => {
                const nodeData: NodeDataType[] = node?.data?.data || [];
                nodeData.forEach((item) => {
                    mergedImageUrls.push(item.imageUrl);
                });
            });

            // Add merged data to current node using the hook
            addData(id, mergedImageUrls, "set");
            setImageCount(mergedImageUrls.length);
        } else {
            addData(id, [], "set");
            setImageCount(0);
        }

        setLoading(false);
    };

    return (
        <div className={"w-36 h-auto border rounded-lg bg-white"}>
            {/*Handle*/}
            <Handle
                type={"target"}
                position={Position.Left}
            />

            <Handle
                type={"source"}
                position={Position.Right}
            />

            {/*Header*/}
            <div className={"flex items-center justify-between gap-2 border-b px-2 py-1"}>
                <div className={"flex items-center gap-1 text-zinc-600"}>
                    <Merge className={"text-orange-400"} size={10}/>
                    <p className={"text-[10px]"}>Merge Node</p>
                </div>
                <div onClick={handleMerge}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/*Content*/}
            {
                imageCount === 0 ? (
                    <div className={"flex items-center justify-center text-zinc-500 text-[8px] py-2"}>
                        No images found.
                    </div>
                ) : (
                    <div className={"flex items-center justify-center text-zinc-500 text-[8px] py-2"}>
                        {imageCount} images merged
                    </div>
                )
            }
        </div>
    );
};

export default MergeNode;