import React from 'react';
import NodeEditor from "@/components/NodeEditor";
import DataViewer from "@/components/DataViewer";
import AddDataNode from "@/components/AddNodes/AddDataNode";
import AddViewerNode from "@/components/AddNodes/AddViewerNode";
import AddMergeNode from "@/components/AddNodes/AddMergeNode";
import AddRekognitionNode from "@/components/AddNodes/AddrekognitionNode";

const Page = () => {
    return (
        <div className={"flex"}>
            {/*Add Nodes*/}
            <div className={"absolute space-y-2 top-5 left-5 z-50"}>
                <AddDataNode/>
                <AddViewerNode/>
                <AddMergeNode/>
                <AddRekognitionNode/>
            </div>
            <NodeEditor/>
            <DataViewer/>
        </div>
    );
};

export default Page;