import React from 'react';
import {
    Box,
    Tabs,
    Tab,
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    SmartToy as SmartToyIcon,
    Inventory as InventoryIcon,
    Store as StoreIcon,
} from '@mui/icons-material';
import palette from '../../Constants/palette';

const TabNavigation = ({ activeTab, setActiveTab }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const tabs = [
        {
            id: "transaction-value",
            label: "Sơ đồ nhập xuất",
            icon: <TimelineIcon />,
            color: palette.dark,        // "#155E64" - Xanh đậm
            featured: true
        },
        {
            id: "stock",
            label: "Biểu đồ tồn kho",
            icon: <BarChartIcon />,
            color: palette.medium      // "#75B39C" - Xanh vừa
        },
        {
            id: "price",
            label: "So sánh giá",
            icon: <AssessmentIcon />,
            color: palette.light       // "#A0E4D0" - Xanh nhạt (darker for visibility)
        },
        {
            id: "category",
            label: "Phân bố danh mục",
            icon: <PieChartIcon />,
            color: "#2e7d32"          // Green
        },
        {
            id: "status",
            label: "Tình trạng kho",
            icon: <InventoryIcon />,
            color: "#d32f2f"          // Red
        },
        {
            id: "trend",
            label: "Xu hướng tiêu thụ",
            icon: <TrendingUpIcon />,
            color: palette.medium      // "#75B39C" - Xanh vừa
        }
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{
                backgroundColor: 'background.paper',
                borderRadius: 3,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                mb: 4
            }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTabs-flexContainer': {
                            gap: 1,
                            p: 1,
                        },
                        '& .MuiTab-root': {
                            minHeight: 64,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                                color: theme.palette.text.primary,
                                transform: 'translateY(-2px)',
                            },
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                backgroundColor: `${theme.palette.primary.main}10`,
                                border: `1px solid ${theme.palette.primary.main}30`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${theme.palette.primary.main}25`,
                            }
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none', // Hide default indicator since we're using custom styling
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            value={tab.id}
                            label={
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        color: activeTab === tab.id ? tab.color : 'inherit',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {tab.icon}
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start'
                                    }}>
                                        <span>{tab.label}</span>
                                        {tab.featured && (
                                            <Chip
                                                label="HOT"
                                                size="small"
                                                sx={{
                                                    height: 16,
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    backgroundColor: tab.color,
                                                    color: 'white',
                                                    '& .MuiChip-label': {
                                                        px: 0.5,
                                                    }
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            }
                            sx={{
                                minWidth: isMobile ? 'auto' : 140,
                                px: 2,
                            }}
                        />
                    ))}
                </Tabs>
            </Box>
        </motion.div>
    );
};

export default TabNavigation;