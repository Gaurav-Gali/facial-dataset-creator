"use client";
import { useAtom } from "jotai";
import { NodeDataType, NodeType } from "@/types/NodeType";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import { v4 as uuidv4 } from "uuid";

type AddMode = "append" | "set";

const useAddData = () => {
    const [nodes, setNodes] = useAtom<NodeType[]>(NodesAtom);

    function addData(
        nodeId: string,
        newInput: string[] | NodeDataType[],
        mode: AddMode = "set"
    ) {
        let newDataObjects: NodeDataType[];

        // 🧠 Check if input is array of strings (image URLs)
        if (typeof newInput[0] === "string") {
            newDataObjects = (newInput as string[]).map((url) => ({
                id: uuidv4(),
                imageUrl: url,
                metadata: {},
            }));
        } else {
            // Directly use NodeDataType[] input
            newDataObjects = newInput as NodeDataType[];
        }

        // 🧩 Update the target node’s data
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
