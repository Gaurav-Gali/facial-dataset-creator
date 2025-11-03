"use client";

import React, { useState } from "react";
import { ArrowDownToLine, ImageOff } from "lucide-react";
import { useAtom } from "jotai";
import { NodeDataType } from "@/types/NodeType";
import { currentViewAtom } from "@/store/CurrentViewStore";
import ReactJson from "react-json-view";

const DataViewer = () => {
    const [viewer] = useAtom<NodeDataType[]>(currentViewAtom);
    const [selectedImage, setSelectedImage] = useState<NodeDataType | null>(viewer[0] ? viewer[0] : null);


    // 🔹 Function to handle image selection and log metadata
    const handleSelectImage = (item: NodeDataType) => {
        if (selectedImage?.id !== item.id) {
            setSelectedImage(item);
            console.log("🧠 Selected Image Metadata:", item.metadata);
        }
    };

    const handleDownloadJson = () => {
        try {
            if (!viewer || viewer.length === 0) {
                alert("No data available to download.");
                return;
            }

            // Convert viewer data to a JSON string (pretty-printed)
            const jsonData = JSON.stringify(viewer, null, 2);

            // Create a Blob from the JSON data
            const blob = new Blob([jsonData], { type: "application/json" });

            // Create a download link dynamically
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "viewer_data.json"; // file name
            document.body.appendChild(a);
            a.click();

            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("✅ Downloaded viewer_data.json with", viewer.length, "entries.");
        } catch (error) {
            console.error("❌ Error while downloading JSON:", error);
        }
    };

    return (
        <div className="bg-white border-l h-screen w-[30vw] overflow-y-auto">
            {viewer.length === 0 ? (
                <div className="text-zinc-500 h-full flex items-center justify-center gap-2">
                    <ImageOff size={20} />
                    <p className="text-sm">No images found.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="border-b py-2 px-4 flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-600">Data Viewer</p>
                        <div onClick={() => handleDownloadJson()} className="flex cursor-pointer hover:text-zinc-400 text-zinc-600 items-center justify-center gap-1 text-sm">
                            <ArrowDownToLine size={16} />
                            Download JSON
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
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://via.placeholder.com/128x128?text=No+Image";
                                        }}
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">
                                        Metadata
                                    </h3>
                                    <div className="bg-white border border-zinc-200 rounded-lg max-h-72 overflow-y-auto">
                                        <ReactJson
                                            src={selectedImage.metadata || {}}
                                            theme="rjv-default"
                                            displayDataTypes={false}
                                            displayObjectSize={false}
                                            enableClipboard={true}
                                            collapsed={false}
                                            name={false}
                                            style={{
                                                padding: "12px",
                                                fontSize: "11px",
                                                fontFamily: "monospace",
                                            }}
                                        />
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
                                    onClick={() => handleSelectImage(item)}
                                    className={`relative group border rounded-lg overflow-hidden transition cursor-pointer ${
                                        selectedImage?.id === item.id
                                            ? "ring-2 ring-blue-500"
                                            : "hover:ring-1 hover:ring-zinc-300"
                                    }`}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.imageUrl}
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://via.placeholder.com/150x150?text=Not+Found";
                                        }}
                                    />
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
