import React, { useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ListFilter } from "lucide-react";
import PlayButton from "@/components/PlayButton";
import { NodeDataType } from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";
import { v4 as uuidv4 } from "uuid";
import { useAtom } from "jotai";
import { NodesAtom } from "@/store/NodesAndEdgesStore";

/* Recursively extract all nested dot-paths from an object */
function extractDotPaths(obj: any, prefix = ""): string[] {
    const paths: string[] = [];
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        for (const key of Object.keys(obj)) {
            const path = prefix ? `${prefix}.${key}` : key;
            paths.push(path);
            // Recursively get nested paths
            paths.push(...extractDotPaths(obj[key], path));
        }
    }
    return paths;
}

/* Deep getter: safely retrieve value by dot-notation path */
function getDeep(obj: any, pathArr: string[]) {
    return pathArr.reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) return acc[key];
        return undefined;
    }, obj);
}

/* Deep setter: constructs nested objects when missing */
function setDeep(obj: any, pathArr: string[], value: any) {
    let cur = obj;
    pathArr.forEach((key, idx) => {
        if (idx === pathArr.length - 1) {
            cur[key] = value;
        } else {
            if (!(key in cur) || typeof cur[key] !== "object" || Array.isArray(cur[key])) {
                cur[key] = {};
            }
            cur = cur[key];
        }
    });
}

/* Check if a path is a child of another path */
function isChildOf(childPath: string, parentPath: string): boolean {
    return childPath.startsWith(parentPath + ".");
}

/* Get all children of a given path */
function getChildren(path: string, allPaths: string[]): string[] {
    return allPaths.filter(p => isChildOf(p, path));
}

const FilterNode = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(false);
    const [imageCount, setImageCount] = useState(0);
    const [metadataPaths, setMetadataPaths] = useState<string[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Record<string, boolean>>({});

    const getIncomming = useGetIncomming();
    const addData = useAddData();
    const [nodes] = useAtom(NodesAtom);

    // Extract incoming data whenever nodes change
    useEffect(() => {
        const inNodes = getIncomming(id);

        // Take only the first incoming node
        if (!inNodes || inNodes.length === 0) {
            if (metadataPaths.length > 0) {
                setMetadataPaths([]);
                setSelectedPaths({});
            }
            return;
        }

        const firstNode = inNodes[0];
        const nodeData: NodeDataType[] = firstNode?.data?.data || [];

        if (!nodeData || nodeData.length === 0) {
            if (metadataPaths.length > 0) {
                setMetadataPaths([]);
                setSelectedPaths({});
            }
            return;
        }

        // Collect all unique metadata keys from all items
        const allKeys = new Set<string>();
        nodeData.forEach((item) => {
            if (item.metadata) {
                extractDotPaths(item.metadata).forEach((path) => allKeys.add(path));
            }
        });

        const sortedPaths = Array.from(allKeys).sort();

        // Only update if paths changed
        const pathsChanged = JSON.stringify(sortedPaths) !== JSON.stringify(metadataPaths);

        if (pathsChanged) {
            console.log(`📋 Found ${sortedPaths.length} unique metadata paths:`, sortedPaths);
            setMetadataPaths(sortedPaths);

            // Initialize checkboxes (all checked by default, preserve existing state)
            setSelectedPaths((prev) => {
                const next: Record<string, boolean> = {};
                sortedPaths.forEach((path) => {
                    next[path] = path in prev ? prev[path] : true;
                });
                return next;
            });
        }
    }, [nodes, id]);

    // Toggle individual checkbox with parent-child logic
    const togglePath = (path: string) => {
        setSelectedPaths((prev) => {
            const next = { ...prev };
            const newValue = !prev[path];

            // Update the clicked path
            next[path] = newValue;

            // If unchecking a parent, uncheck all its children
            if (!newValue) {
                const children = getChildren(path, metadataPaths);
                children.forEach(child => {
                    next[child] = false;
                });
            }

            // If checking a child, check all its parents
            if (newValue) {
                const pathParts = path.split(".");
                for (let i = 1; i < pathParts.length; i++) {
                    const parentPath = pathParts.slice(0, i).join(".");
                    if (parentPath in next) {
                        next[parentPath] = true;
                    }
                }
            }

            return next;
        });
    };

    // Select/Deselect all checkboxes
    const toggleAll = () => {
        const allSelected = metadataPaths.every((path) => selectedPaths[path]);
        setSelectedPaths((prev) => {
            const next = { ...prev };
            metadataPaths.forEach((path) => {
                next[path] = !allSelected;
            });
            return next;
        });
    };

    // ⚙️ Main filtering operation
    const handleFilter = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 200));

        const inNodes = getIncomming(id);

        // Take only the first incoming node
        if (!inNodes || inNodes.length === 0) {
            console.log("⚠️ No incoming node found");
            addData(id, [], "set");
            setImageCount(0);
            setLoading(false);
            return;
        }

        const firstNode = inNodes[0];
        const nodeData: NodeDataType[] = firstNode?.data?.data || [];

        console.log("📥 Incoming node data:", {
            nodeId: firstNode.id,
            dataLength: nodeData.length,
            firstItem: nodeData[0]
        });

        // Get list of selected (checked) paths - only leaf nodes (paths with no selected children)
        const checkedPaths = Object.entries(selectedPaths)
            .filter(([path, isChecked]) => {
                if (!isChecked) return false;

                // Check if this path has any selected children
                const children = getChildren(path, metadataPaths);
                const hasSelectedChildren = children.some(child => selectedPaths[child]);

                // Only include if it has no selected children (leaf node in selection)
                return !hasSelectedChildren;
            })
            .map(([path]) => path);

        console.log(`🔧 Filtering with ${checkedPaths.length} selected leaf paths:`, checkedPaths);

        // 🧮 Filter metadata for each element in the array
        const filteredData: NodeDataType[] = nodeData.map((item) => {
            const filteredMeta: Record<string, any> = {};

            // Only include checked leaf paths in the filtered metadata
            for (const path of checkedPaths) {
                const pathArr = path.split(".");
                const val = getDeep(item.metadata, pathArr);

                if (val !== undefined) {
                    setDeep(filteredMeta, pathArr, val);
                }
            }

            return {
                id: item.id || uuidv4(),
                imageUrl: item.imageUrl || "",
                metadata: filteredMeta,
            };
        });

        console.log("📤 Filtered data to store:", {
            nodeId: id,
            dataLength: filteredData.length,
            firstItem: filteredData[0],
            mode: "set"
        });

        // 💾 Store filtered data in current node
        addData(id, filteredData, "set");
        setImageCount(filteredData.length);
        setLoading(false);

        console.log(`✅ Filter applied. ${filteredData.length} items processed with ${checkedPaths.length} metadata keys.`);
    };

    // Render path label with indentation for nested keys
    const renderPathLabel = (path: string) => {
        const depth = path.split(".").length - 1;
        const lastKey = path.split(".").pop() || path;

        return (
            <span
                style={{ marginLeft: depth * 12 }}
                className="truncate block"
                title={path}
            >
                {depth > 0 && <span className="text-zinc-400 mr-1">└</span>}
                {lastKey}
            </span>
        );
    };

    const allSelected = metadataPaths.length > 0 && metadataPaths.every((path) => selectedPaths[path]);
    const someSelected = metadataPaths.some((path) => selectedPaths[path]);

    return (
        <div className="w-44 h-auto border overflow-clip rounded-lg bg-white">
            {/* Handles */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2 bg-white">
                <div className="flex items-center gap-2 text-zinc-700">
                    <ListFilter className="text-emerald-500" size={10} />
                    <p className="text-xs">Filter Metadata</p>
                </div>
                <div onClick={handleFilter}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/* Filter Checkboxes */}
            <div className="px-3 py-2">
                {metadataPaths.length === 0 ? (
                    <p className="text-[10px] text-center text-zinc-400 py-4">
                        No metadata available.<br/>Connect an input node.
                    </p>
                ) : (
                    <>
                        {/* Select All Toggle */}
                        <div className="mb-2 pb-2 border-b border-zinc-200">
                            <label className="flex items-center gap-2 text-[11px] font-medium text-zinc-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = someSelected && !allSelected;
                                    }}
                                    onChange={toggleAll}
                                    className="accent-emerald-500 w-3.5 h-3.5"
                                />
                                <span>{allSelected ? "Deselect All" : "Select All"}</span>
                                <span className="text-zinc-400">({metadataPaths.length})</span>
                            </label>
                        </div>

                        {/* Individual Checkboxes */}
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {metadataPaths.map((path) => (
                                <label
                                    key={path}
                                    className="flex items-start gap-2 text-[10px] text-zinc-700 cursor-pointer hover:bg-emerald-50 px-1 py-0.5 rounded transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedPaths[path]}
                                        onChange={() => togglePath(path)}
                                        className="accent-emerald-500 w-3 h-3 mt-0.5 flex-shrink-0"
                                    />
                                    {renderPathLabel(path)}
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-center text-zinc-500 text-[10px] py-2 border-t bg-zinc-50/90">
                {imageCount === 0
                    ? "No data processed"
                    : `${imageCount} items • ${Object.values(selectedPaths).filter(Boolean).length} keys`}
            </div>
        </div>
    );
};

export default FilterNode;