import {atom} from "jotai";
import {EdgeType} from "@/types/EdgeType";
import {NodeType} from "@/types/NodeType";

export const NodesAtom = atom<NodeType[]>([
    {
        id: "1",
        position : {x:0, y:0},
        data: {"data" : []},
        type: "DataNode",
    },
    {
        id: "2",
        position : {x:10, y:10},
        data: {"data" : []},
        type: "ViewerNode",
    },
]);
export const EdgesAtom = atom<EdgeType[]>([]);