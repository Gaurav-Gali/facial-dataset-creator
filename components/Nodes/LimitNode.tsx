import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { MinusCircle } from "lucide-react";
import PlayButton from "@/components/PlayButton";
import { NodeDataType } from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";
import { v4 as uuidv4 } from "uuid";

const LimitNode = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [imageCount, setImageCount] = useState<number>(0);
    const [limit, setLimit] = useState<number>(5); // default limit

    const getIncomming = useGetIncomming();
    const addData = useAddData();

    const handleLimit = async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const inNodes = getIncomming(id);

        if (inNodes && inNodes.length > 0) {
            // only take the first incoming node
            const firstNode = inNodes[0];
            const nodeData: NodeDataType[] = firstNode?.data?.data || [];

            // limit the data
            const limitedData = nodeData.slice(0, limit).map((item) => ({
                id: item.id || uuidv4(),
                imageUrl: item.imageUrl || "",
                metadata: item.metadata || {},
            }));

            console.log(`🔢 Limited to ${limitedData.length} items from ${nodeData.length} total`);

            // save data to current node
            addData(id, limitedData, "set");
            setImageCount(limitedData.length);
        } else {
            console.log("⚠️ No incoming node found");
            addData(id, [], "set");
            setImageCount(0);
        }

        setLoading(false);
    };

    return (
        <div className="w-40 h-auto border rounded-lg bg-white">
            {/* Handles */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-2 py-1">
                <div className="flex items-center gap-1 text-zinc-600">
                    <MinusCircle className="text-fuchsia-400" size={10} />
                    <p className="text-[10px]">Limit Node</p>
                </div>
                <div onClick={handleLimit}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/* Limit Input */}
            <div className="flex items-center justify-between px-2 py-1 text-[9px]">
                <label className="text-zinc-500">Limit</label>
                <input
                    min={1}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-12 border rounded text-center text-[9px]"
                />
            </div>

            {/* Content */}
            {imageCount === 0 ? (
                <div className="flex items-center justify-center text-zinc-500 text-[8px] py-2">
                    No images found.
                </div>
            ) : (
                <div className="flex items-center justify-center text-zinc-500 text-[8px] py-2">
                    {imageCount} images limited
                </div>
            )}
        </div>
    );
};

export default LimitNode;
