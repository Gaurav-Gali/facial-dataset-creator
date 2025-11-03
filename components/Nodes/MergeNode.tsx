import React, {useState} from 'react';
import {Handle, Position} from "@xyflow/react";
import {Merge} from "lucide-react";
import PlayButton from "@/components/PlayButton";
import {NodeDataType} from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";
import { v4 as uuidv4 } from "uuid";

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
            // Merge all incoming node data as NodeDataType[]
            const mergedData: NodeDataType[] = [];

            inNodes.forEach((node) => {
                const nodeData: NodeDataType[] = node?.data?.data || [];

                nodeData.forEach((item) => {
                    // Ensure proper NodeDataType structure
                    mergedData.push({
                        id: item.id || uuidv4(),
                        imageUrl: item.imageUrl || "",
                        metadata: item.metadata || {}, // Empty object if no metadata
                    });
                });
            });

            console.log(`🔀 Merged ${mergedData.length} items from ${inNodes.length} nodes`);

            // Add merged data to current node
            addData(id, mergedData, "set");
            setImageCount(mergedData.length);
        } else {
            console.log("⚠️ No incoming nodes found");
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