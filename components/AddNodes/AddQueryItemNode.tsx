"use client";

import React from "react";
import {BringToFront} from "lucide-react";
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

const AddQueryItemNode = () => {
    const [nodes,setNodes] = useAtom<NodeType[]>(NodesAtom);

    const handleAddDataNode = () => {
        const newNode: NodeType = {
            id: uuidv4(),
            position: { x: 0, y: 0 },
            type: "QueryItemNode",
            data: { data: [] },
        };

        setNodes((prev) => [...prev, newNode]);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger onClick={() => handleAddDataNode()} asChild>
                    <div className="p-1 w-8 h-8 active:opacity-[50%] rounded-full flex items-center justify-center border bg-white cursor-pointer hover:bg-zinc-50 transition">
                        <BringToFront className="text-indigo-400" size={16} />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Add QueryItem Node</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default AddQueryItemNode;
