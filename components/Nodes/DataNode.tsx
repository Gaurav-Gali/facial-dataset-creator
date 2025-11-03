import React, { useState } from "react";
import {Database, ImageUp} from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import useAddData from "@/hooks/useAddData";
import PlayButton from "@/components/PlayButton";
import {useAtom} from "jotai";
import {NodesAtom} from "@/store/NodesAndEdgesStore";

const DataNode = ({id} : {id:string}) => {
    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages = Array.from(files).map((file) =>
            URL.createObjectURL(file)
        );

        setImages((prev) => [...prev, ...newImages]);
    };

    const addData = useAddData();
    const [loading, setLoading] = useState(false);

    const [nodes, setNodes] = useAtom(NodesAtom);

    const handleAddData = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        addData(id, images);
        setLoading(false);

        console.log("Images : ", nodes);
    };


    return (
        <div className="w-36 h-auto border rounded-lg bg-white">
            {/*Handle*/}
            <Handle type="source" position={Position.Right} />

            {/*Header*/}
            <div className="flex items-center justify-between gap-2 border-b px-2 py-1">
                <div className="flex items-center gap-1 text-zinc-600">
                    <Database className="text-yellow-400" size={10} />
                    <p className="text-[10px]">Data Node</p>
                </div>
                <div onClick={() => handleAddData()}>
                    <PlayButton loading={loading}/>
                </div>
            </div>

            {/*Content*/}
            <div className="flex flex-col">
                {images.length === 1 ? (
                    <div className="flex justify-center py-2">
                        <img
                            src={images[0]}
                            alt="upload-0"
                            className="w-24 h-24 object-cover rounded border"
                        />
                    </div>
                ) : images.length > 1 ? (
                    <div className="flex justify-center py-2 relative">
                        <img
                            src={images[0]}
                            alt="upload-0"
                            className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <div className="absolute top-1 right-4 border bg-zinc-50 w-4 h-4 bg-opacity-70 flex items-center justify-center text-zinc-500 text-[8px] rounded-full">
                            {images.length - 1}
                        </div>
                    </div>
                ) : null}

                {/* Add/Upload button at bottom */}
                <label className="cursor-pointer border-t text-blue-400 text-[8px] text-center py-1.5">
                    <p className={"flex items-center justify-center gap-1"}>
                        <ImageUp size={8}/>
                        {images.length === 0 ? "Add images" : "Add more"}
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default DataNode;