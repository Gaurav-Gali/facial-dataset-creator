"use client";
import { useAtom } from "jotai";
import { EdgesAtom, NodesAtom } from "@/store/NodesAndEdgesStore";
import { NodeType } from "@/types/NodeType";
import { EdgeType } from "@/types/EdgeType";

const useGetIncomming = () => {
    const [nodes] = useAtom<NodeType[]>(NodesAtom);
    const [edges] = useAtom<EdgeType[]>(EdgesAtom);

    function getIncomingNodes(nodeId: string): NodeType[] {
        const incomingEdges = edges.filter((edge) => edge.target === nodeId);

        const sourceNodeIds = incomingEdges.map((edge) => edge.source);

        const incomingNodes = nodes.filter((node) =>
            sourceNodeIds.includes(node.id)
        );

        return incomingNodes;
    }

    return getIncomingNodes;
};

export default useGetIncomming;
