"use client";

import React, { useState } from "react";
import {ArrowDownToLine, ImageOff} from "lucide-react";
import { useAtom } from "jotai";
import { NodeDataType } from "@/types/NodeType";
import { currentViewAtom } from "@/store/CurrentViewStore";

const DataViewer = () => {
    const [viewer] = useAtom<NodeDataType[]>(currentViewAtom);
    const [selectedImage, setSelectedImage] = useState<NodeDataType | null>(
        viewer.length > 0 ? viewer[0] : null
    );

    React.useEffect(() => {
        if (viewer.length > 0 && !selectedImage) {
            setSelectedImage(viewer[0]);
        }
    }, [viewer, selectedImage]);

    return (
        <div className="bg-white border-l h-screen w-[30vw] overflow-y-auto">
            {viewer.length === 0 ? (
                <div className="text-zinc-500 h-full flex items-center justify-center gap-2">
                    <ImageOff size={20} />
                    <p className="text-sm">No images found.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className={"border-b py-2 px-4 flex items-center justify-between"}>
                        <p className={"text-sm font-bold text-zinc-600"}>
                            Data Viewer
                        </p>
                        <div className={"flex cursor-pointer hover:text-zinc-400 text-zinc-600 items-center justify-center gap-1 text-sm"}>
                            <ArrowDownToLine size={16}/>
                            Download CSV
                        </div>
                    </div>
                    {/* Info Section */}
                    {selectedImage && (
                        <div className="border-b p-4 bg-white">
                            <div className="flex gap-4">
                                {/* Image Preview */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={selectedImage.imageUrl}
                                        alt="Selected"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                                        Metadata
                                    </h3>
                                    <div className="bg-white border rounded p-2 text-xs font-mono max-h-32 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap break-words text-zinc-600">
                                            {JSON.stringify(
                                                selectedImage.metadata || {},
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid Section */}
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                            All Images ({viewer.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {viewer.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedImage(item)}
                                    className={`relative group border rounded-lg overflow-hidden transition cursor-pointer ${
                                        selectedImage?.id === item.id
                                            ? "ring-2 ring-blue-500"
                                            : ""
                                    }`}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.imageUrl}
                                        className="w-full h-32 object-cover"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                                        View Details
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataViewer;