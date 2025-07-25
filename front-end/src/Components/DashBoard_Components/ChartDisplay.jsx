import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    useTheme,
} from '@mui/material';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

const ChartDisplay = ({ activeTab, chartData, timeRange, salesData }) => {
    const theme = useTheme();

    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return (
            <Card sx={{ height: 400, borderRadius: 3 }}>
                <CardContent sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Không có dữ liệu để hiển thị
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const getChartTitle = () => {
        switch (activeTab) {
            case "stock":
                return "Số lượng sản phẩm trong kho";
            case "price":
                return "So sánh giá sản phẩm";
            case "category":
                return "Phân bố sản phẩm theo danh mục";
            case "status":
                return "Tình trạng tồn kho";
            case "transaction-value":
                return `Giá trị nhập xuất kho theo ngày (${timeRange === "week" ? "7 ngày" :
                        timeRange === "month" ? "30 ngày" : "90 ngày"
                    })`;
            case "trend":
                return `Xu hướng tiêu thụ (${timeRange === "week" ? "7 ngày" :
                        timeRange === "month" ? "30 ngày" : "90 ngày"
                    })`;
            default:
                return "Biểu đồ thống kê";
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false, // Sử dụng Typography thay thế
            },
            legend: {
                display: activeTab === "stock" || activeTab === "transaction-value" || activeTab === "trend",
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: theme.typography.fontFamily,
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: activeTab === "transaction-value" ? {
                    label: function (context) {
                        return `${context.dataset.label}: ${new Intl.NumberFormat('vi-VN').format(context.parsed.y)} VND`;
                    }
                } : undefined,
            },
        },
        scales: (activeTab === "category" || activeTab === "status") ? {} : {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)',
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    font: {
                        size: 11,
                    },
                    callback: activeTab === "transaction-value" ? function (value) {
                        return new Intl.NumberFormat('vi-VN', {
                            notation: 'compact',
                            compactDisplay: 'short'
                        }).format(value) + ' VND';
                    } : undefined,
                },
                title: (activeTab === "trend" || activeTab === "transaction-value") ? {
                    display: true,
                    text: activeTab === "transaction-value" ? "Giá trị (VND)" : "Số lượng",
                    color: theme.palette.text.secondary,
                } : undefined,
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)',
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    font: {
                        size: 11,
                    },
                },
                title: (activeTab === "trend" || activeTab === "transaction-value") ? {
                    display: true,
                    text: "Ngày",
                    color: theme.palette.text.secondary,
                } : undefined,
            },
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 3,
            },
            point: {
                radius: 4,
                hoverRadius: 6,
            },
            bar: {
                borderRadius: 4,
                borderSkipped: false,
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
        }
    };

    const renderChart = () => {
        switch (activeTab) {
            case "stock":
            case "price":
                return <Bar data={chartData} options={chartOptions} />;
            case "category":
            case "status":
                return <Doughnut data={chartData} options={chartOptions} />;
            case "trend":
            case "transaction-value":
                return <Line data={chartData} options={chartOptions} />;
            default:
                return <Bar data={chartData} options={chartOptions} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            textAlign: 'center'
                        }}
                    >
                        {getChartTitle()}
                    </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ height: 350, position: 'relative' }}>
                        {renderChart()}
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ChartDisplay;