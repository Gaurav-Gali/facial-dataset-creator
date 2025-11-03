"use client";

import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Cpu } from "lucide-react";
import PlayButton from "@/components/PlayButton";
import useGetIncomming from "@/hooks/useGetIncomming";
import useAddData from "@/hooks/useAddData";
import { useAtom } from "jotai";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import { NodeType, NodeDataType } from "@/types/NodeType";
import { v4 as uuidv4 } from "uuid";

const RekognitionNode = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);

    const getIncomming = useGetIncomming();
    const addData = useAddData();

    /** Step 1: Load images from incoming node */
    const handleLoadImages = async () => {
        const inNodes = getIncomming(id);
        if (inNodes && inNodes.length > 0) {
            const firstNode = inNodes[0];
            const incomingData = firstNode?.data?.data || [];
            const imageUrls = incomingData.map((item) => item.imageUrl);
            setImages(imageUrls);
            console.log("Loaded images:", imageUrls);
            return imageUrls;
        } else {
            console.warn("⚠️ No incoming nodes found for RekognitionNode");
            setImages([]);
            return [];
        }
    };

    /**  Convert blob URL to base64 JPEG */
    const blobUrlToBase64Jpeg = async (blobUrl: string): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch the blob
                const response = await fetch(blobUrl);
                const blob = await response.blob();

                // Create an image element to convert to JPEG
                const img = new Image();
                const objectUrl = URL.createObjectURL(blob);

                img.onload = () => {
                    // Create canvas with image dimensions
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw image on canvas
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);

                    // Convert to base64 JPEG
                    const base64 = canvas.toDataURL('image/jpeg', 0.95);

                    URL.revokeObjectURL(objectUrl);
                    console.log(`✅ Converted to JPEG base64 (${base64.length} chars)`);
                    resolve(base64);
                };

                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Failed to load image'));
                };

                img.src = objectUrl;
            } catch (err) {
                console.error('Error converting blob to base64:', err);
                reject(err);
            }
        });
    };

    const [nodes, setNodes] = useAtom(NodesAtom);

    /** Step 2: Handle Rekognition Upload Pipeline */
    const handleRekognition = async () => {
        setLoading(true);
        setError(false);

        try {
            const imageUrls = await handleLoadImages();
            if (!imageUrls.length) {
                console.warn("No images found to process");
                setLoading(false);
                return;
            }

            console.log(`🎯 Processing ${imageUrls.length} images`);

            // Convert all blob URLs to base64 JPEG
            console.log("🔄 Converting images to base64 JPEG...");
            const base64Promises = imageUrls.map((url, idx) => {
                console.log(`  Converting image ${idx + 1}/${imageUrls.length}...`);
                return blobUrlToBase64Jpeg(url);
            });

            const base64Images = await Promise.all(base64Promises);
            console.log(`All ${base64Images.length} images converted to base64`);

            // Prepare upload request with base64 data
            const files = base64Images.map((base64, i) => ({
                fileName: `image-${i}.jpg`,
                fileType: "image/jpeg",
                blob: base64, // Now it's base64 data URL
            }));

            console.log("Sending to /api/upload...");

            // Send to API
            const apiRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files }),
            });

            if (!apiRes.ok) {
                const errorText = await apiRes.text();
                console.error("API Error:", errorText);
                throw new Error(`API failed: ${apiRes.status} - ${errorText}`);
            }

            const rekognitionData = await apiRes.json();

            if (!rekognitionData || !rekognitionData.length) {
                console.warn("No data returned from API");
                setProcessedCount(0);
                setLoading(false);
                return;
            }

            console.log("Received Rekognition Data:", rekognitionData.length, "items");

            /** Only take the latest N items (matching number of uploaded images) */
            const latestData = rekognitionData.slice(0, imageUrls.length);

            console.log(`🎯 Using latest ${latestData.length} items out of ${rekognitionData.length} total`);

            /** Map metadata to local blob URLs */
            const finalData: NodeDataType[] = imageUrls.map((blobUrl, idx) => {
                const item = latestData[idx];

                if (!item) {
                    console.warn(`No metadata for image ${idx}`);
                    return {
                        id: uuidv4(),
                        imageUrl: blobUrl,
                        metadata: {
                            Emotion: "Unknown",
                            EmotionConfidence: "0",
                            RekognitionRaw: {},
                            date: "N/A",
                            Timestamp: "N/A",
                        },
                    };
                }

                return {
                    id: uuidv4(),
                    imageUrl: blobUrl,
                    metadata: item.metadata,
                };
            });

            console.log("Final Mapped Data:", finalData);

            // Store data in the node
            addData(id, finalData, "set");
            setProcessedCount(finalData.length);

            console.log("All Nodes : ", nodes);

            console.log(`Successfully processed ${finalData.length} images`);
        } catch (err) {
            console.error("RekognitionNode error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-36 h-auto border rounded-lg bg-white">
            {/* Flow Handles */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-2 py-1">
                <div className="flex items-center gap-1 text-zinc-600">
                    <Cpu className="text-red-500" size={10} />
                    <p className="text-[10px]">Rekognition Node</p>
                </div>
                <div onClick={handleRekognition}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/* Content */}
            {error ? (
                <div className="flex items-center justify-center text-red-500 text-[8px] py-2">
                    Error processing images.
                </div>
            ) : processedCount > 0 ? (
                <div className="flex flex-col items-center justify-center text-green-600 text-[8px] py-2 gap-1">
                    <p>{processedCount} images processed</p>
                </div>
            ) : images.length === 0 ? (
                <div className="flex items-center justify-center text-zinc-500 text-[8px] py-2">
                    No images found.
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-600 text-[8px] py-2 gap-1">
                    <p>{images.length} images ready</p>
                    <button
                        onClick={handleLoadImages}
                        className="border text-[8px] px-2 py-0.5 rounded hover:bg-zinc-50 transition"
                    >
                        Reload
                    </button>
                </div>
            )}
        </div>
    );
};

export default RekognitionNode;