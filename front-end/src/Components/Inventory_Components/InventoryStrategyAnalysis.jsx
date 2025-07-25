import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Utils/Card';
import { Button } from '../Utils/Button';
import { TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';

const InventoryStrategyAnalysis = () => {
    const [inventoryData, setInventoryData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInventoryData();
    }, []);

    const loadInventoryData = async () => {
        setLoading(true);
        try {
            // Fetch data from your existing APIs
            const [productsRes, transactionsRes, categoriesRes, suppliersRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/inventoryTransactions'),
                fetch('/api/categories'),
                fetch('/api/suppliers')
            ]);

            const data = {
                products: await productsRes.json(),
                transactions: await transactionsRes.json(),
                categories: await categoriesRes.json(),
                suppliers: await suppliersRes.json()
            };

            setInventoryData(data);
        } catch (error) {
            console.error('Error loading inventory data:', error);
            toast.error('Không thể tải dữ liệu kho hàng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        📊 Phân Tích Chiến Lược Nhập Hàng
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Theo dõi và phân tích dữ liệu kho hàng
                    </p>
                </div>
            </div>

            {/* Data Status */}
            {inventoryData && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {inventoryData.products?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Sản phẩm</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {inventoryData.transactions?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Giao dịch</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {inventoryData.categories?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Danh mục</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {inventoryData.suppliers?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Nhà cung cấp</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Basic Analysis */}
            {inventoryData && (
                <div className="space-y-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-xl text-blue-800">📊 Tổng Quan Kho Hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border">
                                    <h4 className="font-semibold text-gray-800 mb-2">Thống Kê Sản Phẩm</h4>
                                    <p className="text-gray-600">
                                        Tổng số sản phẩm: <span className="font-bold">{inventoryData.products?.length || 0}</span>
                                    </p>
                                    <p className="text-gray-600">
                                        Số danh mục: <span className="font-bold">{inventoryData.categories?.length || 0}</span>
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border">
                                    <h4 className="font-semibold text-gray-800 mb-2">Hoạt Động Gần Đây</h4>
                                    <p className="text-gray-600">
                                        Tổng giao dịch: <span className="font-bold">{inventoryData.transactions?.length || 0}</span>
                                    </p>
                                    <p className="text-gray-600">
                                        Nhà cung cấp: <span className="font-bold">{inventoryData.suppliers?.length || 0}</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-400 mb-4">
                            <TrendingUp className="h-16 w-16 mx-auto animate-pulse" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Đang tải dữ liệu...
                        </h3>
                    </CardContent>
                </Card>
            )}

            {/* No Data State */}
            {!inventoryData && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="text-gray-400 mb-4">
                            <TrendingUp className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Không có dữ liệu
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Không thể tải dữ liệu kho hàng
                        </p>
                        <Button
                            onClick={loadInventoryData}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Thử lại
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default InventoryStrategyAnalysis;