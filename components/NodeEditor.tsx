"use client";

import React, { useCallback, useEffect } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges,
    Background
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { EditorNodeTypes } from "@/types/EditorNodeTypes";
import { useAtom } from "jotai";
import { NodeType } from "@/types/NodeType";
import { EdgesAtom, NodesAtom } from "@/store/NodesAndEdgesStore";
import { EdgeType } from "@/types/EdgeType";
import { v4 as uuidv4 } from "uuid";

export default function App() {
    const [nodes, setNodes] = useAtom<NodeType[]>(NodesAtom);
    const [edges, setEdges] = useAtom<EdgeType[]>(EdgesAtom);

    // --- React Flow Core Handlers ---
    const onNodesChange = useCallback((changes) => {
        setNodes((nodesSnapshot) => {
            const updatedNodes = applyNodeChanges(changes, nodesSnapshot);

            changes.forEach((change) => {
                if (change.type === "remove") {
                    const removedId = change.id;

                    setEdges((prevEdges) =>
                        prevEdges.filter(
                            (edge) => edge.source !== removedId && edge.target !== removedId
                        )
                    );
                }
            });

            return updatedNodes;
        });
    }, []);


    const onEdgesChange = useCallback(
        (changes) => {
            setEdges((edgesSnapshot) => {
                let updatedEdges = applyEdgeChanges(changes, edgesSnapshot);

                const deletedEdgeIds = changes
                    .filter((c) => c.type === "remove")
                    .map((c) => c.id);

                if (deletedEdgeIds.length > 0) {
                    updatedEdges = updatedEdges.filter(
                        (edge) => !deletedEdgeIds.includes(edge.id)
                    );
                }

                return updatedEdges;
            });
        },
        []
    );

    // --- When connecting nodes ---
    const onConnect = useCallback(
        (params) => {
            const sourceNode = nodes.find((n) => n.id === params.source);

            const newEdge: EdgeType = {
                id: uuidv4(),
                source: params.source,
                target: params.target,
                label: "",
                animated:
                    !!sourceNode?.data && Object.keys(sourceNode.data).length > 0,
            };

            setEdges((prevEdges) => {
                const existingEdgeIndex = prevEdges.findIndex(
                    (e) => e.target === params.target && e.targetHandle === params.targetHandle
                );

                let updatedEdges;
                if (existingEdgeIndex !== -1) {
                    updatedEdges = [...prevEdges];
                    updatedEdges[existingEdgeIndex] = newEdge;
                } else {
                    updatedEdges = [...prevEdges, newEdge];
                }

                return updatedEdges;
            });
        },
        [nodes, setEdges]
    );

    // --- Auto animate edges when node data changes ---
    useEffect(() => {
        setEdges((prevEdges) => {
            return prevEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const shouldAnimate =
                    !!sourceNode?.data && Object.keys(sourceNode.data.data).length > 0;

                return { ...edge, animated: shouldAnimate };
            });
        });
    }, [nodes, setEdges]);

    return (
        <div
            style={{ width: "70vw", height: "100vh", position: "relative" }}
        >
            <ReactFlowProvider>
                <Background
                    gap={13}
                    variant={"lines"}
                    color="oklch(96.7% 0.001 286.375)"
                />
                <ReactFlow
                    nodeTypes={EditorNodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(event) => event.stopPropagation()}
                    fitView
                />
            </ReactFlowProvider>
        </div>
    );
}
