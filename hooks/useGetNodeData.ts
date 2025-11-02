"use client";
import { useAtom } from "jotai";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import { NodeType, NodeDataType } from "@/types/NodeType";

const useGetNodeData = (nodeId: string) => {
    const [nodes] = useAtom<NodeType[]>(NodesAtom);

    function getNodeData(): NodeDataType[] {
        const node = nodes.find((n) => n.id === nodeId);
        return node?.data?.data || [];
    }

    return getNodeData;
};

export default useGetNodeData;
