// @ts-nocheck

import React, { useState, useMemo } from 'react';
import { Handle, Position } from "@xyflow/react";
import { BarChart3, Users, Eye, Smile, TrendingUp } from "lucide-react";
import {
    PieChart, Pie, BarChart, Bar, LineChart, Line,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area
} from 'recharts';
import { useAtom } from "jotai";
import { NodesAtom } from "@/store/NodesAndEdgesStore";
import useGetIncomming from "@/hooks/useGetIncomming";
import { NodeDataType } from "@/types/NodeType";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'];

// --- enhanced analytics extraction logic ---
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

    // New analytics
    const emotionBreakdown: Record<string, any> = {};
    const poseData: any[] = [];
    const landmarkData: any[] = [];
    const eyeDirectionData: any[] = [];
    const qualityMetrics: any[] = [];
    const emotionTimeline: any[] = [];
    const facialFeatureDetails: any[] = [];
    const ageDistribution: Record<string, number> = {};
    const poseDistribution: any[] = [];

    data.forEach((item, index) => {
        const meta = item.metadata;
        if (!meta) return;

        const face = meta.RekognitionRaw?.FaceDetails?.[0];
        if (!face) return;

        // Emotion analysis
        if (meta.Emotion) {
            emotionCounts[meta.Emotion] = (emotionCounts[meta.Emotion] || 0) + 1;

            // Emotion timeline
            emotionTimeline.push({
                time: new Date(meta.Timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                emotion: meta.Emotion,
                confidence: parseFloat(meta.EmotionConfidence)
            });

            // Emotion breakdown
            if (face.Emotions) {
                emotionBreakdown[`Image ${index + 1}`] = face.Emotions.reduce((acc: any, emotion) => {
                    acc[emotion.Type.toLowerCase()] = Math.round(emotion.Confidence);
                    return acc;
                }, {});
            }
        }

        // Gender distribution
        const gender = face.Gender?.Value;
        if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;

        // Age analysis
        const ageRange = face.AgeRange;
        if (ageRange) {
            const avgAge = Math.round((ageRange.Low + ageRange.High) / 2);
            ageData.push({
                name: `Img ${index + 1}`,
                avg: avgAge,
                low: ageRange.Low,
                high: ageRange.High
            });

            // Age distribution
            const ageGroup = `${Math.floor(avgAge / 10) * 10}-${Math.floor(avgAge / 10) * 10 + 9}`;
            ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
        }

        // Quality metrics
        const quality = face.Quality;
        if (quality) {
            brightnessData.push({
                name: `${index + 1}`,
                brightness: Math.round(quality.Brightness),
                sharpness: Math.round(quality.Sharpness)
            });

            qualityMetrics.push({
                name: `Img ${index + 1}`,
                brightness: Math.round(quality.Brightness),
                sharpness: Math.round(quality.Sharpness),
                overall: Math.round((quality.Brightness + quality.Sharpness) / 2)
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

        // Detailed facial features
        facialFeatureDetails.push({
            name: `Img ${index + 1}`,
            smile: face.Smile?.Value ? face.Smile.Confidence : 0,
            beard: face.Beard?.Value ? face.Beard.Confidence : 0,
            mustache: face.Mustache?.Value ? face.Mustache.Confidence : 0,
            eyesOpen: face.EyesOpen?.Value ? face.EyesOpen.Confidence : 0,
            mouthOpen: face.MouthOpen?.Value ? face.MouthOpen.Confidence : 0
        });

        // Emotion confidence chart
        if (meta.Emotion && meta.EmotionConfidence) {
            emotionConfidenceData.push({
                name: `${index + 1}`,
                confidence: parseFloat(meta.EmotionConfidence),
                emotion: meta.Emotion
            });
        }

        // Pose analysis
        const pose = face.Pose;
        if (pose) {
            poseData.push({
                name: `Img ${index + 1}`,
                roll: Math.round(pose.Roll),
                pitch: Math.round(pose.Pitch),
                yaw: Math.round(pose.Yaw)
            });

            // Pose distribution
            const poseCategory =
                Math.abs(pose.Yaw) < 10 ? 'Front' :
                    pose.Yaw > 0 ? 'Right' : 'Left';
            poseDistribution.push({ pose: poseCategory });
        }

        // Landmark analysis
        if (face.Landmarks) {
            const leftEye = face.Landmarks.find(l => l.Type === 'eyeLeft');
            const rightEye = face.Landmarks.find(l => l.Type === 'eyeRight');
            const mouthLeft = face.Landmarks.find(l => l.Type === 'mouthLeft');
            const mouthRight = face.Landmarks.find(l => l.Type === 'mouthRight');

            if (leftEye && rightEye && mouthLeft && mouthRight) {
                landmarkData.push({
                    name: `Img ${index + 1}`,
                    eyeDistance: Math.sqrt(Math.pow(leftEye.X - rightEye.X, 2) + Math.pow(leftEye.Y - rightEye.Y, 2)),
                    mouthWidth: Math.sqrt(Math.pow(mouthLeft.X - mouthRight.X, 2) + Math.pow(mouthLeft.Y - mouthRight.Y, 2))
                });
            }
        }

        // Eye direction analysis
        const eyeDirection = face.EyeDirection;
        if (eyeDirection) {
            eyeDirectionData.push({
                name: `Img ${index + 1}`,
                yaw: Math.round(eyeDirection.Yaw),
                pitch: Math.round(eyeDirection.Pitch),
                confidence: Math.round(eyeDirection.Confidence)
            });
        }
    });

    // Process aggregated data
    const poseDistributionCount = poseDistribution.reduce((acc: any, item) => {
        acc[item.pose] = (acc[item.pose] || 0) + 1;
        return acc;
    }, {});

    return {
        // Original metrics
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
        totalImages: data.length,

        // New enhanced metrics
        emotionBreakdown: Object.entries(emotionBreakdown).slice(0, 10), // Limit for performance
        poseData,
        landmarkData,
        eyeDirectionData,
        qualityMetrics,
        emotionTimeline,
        facialFeatureDetails,
        ageDistribution: Object.entries(ageDistribution).map(([name, value]) => ({ name, value })),
        poseDistribution: Object.entries(poseDistributionCount).map(([name, value]) => ({ name, value })),
        allEmotions: Object.keys(emotionCounts)
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
            const firstNode = inNodes[0];
            const nodeData: NodeDataType[] = firstNode?.data?.data || [];

            if (nodeData.length > 0) {
                return processAnalytics(nodeData);
            }
        }

        return null;
    }, [nodes, id, getIncomming]);

    const chartOptions = [
        { value: 'emotion', label: 'Emotion Distribution', icon: '' },
        { value: 'gender', label: 'Gender Distribution', icon: '' },
        { value: 'age', label: 'Age Analysis', icon: '' },
        { value: 'quality', label: 'Image Quality', icon: '' },
        // { value: 'confidence', label: 'Confidence Trend', icon: '' },
        // { value: 'features', label: 'Facial Features', icon: '' },
        { value: 'emotionConf', label: 'Emotion Confidence', icon: '' },
        { value: 'pose', label: 'Head Pose', icon: '' },
        { value: 'eyes', label: 'Eye Direction', icon: '' },
        // { value: 'emotionDetail', label: 'Emotion Breakdown', icon: '' },
        // { value: 'timeline', label: 'Emotion Timeline', icon: '' },
        { value: 'ageDist', label: 'Age Distribution', icon: '' },
        { value: 'poseDist', label: 'Pose Distribution', icon: '' },
        { value: 'featureDetail', label: 'Feature Details', icon: '' }
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
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="avg" fill="#8b5cf6" name="Avg Age" />
                            <Bar dataKey="low" fill="#c4b5fd" name="Min Age" />
                            <Bar dataKey="high" fill="#a78bfa" name="Max Age" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'quality':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={analyticsData.qualityMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line type="monotone" dataKey="brightness" stroke="#f59e0b" strokeWidth={2} />
                            <Line type="monotone" dataKey="sharpness" stroke="#10b981" strokeWidth={2} />
                            <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'confidence':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={analyticsData.confidenceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="confidence" stroke="#3b82f6" fill="#3b82f620" />
                        </AreaChart>
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
                        <BarChart data={analyticsData.emotionConfidenceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="confidence" fill="#8b5cf6" name="Confidence %">
                                {analyticsData.emotionConfidenceData.map((entry: any, index: number) => (
                                    <Cell key={index} fill={COLORS[analyticsData.allEmotions.indexOf(entry.emotion) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pose':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <ScatterChart data={analyticsData.poseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="roll" name="Roll" tick={{ fontSize: 9 }} />
                            <YAxis dataKey="pitch" name="Pitch" tick={{ fontSize: 9 }} />
                            <ZAxis dataKey="yaw" name="Yaw" range={[50, 200]} />
                            <Tooltip />
                            <Scatter name="Head Pose" data={analyticsData.poseData} fill="#8b5cf6" />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case 'landmarks':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={analyticsData.landmarkData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="eyeDistance" fill="#ec4899" name="Eye Distance" />
                            <Bar dataKey="mouthWidth" fill="#f59e0b" name="Mouth Width" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'eyes':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <ScatterChart data={analyticsData.eyeDirectionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="yaw" name="Yaw" tick={{ fontSize: 9 }} />
                            <YAxis dataKey="pitch" name="Pitch" tick={{ fontSize: 9 }} />
                            <ZAxis dataKey="confidence" name="Confidence" range={[50, 200]} />
                            <Tooltip />
                            <Scatter name="Eye Direction" data={analyticsData.eyeDirectionData} fill="#06b6d4" />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case 'emotionDetail':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={analyticsData.emotionBreakdown.slice(0, 1)[0]?.[1] ? [analyticsData.emotionBreakdown.slice(0, 1)[0][1]] : []}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar name="Emotion Scores" dataKey="angry" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                            <Radar name="Emotion Scores" dataKey="disgusted" stroke="#84cc16" fill="#84cc16" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                );

            case 'timeline':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={analyticsData.emotionTimeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'ageDist':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={analyticsData.ageDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10b981" name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'poseDist':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={analyticsData.poseDistribution}
                                cx="50%" cy="50%" labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60} dataKey="value"
                            >
                                {analyticsData.poseDistribution.map((entry: any, index: number) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'featureDetail':
                return (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={analyticsData.facialFeatureDetails.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="smile" fill="#10b981" name="Smile Conf" stackId="a" />
                            <Bar dataKey="beard" fill="#8b5cf6" name="Beard Conf" stackId="a" />
                            <Bar dataKey="mustache" fill="#f59e0b" name="Mustache Conf" stackId="a" />
                            <Bar dataKey="eyesOpen" fill="#06b6d4" name="Eyes Open Conf" stackId="a" />
                            <Bar dataKey="mouthOpen" fill="#ec4899" name="Mouth Open Conf" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-80 h-auto border overflow-clip rounded-lg bg-white">
            {/* Target Handle Only */}
            <Handle type="target" position={Position.Left} />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2 bg-white">
                <div className="flex items-center gap-2 text-zinc-700">
                    <BarChart3 className="text-violet-500" size={14} />
                    <p className="text-sm font-medium">Face Analytics</p>
                </div>
                {analyticsData && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                            {analyticsData.totalImages} images
                        </span>
                    </div>
                )}
            </div>

            {/* Chart Selector */}
            <div className="px-3 py-2 border-b bg-zinc-50/90">
                <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value)}
                    className="w-full text-xs px-2 py-2 rounded border bg-white outline-none"
                >
                    {chartOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Chart Display */}
            <div className="px-3 py-4 min-h-[200px]">
                {renderChart()}
            </div>

            {/* Quick Stats Footer */}
            {analyticsData && (
                <div className="border-t bg-zinc-50 px-3 py-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-600">
                        <div>
                            <div className="font-semibold">{analyticsData.emotionDistribution.length}</div>
                            <div>Emotions</div>
                        </div>
                        <div>
                            <div className="font-semibold">{analyticsData.genderDistribution.length}</div>
                            <div>Genders</div>
                        </div>
                        <div>
                            <div className="font-semibold">{analyticsData.totalImages}</div>
                            <div>Total</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsNode;