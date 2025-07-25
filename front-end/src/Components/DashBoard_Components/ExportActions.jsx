import React from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    FileDownload as FileDownloadIcon,
    TableChart as TableChartIcon,
    PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import palette from '../../Constants/palette';

const ExportActions = ({ onExportCSV, onExportPDF }) => {
    const theme = useTheme();

    const handleExportCSV = () => {
        if (onExportCSV) {
            onExportCSV();
        }
    };

    const handleExportPDF = () => {
        if (onExportPDF) {
            onExportPDF();
        } else {
            alert("Tính năng export PDF sẽ được triển khai với thư viện jsPDF");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{ display: 'flex', gap: 2 }}>
                <ButtonGroup
                    variant="outlined"
                    sx={{
                        '& .MuiButton-root': {
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderColor: palette.dark,
                            color: palette.dark,
                            '&:hover': {
                                backgroundColor: palette.dark,
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${palette.dark}30`,
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
                    }}
                >
                    <Button
                        startIcon={<TableChartIcon />}
                        onClick={handleExportCSV}
                    >
                        Xuất CSV
                    </Button>
                    <Button
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleExportPDF}
                    >
                        Xuất PDF
                    </Button>
                </ButtonGroup>
            </Box>
        </motion.div>
    );
};

export default ExportActions;