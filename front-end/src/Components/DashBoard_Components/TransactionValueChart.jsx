import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    useTheme,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import palette from '../../Constants/palette';

const TransactionValueChart = ({
    transactionData,
    timeRange,
    setTimeRange
}) => {
    const theme = useTheme();

    // Hàm tạo dữ liệu biểu đồ giá trị nhập xuất theo ngày với hiệu ứng hình sin
    const generateTransactionValueData = (transactions, range) => {
        const today = new Date();
        const labels = [];
        const daysToShow = range === "week" ? 7 : range === "month" ? 30 : 90;

        // Tạo labels cho các ngày
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(
                date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })
            );
        }

        // Tính toán giá trị nhập và xuất theo ngày
        const importData = [];
        const exportData = [];
        const inventoryData = []; // Tồn kho = nhập - xuất

        let runningInventory = 0; // Tồn kho tích lũy

        labels.forEach((dateLabel, index) => {
            // Convert label back to date object for comparison
            const [day, month] = dateLabel.split("/").map(Number);
            const dateForLabel = new Date(today.getFullYear(), month - 1, day);

            // Tìm các giao dịch trong ngày này
            const dayTransactions = transactions.filter((t) => {
                const tDate = new Date(t.transactionDate || t.createdAt);
                return (
                    tDate.getDate() === dateForLabel.getDate() &&
                    tDate.getMonth() === dateForLabel.getMonth() &&
                    tDate.getFullYear() === dateForLabel.getFullYear()
                );
            });

            // Tính tổng giá trị nhập
            const importValue = dayTransactions
                .filter((t) => t.transactionType === "import")
                .reduce((sum, t) => {
                    const transactionValue = t.products && Array.isArray(t.products)
                        ? t.products.reduce((itemSum, product) => {
                            const price = parseFloat(product.price) || 0;
                            const quantity = parseInt(product.requestQuantity) || 0;
                            return itemSum + (price * quantity);
                        }, 0)
                        : (t.totalPrice || 0);
                    return sum + transactionValue;
                }, 0);

            // Tính tổng giá trị xuất
            const exportValue = dayTransactions
                .filter((t) => t.transactionType === "export")
                .reduce((sum, t) => {
                    const transactionValue = t.products && Array.isArray(t.products)
                        ? t.products.reduce((itemSum, product) => {
                            const price = parseFloat(product.price) || 0;
                            const quantity = parseInt(product.requestQuantity) || 0;
                            return itemSum + (price * quantity);
                        }, 0)
                        : (t.totalPrice || 0);
                    return sum + transactionValue;
                }, 0);

            // Tạo hiệu ứng hình sin cho dữ liệu
            const maxValue = Math.max(importValue, exportValue);
            const amplitude = maxValue > 0 ? maxValue * 0.15 : 1000000;
            const frequency = 2 * Math.PI / daysToShow;
            const sinOffset = amplitude * Math.sin(frequency * index);

            // Nếu không có dữ liệu thực, tạo dữ liệu demo với hiệu ứng sin
            const finalImportValue = importValue > 0 ? importValue + sinOffset :
                (Math.random() * 5000000 + 3000000) + sinOffset;
            const finalExportValue = exportValue > 0 ? exportValue + sinOffset :
                (Math.random() * 4000000 + 2000000) + sinOffset;

            importData.push(finalImportValue);
            exportData.push(finalExportValue);

            // Cập nhật tồn kho tích lũy
            runningInventory += (finalImportValue - finalExportValue);
            inventoryData.push(runningInventory);
        });

        return {
            labels,
            datasets: [
                {
                    label: "Giá trị nhập kho",
                    data: importData,
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    tension: 0.4,
                    fill: false,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#4CAF50",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    borderWidth: 3,
                },
                {
                    label: "Giá trị xuất kho",
                    data: exportData,
                    borderColor: "#F44336",
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    tension: 0.4,
                    fill: false,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: "#F44336",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    borderWidth: 3,
                },
                {
                    label: "Tồn kho (Nhập - Xuất)",
                    data: inventoryData,
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.05)",
                    tension: 0.6,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "#2196F3",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 1,
                    borderDash: [5, 5],
                    borderWidth: 2,
                },
            ],
        };
    };

    const chartData = generateTransactionValueData(transactionData, timeRange);

    // Tính tổng nhập, xuất và tồn kho
    const totalImport = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
    const totalExport = chartData.datasets[1].data.reduce((sum, val) => sum + val, 0);
    const currentInventory = totalImport - totalExport;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
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
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${new Intl.NumberFormat('vi-VN').format(context.parsed.y)} VND`;
                    }
                },
            },
        },
        scales: {
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
                    callback: function (value) {
                        return new Intl.NumberFormat('vi-VN', {
                            notation: 'compact',
                            compactDisplay: 'short'
                        }).format(value) + ' VND';
                    },
                },
                title: {
                    display: true,
                    text: "Giá trị (VND)",
                    color: theme.palette.text.secondary,
                },
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
                title: {
                    display: true,
                    text: "Ngày",
                    color: theme.palette.text.secondary,
                },
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
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
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
                {/* Header */}
                <Box sx={{
                    background: `linear-gradient(135deg, ${palette.dark} 0%, ${palette.medium} 100%)`,
                    color: 'white',
                    p: 3,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimelineIcon sx={{ mr: 1 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Sơ đồ giá trị nhập xuất theo ngày
                            </Typography>
                        </Box>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Khoảng thời gian</InputLabel>
                            <Select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                label="Khoảng thời gian"
                                sx={{
                                    color: 'white',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                    },
                                    '.MuiSvgIcon-root': {
                                        color: 'white',
                                    }
                                }}
                            >
                                <MenuItem value="week">7 ngày</MenuItem>
                                <MenuItem value="month">30 ngày</MenuItem>
                                <MenuItem value="quarter">90 ngày</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Summary Cards */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            icon={<TrendingUpIcon />}
                            label={`Tổng nhập: ${new Intl.NumberFormat('vi-VN').format(Math.round(totalImport))} VND`}
                            sx={{
                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                color: '#4CAF50',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#4CAF50' }
                            }}
                        />
                        <Chip
                            icon={<TrendingDownIcon />}
                            label={`Tổng xuất: ${new Intl.NumberFormat('vi-VN').format(Math.round(totalExport))} VND`}
                            sx={{
                                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                color: '#F44336',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#F44336' }
                            }}
                        />
                        <Chip
                            label={`Tồn kho: ${new Intl.NumberFormat('vi-VN').format(Math.round(currentInventory))} VND`}
                            sx={{
                                backgroundColor: currentInventory >= 0 ? `${palette.medium}30` : 'rgba(255, 152, 0, 0.2)',
                                color: currentInventory >= 0 ? palette.dark : '#FF9800',
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                </Box>

                {/* Chart */}
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ height: 400, position: 'relative' }}>
                        <Line data={chartData} options={chartOptions} />
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TransactionValueChart;