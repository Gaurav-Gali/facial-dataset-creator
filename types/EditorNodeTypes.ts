import DataNode from "@/components/Nodes/DataNode";
import ViewerNode from "@/components/Nodes/ViewerNode";
import MergeNode from "@/components/Nodes/MergeNode";
import RekognitionNode from "@/components/Nodes/RekognitionNode";
import LimitNode from "@/components/Nodes/LimitNode";
import FilterNode from "@/components/Nodes/FilterNode";
import ConditionalNode from "@/components/Nodes/ConditionalNode";
import AnalyticsNode from "@/components/Nodes/AnalyticsNode";
import SplitterNode from "@/components/Nodes/SplitterNode";
import QueryItemNode from "@/components/Nodes/QueryItemNode";

export const EditorNodeTypes = {
    'DataNode' : DataNode,
    'ViewerNode' : ViewerNode,
    'MergeNode' : MergeNode,
    'SplitterNode': SplitterNode,
    'QueryItemNode' : QueryItemNode,
    'RekognitionNode' : RekognitionNode,
    'LimitNode' : LimitNode,
    'FilterNode' : FilterNode,
    'ConditionalNode' : ConditionalNode,
    'AnalyticsNode' : AnalyticsNode,
}