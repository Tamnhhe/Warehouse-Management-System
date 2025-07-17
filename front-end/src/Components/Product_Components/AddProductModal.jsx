import React, { useState, useEffect } from "react";
import useCategory from "../../Hooks/useCategory";
import useInventory from "../../Hooks/useInventory";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Button, Box, CircularProgress, Alert, Typography
} from "@mui/material";

const AddProductModal = ({ open, handleClose, onSaveSuccess, createProduct, checkProductName }) => {
    const [productData, setProductData] = useState({
        productName: "", categoryId: "", totalStock: 0,
        productImage: null, unit: "", location: "", status: "active",
        location: [] // [{ inventoryId, stock }]
    });
    const [selectedInventory, setSelectedInventory] = useState(""); // Inventory user selects
    const [inventoryStock, setInventoryStock] = useState(""); // Stock for selected inventory
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Use category hook
    const { categories, getAllCategories } = useCategory();
    // Use inventory hook
    const { inventories, fetchInventories } = useInventory();

    useEffect(() => {
        if (open) {
            getAllCategories();
            fetchInventories();
        } else {
            setProductData({
                productName: "", categoryId: "", totalStock: 0,
                productImage: null, unit: "", location: "", status: "active",
                location: []
            });
            setSelectedInventory("");
            setInventoryStock("");
            setErrors({});
            setImagePreview(null);
            setLoading(false);
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductData((prev) => ({ ...prev, productImage: file }));
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            setProductData((prev) => ({ ...prev, productImage: null }));
            setImagePreview(null);
        }
        if (errors.productImage) {
            setErrors((prev) => ({ ...prev, productImage: "" }));
        }
    };

    // Handle inventory selection and stock input
    const handleInventorySelect = (e) => {
        setSelectedInventory(e.target.value);
        setInventoryStock("");
        setErrors((prev) => ({ ...prev, location: "" }));
    };

    const handleInventoryStockInput = (e) => {
        setInventoryStock(e.target.value);
        setErrors((prev) => ({ ...prev, location: "" }));
    };

    const handleAddInventory = () => {
        if (!selectedInventory || inventoryStock === "" || Number(inventoryStock) < 0) {
            setErrors((prev) => ({
                ...prev,
                location: "Vui lòng chọn kho và nhập số lượng tồn kho hợp lệ."
            }));
            return;
        }
        // Prevent duplicate inventory
        if (productData.location.some(inv => inv.inventoryId === selectedInventory)) {
            setErrors((prev) => ({
                ...prev,
                location: "Kho đã được thêm."
            }));
            return;
        }
        setProductData((prev) => ({
            ...prev,
            location: [
                ...prev.location,
                { inventoryId: selectedInventory, stock: Number(inventoryStock) }
            ]
        }));
        setSelectedInventory("");
        setInventoryStock("");
    };

    const handleRemoveInventory = (inventoryId) => {
        setProductData((prev) => ({
            ...prev,
            location: prev.location.filter(inv => inv.inventoryId !== inventoryId)
        }));
    };

    const validate = async () => {
        let tempErrors = {};
        tempErrors.productName = productData.productName ? "" : "Tên sản phẩm không được bỏ trống.";
        tempErrors.categoryId = productData.categoryId ? "" : "Vui lòng chọn danh mục.";
        tempErrors.unit = productData.unit ? "" : "Đơn vị không được bỏ trống.";
        if (!productData.productImage) {
            tempErrors.productImage = "Vui lòng chọn hình ảnh sản phẩm.";
        } else if (!["image/jpeg", "image/png"].includes(productData.productImage.type)) {
            tempErrors.productImage = "Hình ảnh phải là định dạng JPEG hoặc PNG.";
        } else {
            tempErrors.productImage = "";
        }
        // Validate inventories
        if (!productData.location.length) {
            tempErrors.location = "Vui lòng thêm ít nhất một kho và số lượng tồn kho.";
        } else if (productData.location.some(inv => !inv.stock || inv.stock < 0)) {
            tempErrors.location = "Số lượng tồn kho phải là số >= 0.";
        } else {
            tempErrors.location = "";
        }
        setErrors(tempErrors);

        const isFormValid = Object.values(tempErrors).every((x) => x === "");


        return isFormValid;
    };

    const handleSave = async () => {
        setErrors(prev => ({ ...prev, general: "" }));
        if (await validate()) {
            setLoading(true);
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                // Fix: send location as array, not JSON string
                if (key === "location") {
                    // Append each location object as location[]
                    value.forEach((loc, idx) => {
                        formData.append(`location[${idx}][inventoryId]`, loc.inventoryId);
                        formData.append(`location[${idx}][stock]`, loc.stock);
                    });
                } else {
                    formData.append(key, value);
                }
            });

            try {
                await createProduct(formData);
                onSaveSuccess();
                // handleClose();
            } catch (error) {
                setErrors((prev) => ({ ...prev, general: error?.message || "Có lỗi xảy ra." }));
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {errors.general && <Alert severity="error">{errors.general}</Alert>}
                    <TextField autoFocus name="productName" label="Tên Sản Phẩm" value={productData.productName} onChange={handleChange} error={!!errors.productName} helperText={errors.productName} fullWidth />
                    <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel id="category-select-label">Danh Mục</InputLabel>
                        <Select labelId="category-select-label" name="categoryId" value={productData.categoryId} label="Danh Mục" onChange={handleChange}>
                            <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
                            {categories.map((cat) => (<MenuItem key={cat._id} value={cat._id}>{cat.categoryName}</MenuItem>))}
                        </Select>
                        {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
                    </FormControl>
                    <TextField name="unit" label="Đơn Vị (ví dụ: cái, hộp, kg)" value={productData.unit} onChange={handleChange} error={!!errors.unit} helperText={errors.unit} fullWidth />
                    {/* Inventory selection */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Chọn kho và nhập tồn kho cho từng kho:</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <FormControl sx={{ minWidth: 160 }}>
                                <InputLabel id="inventory-select-label">Kho</InputLabel>
                                <Select
                                    labelId="inventory-select-label"
                                    value={selectedInventory}
                                    label="Kho"
                                    onChange={handleInventorySelect}
                                >
                                    <MenuItem value=""><em>Chọn kho</em></MenuItem>
                                    {inventories
                                        .filter(inv => !productData.location.some(i => i.inventoryId === inv._id))
                                        .map(inv => (
                                            <MenuItem key={inv._id} value={inv._id}>{inv.name}</MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <TextField
                                type="number"
                                label="Tồn kho"
                                size="small"
                                inputProps={{ min: 0 }}
                                value={inventoryStock}
                                onChange={handleInventoryStockInput}
                                sx={{ width: 120 }}
                            />
                            <Button variant="contained" onClick={handleAddInventory}>Thêm</Button>
                        </Stack>
                        {productData.location.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2">Danh sách kho đã chọn:</Typography>
                                {productData.location.map(inv => {
                                    const inventoryObj = inventories.find(i => i._id === inv.inventoryId);
                                    return (
                                        <Stack direction="row" alignItems="center" spacing={2} key={inv.inventoryId} sx={{ mb: 1 }}>
                                            <Typography sx={{ minWidth: 100 }}>{inventoryObj ? inventoryObj.name : inv.inventoryId}</Typography>
                                            <Typography sx={{ minWidth: 80 }}>Tồn kho: {inv.stock}</Typography>
                                            <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveInventory(inv.inventoryId)}>Xóa</Button>
                                        </Stack>
                                    );
                                })}
                            </Box>
                        )}
                        {errors.location && <FormHelperText error>{errors.location}</FormHelperText>}
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel id="status-select-label">Trạng Thái</InputLabel>
                        <Select labelId="status-select-label" name="status" value={productData.status} label="Trạng Thái" onChange={handleChange}>
                            <MenuItem value="active">Đang bán</MenuItem>
                            <MenuItem value="inactive">Ngừng bán</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined" component="label" color={errors.productImage ? "error" : "primary"}>
                        Chọn Hình Ảnh
                        <input type="file" hidden accept="image/png, image/jpeg" onChange={handleFileChange} />
                    </Button>
                    {errors.productImage && <FormHelperText error>{errors.productImage}</FormHelperText>}
                    {imagePreview && <Box sx={{ mt: 2, textAlign: 'center' }}><img src={imagePreview} alt="Xem trước sản phẩm" style={{ maxWidth: "200px", height: "auto", borderRadius: '8px' }} /></Box>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} disabled={loading} color="secondary">Hủy</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : "Lưu Sản Phẩm"}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProductModal;
