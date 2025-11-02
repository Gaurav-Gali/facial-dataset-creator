"use client";

import React from "react";
import { Database } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {useAtom} from "jotai";
import {NodesAtom} from "@/store/NodesAndEdgesStore";
import {NodeType} from "@/types/NodeType";
import { v4 as uuidv4 } from "uuid";

const AddDataNode = () => {
    const [nodes,setNodes] = useAtom<NodeType[]>(NodesAtom);

    const handleAddDataNode = () => {
        const newNode: NodeType = {
            id: uuidv4(),
            position: { x: 0, y: 0 },
            type: "DataNode",
            data: { data: [] },
        };

        setNodes((prev) => [...prev, newNode]);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger onClick={() => handleAddDataNode()} asChild>
                    <div className="p-1 w-8 h-8 active:opacity-[50%] rounded-full flex items-center justify-center border bg-white cursor-pointer hover:bg-zinc-50 transition">
                        <Database className="text-yellow-400" size={16} />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Add Data Node</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default AddDataNode;
