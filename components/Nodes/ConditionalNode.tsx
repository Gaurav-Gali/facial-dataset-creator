import React, {useState, useMemo} from 'react';
import {Handle, Position} from "@xyflow/react";
import {Filter} from "lucide-react";
import PlayButton from "@/components/PlayButton";
import {NodeDataType} from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";
import { v4 as uuidv4 } from "uuid";
import {useAtom} from "jotai";
import {NodesAtom} from "@/store/NodesAndEdgesStore";

/* Evaluate condition against metadata */
function evaluateCondition(metadata: Record<string, any>, condition: string): boolean {
    if (!condition.trim()) return true; // Empty condition = match all

    try {
        // Use Function constructor to evaluate the condition dynamically
        // The metadata object is passed as 'item'
        return new Function("item", `return ${condition}`)(metadata);
    } catch (error) {
        console.error('❌ Error evaluating condition:', condition, error);
        return false;
    }
}

const ConditionalNode = ({id}:{id:string}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [imageCount, setImageCount] = useState<number>(0);
    const [condition, setCondition] = useState<string>("");
    const [error, setError] = useState<string>("");

    const getIncomming = useGetIncomming();
    const addData = useAddData();
    const [nodes] = useAtom(NodesAtom);

    // Get incoming data count for display
    const incomingCount = useMemo(() => {
        const inNodes = getIncomming(id);
        if (!inNodes || inNodes.length === 0) return 0;

        let total = 0;
        inNodes.forEach((node) => {
            const nodeData: NodeDataType[] = node?.data?.data || [];
            total += nodeData.length;
        });
        return total;
    }, [nodes, id]);

    const handleFilter = async () => {
        setLoading(true);
        setError("");

        await new Promise((resolve) => setTimeout(resolve, 300));

        const inNodes = getIncomming(id);

        if (!inNodes || inNodes.length === 0) {
            console.log("⚠️ No incoming nodes found");
            addData(id, [], "set");
            setImageCount(0);
            setLoading(false);
            return;
        }

        // Collect all incoming data
        const allData: NodeDataType[] = [];
        inNodes.forEach((node) => {
            const nodeData: NodeDataType[] = node?.data?.data || [];
            allData.push(...nodeData);
        });

        console.log(`📥 Processing ${allData.length} items with condition: "${condition}"`);

        // Filter data based on condition
        const filteredData: NodeDataType[] = [];
        let errorCount = 0;

        allData.forEach((item, index) => {
            try {
                const matches = evaluateCondition(item.metadata || {}, condition);

                if (matches) {
                    filteredData.push({
                        id: item.id || uuidv4(),
                        imageUrl: item.imageUrl || "",
                        metadata: item.metadata || {},
                    });
                }
            } catch (err) {
                errorCount++;
                console.error(`❌ Error processing item ${index}:`, err);
            }
        });

        if (errorCount > 0) {
            setError(`${errorCount} items failed to process`);
        }

        console.log(`✅ Filtered: ${filteredData.length} out of ${allData.length} items match the condition`);

        // Validate condition by checking if it could be evaluated
        if (allData.length > 0 && condition.trim()) {
            try {
                evaluateCondition(allData[0].metadata || {}, condition);
            } catch (err) {
                setError("Invalid condition syntax");
            }
        }

        // Add filtered data to current node
        addData(id, filteredData, "set");
        setImageCount(filteredData.length);
        setLoading(false);
    };

    return (
        <div className={"w-52 h-auto border rounded-lg overflow-clip bg-white"}>
            {/*Handles*/}
            <Handle
                type={"target"}
                position={Position.Left}
            />

            <Handle
                type={"source"}
                position={Position.Right}
            />

            {/*Header*/}
            <div className={"flex items-center justify-between gap-2 border-b px-3 py-2"}>
                <div className={"flex items-center gap-2 text-zinc-600"}>
                    <Filter className={"text-rose-400"} size={10}/>
                    <p className={"text-xs"}>Conditional Filter</p>
                </div>
                <div onClick={handleFilter}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/*Condition Input*/}
            <div className={"px-3 py-2 border-b"}>
                <label className={"text-[10px] text-zinc-600 font-medium mb-1 block"}>
                    Condition
                </label>
                <textarea
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="item.Emotion === 'ANGRY'"
                    className={`w-full text-[10px] px-2 py-1.5 border rounded ${
                        error ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                    } focus:outline-none focus:ring-1 focus:ring-zinc-200 font-mono`}
                    rows={3}
                />
                {error && (
                    <p className={"text-[9px] text-red-500 mt-1"}>⚠️ {error}</p>
                )}
            </div>

            {/*Content*/}
            <div className={"px-3 py-2 bg-zinc-50/90"}>
                <div className={"flex items-center justify-between text-[10px] text-zinc-500"}>
                    <span>Input</span>
                    <span className={""}>{incomingCount} items</span>
                </div>
                <div className={"flex items-center justify-between text-[10px] text-zinc-500 mt-1"}>
                    <span>Output</span>
                    <span className={" text-green-500"}>{imageCount} items</span>
                </div>
            </div>
        </div>
    );
};

export default ConditionalNode;