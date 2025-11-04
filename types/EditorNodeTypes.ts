import DataNode from "@/components/Nodes/DataNode";
import ViewerNode from "@/components/Nodes/ViewerNode";
import MergeNode from "@/components/Nodes/MergeNode";
import RekognitionNode from "@/components/Nodes/RekognitionNode";
import LimitNode from "@/components/Nodes/LimitNode";
import FilterNode from "@/components/Nodes/FilterNode";

export const EditorNodeTypes = {
    'DataNode' : DataNode,
    'ViewerNode' : ViewerNode,
    'MergeNode' : MergeNode,
    'RekognitionNode' : RekognitionNode,
    'LimitNode' : LimitNode,
    'FilterNode' : FilterNode,
}