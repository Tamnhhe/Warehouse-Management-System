import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Utils/Tabs';
import InventoryStrategyAnalysis from './InventoryStrategyAnalysis';
import QuickInsightsDashboard from './QuickInsightsDashboard';
import { Brain, BarChart3, Zap } from 'lucide-react';

const AIInventoryHub = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🤖 AI Inventory Intelligence Hub
                    </h1>
                    <p className="text-xl text-gray-600">
                        Phân tích thông minh với Gemini 2.5 Flash - Chiến lược nhập hàng tự động
                    </p>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger
                            value="dashboard"
                            className="flex items-center gap-2 text-lg py-3"
                        >
                            <Zap className="h-5 w-5" />
                            Dashboard Nhanh
                        </TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="flex items-center gap-2 text-lg py-3"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Phân Tích Chi Tiết
                        </TabsTrigger>
                    </TabsList>

                    {/* Quick Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="h-8 w-8 text-purple-600" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Dashboard Thông Minh
                                    </h2>
                                    <p className="text-gray-600">
                                        Thông tin tổng quan và khuyến nghị nhanh từ AI
                                    </p>
                                </div>
                            </div>
                            <QuickInsightsDashboard />
                        </div>
                    </TabsContent>

                    {/* Detailed Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-6">
                        <InventoryStrategyAnalysis />
                    </TabsContent>
                </Tabs>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Brain className="h-6 w-6 text-blue-600" />
                            <span className="text-lg font-semibold text-gray-900">
                                Powered by Gemini 2.5 Flash
                            </span>
                        </div>
                        <p className="text-gray-600">
                            Sử dụng trí tuệ nhân tạo tiên tiến để phân tích dữ liệu kho hàng và đưa ra khuyến nghị chiến lược
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInventoryHub;