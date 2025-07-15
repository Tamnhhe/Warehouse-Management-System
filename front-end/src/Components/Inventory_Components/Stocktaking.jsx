import React, { useEffect, useState } from "react";
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios";

const API_BASE = "http://localhost:9999/inventory";
const STOCKTAKING_API = "http://localhost:9999/stocktaking";

function Stocktaking() {
    const [inventories, setInventories] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [createInventoryId, setCreateInventoryId] = useState("");
    const [createProducts, setCreateProducts] = useState([]);
    const [createProductIds, setCreateProductIds] = useState([]);
    const [createAuditor, setCreateAuditor] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [openTask, setOpenTask] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [actualQuantities, setActualQuantities] = useState({});
    const [adjustmentResult, setAdjustmentResult] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchInventories();
        fetchTasks();
    }, []);

    const fetchInventories = async () => {
        try {
            const res = await axios.get(API_BASE);
            setInventories(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setInventories([]);
        }
    };
    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${STOCKTAKING_API}/history`);
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setTasks([]);
        }
    };

    // Tạo phiếu kiểm kê mới
    const handleOpenCreate = () => {
        setCreateInventoryId("");
        setCreateProducts([]);
        setCreateProductIds([]);
        setCreateAuditor(localStorage.getItem("userId") || "demo-user");
        setOpenCreate(true);
    };
    const handleSelectCreateInventory = (id) => {
        setCreateInventoryId(id);
        const inv = inventories.find(i => i._id === id);
        setCreateProducts(inv?.products || []);
        setCreateProductIds([]);
    };
    const handleToggleProduct = (id) => {
        setCreateProductIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };
    const handleSubmitCreate = async () => {
        setCreateLoading(true);
        try {
            const res = await axios.post(`${STOCKTAKING_API}/create-pending`, {
                inventoryId: createInventoryId,
                productIds: createProductIds,
                auditor: createAuditor
            });
            setOpenCreate(false);
            fetchTasks();
        } catch (err) {
            alert("Lỗi khi tạo phiếu kiểm kê!");
        }
        setCreateLoading(false);
    };

    // Xem/Thao tác phiếu kiểm kê
    const handleOpenTask = async (task) => {
        setDetailLoading(true);
        try {
            const res = await axios.get(`${STOCKTAKING_API}/detail/${task._id}`);
            setCurrentTask(res.data);
            if (res.data.status === "pending") {
                // Chuẩn bị actualQuantities mặc định = systemQuantity
                setActualQuantities(Object.fromEntries(res.data.products.map(p => [p.productId, p.systemQuantity])));
            }
            setAdjustmentResult(null);
            setOpenTask(true);
        } catch (err) {
            alert("Lỗi khi lấy chi tiết phiếu kiểm kê!");
        }
        setDetailLoading(false);
    };
    const handleChangeActual = (productId, value) => {
        setActualQuantities({ ...actualQuantities, [productId]: value });
    };
    const handleSubmitStocktaking = async () => {
        try {
            const reqProducts = currentTask.products.map(p => ({
                productId: p.productId,
                actualQuantity: Number(actualQuantities[p.productId] || 0)
            }));
            const res = await axios.put(`${STOCKTAKING_API}/update/${currentTask._id}`, {
                products: reqProducts
            });
            setCurrentTask(res.data.task);
            fetchTasks();
        } catch (err) {
            alert("Lỗi khi xác nhận kiểm kê!");
        }
    };
    const handleCreateAdjustment = async () => {
        try {
            const createdBy = localStorage.getItem("userId") || "demo-user";
            const res = await axios.post(`${STOCKTAKING_API}/adjustment`, {
                stocktakingTaskId: currentTask._id,
                createdBy
            });
            setAdjustmentResult(res.data.adjustment);
            fetchTasks();
        } catch (err) {
            alert("Lỗi khi tạo phiếu điều chỉnh!");
        }
    };

    return (
        <Box sx={{ p: 3, background: "#fff", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={900} color="#1976d2" sx={{ letterSpacing: 2, mb: 3 }}>
                Kiểm Kê Kho
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={handleOpenCreate}>
                Tạo phiếu kiểm kê mới
            </Button>
            {/* Danh sách phiếu kiểm kê */}
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kệ</TableCell>
                            <TableCell>Người kiểm kê</TableCell>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Điều chỉnh</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map(task => (
                            <TableRow key={task._id}>
                                <TableCell>{task.inventoryId?.name || task.inventoryId}</TableCell>
                                <TableCell>{task.auditor?.name || task.auditor}</TableCell>
                                <TableCell>{task.checkedAt ? new Date(task.checkedAt).toLocaleString() : "-"}</TableCell>
                                <TableCell>{task.status === "completed" ? "Đã hoàn thành" : "Chờ kiểm kê"}</TableCell>
                                <TableCell>{task.adjustmentId ? "Đã điều chỉnh" : "-"}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => handleOpenTask(task)}>
                                        Xem
                                    </Button>
                                    {task.status === "pending" && (
                                        <Button size="small" variant="contained" color="info" sx={{ ml: 1 }} startIcon={<FactCheckIcon />} onClick={() => handleOpenTask(task)}>
                                            Kiểm kê
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Popup tạo phiếu kiểm kê mới */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo phiếu kiểm kê mới</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="create-inventory-label">Chọn kệ</InputLabel>
                        <Select
                            labelId="create-inventory-label"
                            value={createInventoryId}
                            label="Chọn kệ"
                            onChange={e => handleSelectCreateInventory(e.target.value)}
                        >
                            <MenuItem value="">-- Chọn kệ --</MenuItem>
                            {inventories.map(inv => (
                                <MenuItem key={inv._id} value={inv._id}>{inv.name} ({inv.category?.categoryName || inv.categoryId})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {createProducts.length > 0 && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="create-product-label">Chọn sản phẩm kiểm kê</InputLabel>
                            <Select
                                labelId="create-product-label"
                                multiple
                                value={createProductIds}
                                onChange={e => setCreateProductIds(e.target.value)}
                                renderValue={selected => selected.length + " sản phẩm"}
                            >
                                {createProducts.map(prod => (
                                    <MenuItem key={prod.productId} value={prod.productId}>
                                        <Checkbox checked={createProductIds.includes(prod.productId)} />
                                        <ListItemText primary={`${prod.productName} (${prod.unit || ''})`} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleSubmitCreate} disabled={!createInventoryId || createProductIds.length === 0 || createLoading}>
                        Tạo phiếu
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Popup chi tiết/thao tác phiếu kiểm kê */}
            <Dialog open={openTask} onClose={() => setOpenTask(false)} maxWidth="md" fullWidth>
                <DialogTitle>Phiếu kiểm kê</DialogTitle>
                <DialogContent>
                    {detailLoading || !currentTask ? (
                        <Typography>Đang tải...</Typography>
                    ) : (
                        <>
                            <Typography fontWeight={700}>Kệ: {currentTask.inventoryId?.name || currentTask.inventoryId}</Typography>
                            <Typography>Người kiểm kê: {currentTask.auditor?.name || currentTask.auditor}</Typography>
                            <Typography>Thời gian: {currentTask.checkedAt ? new Date(currentTask.checkedAt).toLocaleString() : "-"}</Typography>
                            <Typography>Trạng thái: {currentTask.status === "completed" ? "Đã hoàn thành" : "Chờ kiểm kê"}</Typography>
                            <Box sx={{ mt: 2 }}>
                                {currentTask.products.map((prod, idx) => (
                                    <Box key={prod.productId} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                        <Typography sx={{ minWidth: 120 }}>{prod.productName || prod.productId}</Typography>
                                        <Typography sx={{ mx: 2, color: "#1976d2" }}>Hệ thống: {prod.systemQuantity} {prod.unit}</Typography>
                                        {currentTask.status === "pending" ? (
                                            <TextField
                                                label="Thực tế"
                                                type="number"
                                                size="small"
                                                value={actualQuantities[prod.productId]}
                                                onChange={e => handleChangeActual(prod.productId, e.target.value)}
                                                sx={{ width: 100 }}
                                            />
                                        ) : (
                                            <Typography sx={{ mx: 2 }}>Thực tế: {prod.actualQuantity} {prod.unit}</Typography>
                                        )}
                                        {currentTask.status === "completed" && (
                                            <Typography color={prod.difference !== 0 ? "error" : "success.main"} sx={{ ml: 2 }}>
                                                Lệch: {prod.difference}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                            {currentTask.status === "pending" && (
                                <Button variant="contained" startIcon={<FactCheckIcon />} sx={{ mt: 2 }} onClick={handleSubmitStocktaking}>
                                    Xác nhận kiểm kê
                                </Button>
                            )}
                            {currentTask.status === "completed" && currentTask.products.some(p => p.difference !== 0) && !adjustmentResult && !currentTask.adjustmentId && (
                                <Button variant="contained" color="warning" sx={{ mt: 2 }} onClick={handleCreateAdjustment}>
                                    Tạo phiếu điều chỉnh
                                </Button>
                            )}
                            {(adjustmentResult || currentTask.adjustmentId) && (
                                <Typography color="success.main" sx={{ mt: 2 }}>Đã tạo phiếu điều chỉnh thành công!</Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTask(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Stocktaking; 