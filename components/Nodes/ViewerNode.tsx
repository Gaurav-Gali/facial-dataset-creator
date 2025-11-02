import React, {useState} from 'react';
import {Handle, Position} from "@xyflow/react";
import {View, Play} from "lucide-react";
import PlayButton from "@/components/PlayButton";
import {useAtom} from "jotai";
import {currentViewAtom} from "@/store/CurrentViewStore";
import {NodeDataType} from "@/types/NodeType";
import useGetIncomming from "@/hooks/useGetIncomming";

const ViewerNode = ({id}:{id:string}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [viewer, setViewer] = useAtom<NodeDataType[]>(currentViewAtom);
    const getIncomming = useGetIncomming();

    const handleLoadViewer = async () => {
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 300));

        const inNodes = getIncomming(id);

        if (inNodes && inNodes.length > 0) {
            const firstNode = inNodes[0];
            const incomingData = firstNode?.data?.data || [];
            console.log(viewer);
            setViewer(incomingData);
        } else {
            setViewer([]);
        }

        setLoading(false);
    };

    return (
        <div className={"w-36 h-auto border rounded-lg bg-white"}>
            {/*Handle*/}
            <Handle
                type={"target"}
                position={Position.Left}
            />

            {/*Header*/}
            <div className={"flex items-center justify-between gap-2 border-b px-2 py-1"}>
                <div className={"flex items-center gap-1 text-zinc-600"}>
                    <View className={"text-blue-400"} size={10}/>
                    <p className={"text-[10px]"}>Viewer Node</p>
                </div>
                <div onClick={() => handleLoadViewer()}>
                    <PlayButton loading={loading} />
                </div>
            </div>

            {/*Content*/}
            {
                viewer.length === 0 ? (
                    <div className={"flex items-center justify-center text-zinc-500 text-[8px] py-2"}>
                        No images found.
                    </div>
                ) : (
                    <div className={"flex items-center justify-center text-zinc-500 text-[8px] py-2"}>
                        {viewer.length} images found
                    </div>
                )
            }
        </div>
    );
};

export default ViewerNode;