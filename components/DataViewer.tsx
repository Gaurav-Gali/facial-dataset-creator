"use client";

import React, {useState} from 'react';
import {ImageOff} from "lucide-react";

const DataViewer = () => {
    const [images, setImages] = useState<string[]>([]);
    return (
        <div className={"bg-white border-l h-screen w-[30vw]"}>
            {
                images.length === 0 ? (
                    <div className={"text-zinc-500 h-full flex items-center justify-center gap-1"}>
                        <ImageOff size={20}/>
                        <p className={"text-xl"}>
                            No images found.
                        </p>
                    </div>
                ) : (
                    <div>
                        Images
                    </div>
                )
            }
        </div>
    );
};

export default DataViewer;