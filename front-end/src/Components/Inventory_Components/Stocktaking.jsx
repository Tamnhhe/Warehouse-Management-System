import React, { useEffect, useState } from "react";
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Select, MenuItem, InputLabel, FormControl, CircularProgress
} from "@mui/material";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HistoryIcon from '@mui/icons-material/History';
import axios from "axios";

const API_BASE = "http://localhost:9999/inventory";
const STOCKTAKING_API = "http://localhost:9999/stocktaking";

function Stocktaking() {
    const [inventories, setInventories] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState("");
    const [products, setProducts] = useState([]);
    const [actualQuantities, setActualQuantities] = useState({});
    const [stocktakingResult, setStocktakingResult] = useState(null);
    const [adjustmentResult, setAdjustmentResult] = useState(null);
    const [openHistory, setOpenHistory] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        try {
            const res = await axios.get(API_BASE);
            setInventories(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setInventories([]);
        }
    };

    const handleSelectInventory = (id) => {
        setSelectedInventory(id);
        const inv = inventories.find(i => i._id === id);
        const prods = (inv?.products || []).map(p => ({ ...p, actualQuantity: p.quantity }));
        setProducts(prods);
        setActualQuantities(Object.fromEntries(prods.map(p => [p.productId, p.quantity])));
        setStocktakingResult(null);
        setAdjustmentResult(null);
    };

    const handleChangeActual = (productId, value) => {
        setActualQuantities({ ...actualQuantities, [productId]: value });
    };

    const handleSubmitStocktaking = async () => {
        try {
            const auditor = localStorage.getItem("userId") || "demo-user";
            const reqProducts = products.map(p => ({
                productId: p.productId,
                actualQuantity: Number(actualQuantities[p.productId] || 0)
            }));
            const res = await axios.post(`${STOCKTAKING_API}/create`, {
                inventoryId: selectedInventory,
                products: reqProducts,
                auditor
            });
            setStocktakingResult(res.data.task);
        } catch (err) {
            alert("Lỗi khi kiểm kê!");
        }
    };

    const handleCreateAdjustment = async () => {
        try {
            const createdBy = localStorage.getItem("userId") || "demo-user";
            const res = await axios.post(`${STOCKTAKING_API}/adjustment`, {
                stocktakingTaskId: stocktakingResult._id,
                createdBy
            });
            setAdjustmentResult(res.data.adjustment);
            fetchInventories();
        } catch (err) {
            alert("Lỗi khi tạo phiếu điều chỉnh!");
        }
    };

    const handleOpenHistory = async () => {
        try {
            const res = await axios.get(`${STOCKTAKING_API}/history`);
            setHistory(res.data);
            setOpenHistory(true);
        } catch (err) {
            alert("Lỗi khi tải lịch sử kiểm kê!");
        }
    };

    return (
        <Box sx={{ p: 3, background: "#fff", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={900} color="#1976d2" sx={{ letterSpacing: 2, mb: 3 }}>
                Kiểm Kê Kho
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FormControl sx={{ minWidth: 260, mr: 2 }}>
                    <InputLabel id="inventory-label">Chọn kệ kiểm kê</InputLabel>
                    <Select
                        labelId="inventory-label"
                        value={selectedInventory}
                        label="Chọn kệ kiểm kê"
                        onChange={e => handleSelectInventory(e.target.value)}
                    >
                        <MenuItem value="">-- Chọn kệ --</MenuItem>
                        {inventories.map(inv => (
                            <MenuItem key={inv._id} value={inv._id}>{inv.name} ({inv.category?.categoryName || inv.categoryId})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    sx={{ fontWeight: 700, borderRadius: 3 }}
                    onClick={handleOpenHistory}
                >
                    Lịch sử kiểm kê
                </Button>
            </Box>
            {selectedInventory && (
                <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, mb: 3 }}>
                    <Typography fontWeight={700} color="#1976d2" sx={{ mb: 2 }}>Danh sách sản phẩm trên kệ</Typography>
                    {products.length === 0 ? (
                        <Typography color="text.secondary">Không có sản phẩm trên kệ này.</Typography>
                    ) : (
                        products.map((prod, idx) => (
                            <Box key={prod.productId} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography sx={{ minWidth: 120 }}>{prod.productName}</Typography>
                                <Typography sx={{ mx: 2, color: "#1976d2" }}>Hệ thống: {prod.quantity}</Typography>
                                <TextField
                                    label="Thực tế"
                                    type="number"
                                    size="small"
                                    value={actualQuantities[prod.productId]}
                                    onChange={e => handleChangeActual(prod.productId, e.target.value)}
                                    sx={{ width: 100 }}
                                />
                            </Box>
                        ))
                    )}
                    <Box sx={{ mt: 2 }}>
                        {!stocktakingResult && (
                            <Button variant="contained" startIcon={<FactCheckIcon />} onClick={handleSubmitStocktaking}>
                                Xác nhận kiểm kê
                            </Button>
                        )}
                    </Box>
                    {stocktakingResult && (
                        <Box sx={{ mt: 2 }}>
                            <Typography fontWeight={700} color="#1976d2">Kết quả kiểm kê:</Typography>
                            {stocktakingResult.products.map((p, idx) => (
                                <Typography key={p.productId} color={p.difference !== 0 ? "error" : "success.main"}>
                                    {p.productId}: Lệch {p.difference} ({p.systemQuantity} → {p.actualQuantity})
                                </Typography>
                            ))}
                            {stocktakingResult.products.some(p => p.difference !== 0) && !adjustmentResult && (
                                <Button variant="contained" color="warning" sx={{ mt: 2 }} onClick={handleCreateAdjustment}>
                                    Tạo phiếu điều chỉnh
                                </Button>
                            )}
                            {adjustmentResult && (
                                <Typography color="success.main" sx={{ mt: 2 }}>Đã tạo phiếu điều chỉnh thành công!</Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}
            {/* Dialog lịch sử kiểm kê */}
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
                <DialogTitle>Lịch sử kiểm kê</DialogTitle>
                <DialogContent>
                    {history.length === 0 ? (
                        <Typography>Chưa có phiếu kiểm kê nào.</Typography>
                    ) : (
                        history.map((task, idx) => (
                            <Box key={task._id} sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 2 }}>
                                <Typography fontWeight={700}>Kệ: {task.inventoryId?.name || task.inventoryId}</Typography>
                                <Typography>Người kiểm kê: {task.auditor?.name || task.auditor}</Typography>
                                <Typography>Thời gian: {new Date(task.checkedAt).toLocaleString()}</Typography>
                                {task.products.map((p, i) => (
                                    <Typography key={p.productId} color={p.difference !== 0 ? "error" : "success.main"}>
                                        {p.productId}: Lệch {p.difference} ({p.systemQuantity} → {p.actualQuantity})
                                    </Typography>
                                ))}
                                {task.adjustmentId && <Typography color="success.main">Đã điều chỉnh</Typography>}
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Stocktaking; 