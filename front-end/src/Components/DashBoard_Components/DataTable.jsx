import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Chip,
    Button,
    Box,
    useTheme,
    Avatar,
    Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

const DataTable = ({
    sortedProducts,
    handleSortChange,
    sortBy,
    sortOrder,
    displayCount,
    setDisplayCount,
}) => {
    const theme = useTheme();

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Critical':
                return <ErrorIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />;
            case 'Low':
                return <WarningIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
            case 'Normal':
                return <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />;
            default:
                return <InventoryIcon sx={{ fontSize: 16 }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical':
                return theme.palette.error.main;
            case 'Low':
                return theme.palette.warning.main;
            case 'Normal':
                return theme.palette.success.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const getDaysUntilExpiryColor = (days) => {
        if (days <= 30) return theme.palette.error.main;
        if (days <= 90) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    const columns = [
        { field: 'productName', label: 'Tên sản phẩm', sortable: true },
        { field: 'categoryName', label: 'Danh mục', sortable: true },
        { field: 'supplierName', label: 'Nhà cung cấp', sortable: true },
        { field: 'price', label: 'Giá (VND)', sortable: true, align: 'right' },
        { field: 'totalStock', label: 'Tồn kho', sortable: true, align: 'center' },
        { field: 'stockStatus', label: 'Trạng thái', sortable: true, align: 'center' },
        { field: 'formattedLocation', label: 'Vị trí', sortable: false },
        { field: 'daysUntilExpiry', label: 'Ngày hết hạn', sortable: true, align: 'center' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <Box sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.main}05 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InventoryIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                                Danh sách sản phẩm
                            </Typography>
                            <Chip
                                label={`${sortedProducts.length} sản phẩm`}
                                size="small"
                                sx={{ ml: 2, fontWeight: 600 }}
                                color="secondary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </Box>

                <CardContent sx={{ p: 0 }}>
                    {sortedProducts.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.field}
                                                align={column.align || 'left'}
                                                sx={{
                                                    fontWeight: 700,
                                                    backgroundColor: theme.palette.grey[50],
                                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                                    cursor: column.sortable ? 'pointer' : 'default',
                                                    '&:hover': column.sortable ? {
                                                        backgroundColor: theme.palette.grey[100],
                                                    } : {},
                                                }}
                                                onClick={column.sortable ? () => handleSortChange(column.field) : undefined}
                                            >
                                                {column.sortable ? (
                                                    <TableSortLabel
                                                        active={sortBy === column.field}
                                                        direction={sortBy === column.field ? sortOrder : 'asc'}
                                                        sx={{
                                                            '& .MuiTableSortLabel-icon': {
                                                                color: `${theme.palette.primary.main} !important`,
                                                            },
                                                        }}
                                                    >
                                                        {column.label}
                                                    </TableSortLabel>
                                                ) : (
                                                    column.label
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedProducts.slice(0, displayCount).map((product, index) => (
                                        <TableRow
                                            key={product.id || index}
                                            sx={{
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: theme.palette.grey[50],
                                                },
                                                '&:hover': {
                                                    backgroundColor: theme.palette.action.hover,
                                                    transform: 'scale(1.001)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            mr: 2,
                                                            backgroundColor: theme.palette.primary.light,
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {product.productName?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {product.productName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {product.unit}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={product.categoryName}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2">
                                                    {product.supplierName || 'Chưa có'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                                    {product.price ? new Intl.NumberFormat('vi-VN').format(product.price) : 'N/A'}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                                                        {product.totalStock}
                                                    </Typography>
                                                    {product.totalStock <= product.thresholdStock && (
                                                        <Tooltip title="Dưới ngưỡng tối thiểu">
                                                            <WarningIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip
                                                    icon={getStatusIcon(product.stockStatus)}
                                                    label={product.stockStatus}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(product.stockStatus)}15`,
                                                        color: getStatusColor(product.stockStatus),
                                                        border: `1px solid ${getStatusColor(product.stockStatus)}30`,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Tooltip title={product.formattedLocation}>
                                                    <Typography
                                                        variant="body2"
                                                        noWrap
                                                        sx={{
                                                            maxWidth: 150,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {product.formattedLocation}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell align="center">
                                                {product.daysUntilExpiry ? (
                                                    <Chip
                                                        label={`${product.daysUntilExpiry} ngày`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getDaysUntilExpiryColor(product.daysUntilExpiry)}15`,
                                                            color: getDaysUntilExpiryColor(product.daysUntilExpiry),
                                                            border: `1px solid ${getDaysUntilExpiryColor(product.daysUntilExpiry)}30`,
                                                            fontWeight: product.daysUntilExpiry <= 30 ? 700 : 500,
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{
                            p: 6,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <InventoryIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Không có sản phẩm nào
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại
                            </Typography>
                        </Box>
                    )}

                    {/* Show More Button */}
                    {sortedProducts.length > displayCount && (
                        <Box sx={{ p: 3, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Button
                                variant="contained"
                                startIcon={<ExpandMoreIcon />}
                                onClick={() => setDisplayCount(sortedProducts.length)}
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                Hiển thị toàn bộ {sortedProducts.length} sản phẩm
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default DataTable;