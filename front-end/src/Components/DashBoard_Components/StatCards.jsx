import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

const StatCards = ({ stats }) => {
    const theme = useTheme();

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                                border: `2px solid ${stat.color}30`,
                                borderRadius: 3,
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 25px ${stat.color}25`,
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: stat.color,
                                            mb: 1,
                                            fontSize: { xs: '1.5rem', sm: '2rem' }
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {stat.title}
                                    </Typography>
                                </Box>

                                {/* Decorative element */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        width: 40,
                                        height: 40,
                                        backgroundColor: stat.color,
                                        borderRadius: '50%',
                                        opacity: 0.1,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatCards;