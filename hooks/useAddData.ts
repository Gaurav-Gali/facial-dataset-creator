"use client";
import { useAtom } from "jotai";
import { NodeDataType, NodeType } from "@/types/NodeType";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import { v4 as uuidv4 } from "uuid"; // for unique IDs per image

type AddMode = "append" | "set";

const useAddData = () => {
    const [nodes, setNodes] = useAtom<NodeType[]>(NodesAtom);

    function addData(nodeId: string, imageUrls: string[], mode: AddMode = "set") {
        // Convert image URLs into structured NodeDataType objects
        const newDataObjects: NodeDataType[] = imageUrls.map((url) => ({
            id: uuidv4(),
            imageUrl: url,
            metadata: {},
        }));

        setNodes((prevNodes) =>
            prevNodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            data:
                                mode === "set"
                                    ? newDataObjects
                                    : [...(node.data.data || []), ...newDataObjects],
                        },
                    };
                }
                return node;
            })
        );
    }

    return addData;
};

export default useAddData;
