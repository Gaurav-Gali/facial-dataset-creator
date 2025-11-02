import {atom} from "jotai";
import {EdgeType} from "@/types/EdgeType";
import {NodeType} from "@/types/NodeType";

export const NodesAtom = atom<NodeType[]>([

]);
export const EdgesAtom = atom<EdgeType[]>([]);