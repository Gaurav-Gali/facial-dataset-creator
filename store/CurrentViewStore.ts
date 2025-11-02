import {atom} from "jotai";
import {NodeDataType} from "@/types/NodeType";

export const currentViewAtom = atom<NodeDataType[]>([]);