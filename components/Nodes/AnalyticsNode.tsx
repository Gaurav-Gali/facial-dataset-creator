import React, { useState, useMemo } from 'react';
import { Handle, Position } from "@xyflow/react";
import { BarChart3 } from "lucide-react";
import {
    PieChart, Pie, BarChart, Bar, LineChart, Line,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAtom } from "jotai";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import useGetIncomming from "@/hooks/useGetIncomming";
import { NodeDataType } from "@/types/NodeType";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'];

// --- analytics extraction logic ---
const processAnalytics = (data: NodeDataType[]) => {
    const emotionCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    const ageData: any[] = [];
    const brightnessData: any[] = [];
    const confidenceData: any[] = [];
    let smileCount = 0;
    let beardCount = 0;
    let mustacheCount = 0;
    const emotionConfidenceData: any[] = [];

    data.forEach((item, index) => {
        const meta = item.metadata;
        if (!meta) return;

        if (meta.Emotion) {
            emotionCounts[meta.Emotion] = (emotionCounts[meta.Emotion] || 0) + 1;
        }

        const face = meta.RekognitionRaw?.FaceDetails?.[0];
        if (!face) return;

        // Gender distribution
        const gender = face.Gender?.Value;
        if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

        // Age
        const ageRange = face.AgeRange;
        if (ageRange) {
            ageData.push({
                name: `Img ${index + 1}`,
                avg: (ageRange.Low + ageRange.High) / 2
            });
        }

        // Quality
        const quality = face.Quality;
        if (quality) {
            brightnessData.push({
                name: `${index + 1}`,
                brightness: Math.round(quality.Brightness),
                sharpness: Math.round(quality.Sharpness)
            });
        }

        // Confidence Trend
        if (meta.EmotionConfidence && meta.Timestamp) {
            confidenceData.push({
                time: new Date(meta.Timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                confidence: parseFloat(meta.EmotionConfidence)
            });
        }

        // Facial features count
        if (face.Smile?.Value) smileCount++;
        if (face.Beard?.Value) beardCount++;
        if (face.Mustache?.Value) mustacheCount++;

        // Emotion confidence chart
        if (meta.Emotion && meta.EmotionConfidence) {
            emotionConfidenceData.push({
                name: `${index + 1}`,
                confidence: parseFloat(meta.EmotionConfidence)
            });
        }
    });

    return {
        emotionDistribution: Object.entries(emotionCounts).map(([name, value]) => ({ name, value })),
        genderDistribution: Object.entries(genderCounts).map(([name, value]) => ({ name, value })),
        ageData,
        brightnessData,
        confidenceData,
        facialFeatures: [
            { name: 'Smile', value: smileCount },
            { name: 'Beard', value: beardCount },
            { name: 'Mustache', value: mustacheCount },
        ],
        emotionConfidenceData,
        totalImages: data.length
    };
};

// --- main component ---
const AnalyticsNode = ({ id }: { id: string }) => {
    const [selectedChart, setSelectedChart] = useState('emotion');

    const getIncomming = useGetIncomming();
    const [nodes] = useAtom(NodesAtom);

    // Process analytics data using useMemo
    const analyticsData = useMemo(() => {
        const inNodes = getIncomming(id);

        if (inNodes && inNodes.length > 0) {
            // ✅ Use only first incoming node
            const firstNode = inNodes[0];
            const nodeData: NodeDataType[] = firstNode?.data?.data || [];

            if (nodeData.length > 0) {
                return processAnalytics(nodeData);
            }
        }

        return null;
    }, [nodes, id, getIncomming]);

    const chartOptions = [
        { value: 'emotion', label: 'Emotion Distribution' },
        { value: 'gender', label: 'Gender Distribution' },
        { value: 'age', label: 'Average Age' },
        { value: 'quality', label: 'Brightness & Sharpness' },
        { value: 'confidence', label: 'Confidence Trend' },
        { value: 'features', label: 'Facial Features' },
        { value: 'emotionConf', label: 'Emotion Confidence' }
    ];

    const renderChart = () => {
        if (!analyticsData) {
            return (
                <div className="flex items-center justify-center text-zinc-400 text-[10px] h-48">
                    No data available
                </div>
            );
        }

        switch (selectedChart) {
            case 'emotion':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={analyticsData.emotionDistribution}
                                cx="50%" cy="50%" labelLine={false}
                                label={({ name, percent }) => `${name.slice(0,3)} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60} dataKey="value"
                            >
                                {analyticsData.emotionDistribution.map((entry: any, index: number) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'gender':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={analyticsData.genderDistribution}
                                cx="50%" cy="50%" labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60} dataKey="value"
                            >
                                {analyticsData.genderDistribution.map((entry: any, index: number) => (
                                    <Cell key={index} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'age':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={analyticsData.ageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="avg" fill="#8b5cf6" name="Avg Age" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'quality':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={analyticsData.brightnessData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line type="monotone" dataKey="brightness" stroke="#f59e0b" strokeWidth={2} />
                            <Line type="monotone" dataKey="sharpness" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'confidence':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={analyticsData.confidenceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} name="Confidence %" />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'features':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={analyticsData.facialFeatures}
                                cx="50%" cy="50%"
                                innerRadius={35} outerRadius={60}
                                label={({ name, value }) => `${name}: ${value}`}
                                dataKey="value"
                                labelLine={false}
                            >
                                {analyticsData.facialFeatures.map((entry: any, index: number) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'emotionConf':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={analyticsData.emotionConfidenceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <YAxis dataKey="name" type="category" width={30} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="confidence" fill="#8b5cf6" name="Conf %" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-64 h-auto border overflow-clip rounded-lg bg-white">
            {/* Target Handle Only */}
            <Handle type="target" position={Position.Left} />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2 bg-white">
                <div className="flex items-center gap-2 text-zinc-700">
                    <BarChart3 className="text-violet-500" size={10} />
                    <p className="text-xs">Analytics</p>
                </div>
                {analyticsData && (
                    <span className="text-[10px] text-zinc-500">{analyticsData.totalImages} items</span>
                )}
            </div>

            {/* Chart Selector */}
            <div className="px-3 py-2 border-b bg-zinc-50/90">
                <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value)}
                    className="w-full text-[11px] px-0 py-1.5 rounded bg-transparent outline-none"
                >
                    {chartOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Chart Display */}
            <div className="px-2 py-3 m-3">{renderChart()}</div>
        </div>
    );
};

export default AnalyticsNode;