import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Utils/Card';
import { Button } from '../Utils/Button';
import { TrendingUp, AlertCircle, Package } from 'lucide-react';

const QuickInsightsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBasicStats();
    }, []);

    const loadBasicStats = async () => {
        setLoading(true);
        try {
            const [productsRes, transactionsRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/inventoryTransactions')
            ]);

            const products = await productsRes.json();
            const transactions = await transactionsRes.json();

            const lowStockProducts = products.filter(p =>
                p.totalStock <= (p.thresholdStock || 0)
            ).length;

            const basicData = {
                totalProducts: products.length,
                lowStockProducts,
                recentActivity: transactions.filter(t =>
                    new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
            };

            setStats(basicData);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Stats Cards */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Tổng sản phẩm</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {stats?.totalProducts || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-red-600">Sắp hết hàng</p>
                            <p className="text-2xl font-bold text-red-900">
                                {stats?.lowStockProducts || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Hoạt động 7 ngày</p>
                            <p className="text-2xl font-bold text-green-900">
                                {stats?.recentActivity || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="md:col-span-3 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        📊 Tổng Quan Nhanh
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="border-r border-gray-200 last:border-r-0">
                                <p className="text-2xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
                                <p className="text-sm text-gray-600">Tổng sản phẩm trong kho</p>
                            </div>
                            <div className="border-r border-gray-200 last:border-r-0">
                                <p className="text-2xl font-bold text-red-600">{stats?.lowStockProducts || 0}</p>
                                <p className="text-sm text-gray-600">Sản phẩm sắp hết hàng</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats?.recentActivity || 0}</p>
                                <p className="text-sm text-gray-600">Giao dịch 7 ngày qua</p>
                            </div>
                        </div>
                        {stats?.lowStockProducts > 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    ⚠️ Cảnh báo: Có {stats.lowStockProducts} sản phẩm sắp hết hàng. Cần bổ sung kho!
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuickInsightsDashboard;