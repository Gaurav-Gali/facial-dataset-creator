import {EditorNodeTypes} from "@/types/EditorNodeTypes";

export type NodeDataType = {
    id: string;
    imageUrl: string;
    metadata:object
}

export type NodeType = {
    id: string,
    position : {x:number, y:number},
    data: {"data" : NodeDataType[]},
    type: keyof typeof EditorNodeTypes,
}