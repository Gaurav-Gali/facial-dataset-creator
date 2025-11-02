import React from 'react';
import NodeEditor from "@/components/NodeEditor";
import DataViewer from "@/components/DataViewer";

const Page = () => {
    return (
        <div className={"flex"}>
            <NodeEditor/>
            <DataViewer/>
        </div>
    );
};

export default Page;