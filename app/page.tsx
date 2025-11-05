import React from 'react';
import NodeEditor from "@/components/NodeEditor";
import DataViewer from "@/components/DataViewer";
import AddDataNode from "@/components/AddNodes/AddDataNode";
import AddViewerNode from "@/components/AddNodes/AddViewerNode";
import AddMergeNode from "@/components/AddNodes/AddMergeNode";
import AddRekognitionNode from "@/components/AddNodes/AddrekognitionNode";
import AddLimitNode from "@/components/AddNodes/AddLimitNode";
import AddFilterNode from "@/components/AddNodes/AddFilterNode";
import AddConditionalNode from "@/components/AddNodes/AddConditionalNode";
import {Separator} from "@/components/ui/separator";
import AddAnalyticsNode from "@/components/AddNodes/AddAnalyticsNode";
import AddSplitterNode from "@/components/AddNodes/AddSplitterNode";
import AddQueryItemNode from "@/components/AddNodes/AddQueryItemNode";

const Page = () => {
    return (
        <div className={"flex"}>
            {/*Add Nodes*/}
            <div className={"absolute bg-white border rounded-full py-2 px-2 space-y-2 top-3 left-3 z-50"}>
                <AddDataNode/>
                <AddViewerNode/>

                <Separator/>

                <AddMergeNode/>
                <AddSplitterNode/>
                <AddQueryItemNode/>

                <Separator/>

                <AddLimitNode/>
                <AddFilterNode/>
                <AddConditionalNode/>
                <Separator/>

                <AddAnalyticsNode/>
                <AddRekognitionNode/>
            </div>
            <NodeEditor/>
            <DataViewer/>
        </div>
    );
};

export default Page;