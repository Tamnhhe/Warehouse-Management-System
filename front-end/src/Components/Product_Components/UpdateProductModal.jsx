import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Stack, Alert, Box, CircularProgress
} from "@mui/material";
import axios from "axios";

const UpdateProductModal = ({
  open,
  handleClose,
  product,
  onUpdateSuccess,
  inventories = [], // <-- lấy từ props
}) => {
  const [productData, setProductData] = useState({
    productName: "",
    categoryId: "",
    productImage: "",
    unit: "",
    inventoryId: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories (KHÔNG fetch inventories nữa)
  useEffect(() => {
    if (open) {
      axios
        .get("http://localhost:9999/categories/getAllCategories")
        .then((response) => setCategories(response.data))
        .catch((error) => console.error("Error fetching categories:", error));
    }
  }, [open]);

useEffect(() => {
  if (product && categories.length > 0 && inventories.length > 0) {
    const categoryId =
      typeof product.categoryId === "object"
        ? product.categoryId._id
        : product.categoryId;
    // Lấy inventoryId mới nhất từ product (có thể là object hoặc string)
    let inventoryId = "";
    if (typeof product.inventoryId === "object" && product.inventoryId !== null) {
      inventoryId = product.inventoryId._id || product.inventoryId.id || "";
    } else {
      inventoryId = product.inventoryId || "";
    }

    // Nếu inventoryId không có trong danh sách inventories thì lấy inventoryId đầu tiên của filteredInventories (nếu có)
    const filtered = inventories.filter(inv =>
      String(inv.categoryId) === String(categoryId) ||
      (inv.category && String(inv.category._id) === String(categoryId))
    );
    let validInventoryId = inventoryId;
    if (inventoryId && !filtered.some(inv => inv._id === inventoryId)) {
      validInventoryId = filtered.length > 0 ? filtered[0]._id : "";
    }

    setProductData({
      productName: product.productName || "",
      categoryId: categoryId || "",
      productImage: product.productImage || "",
      unit: product.unit || "",
      inventoryId: validInventoryId,
      status: product.status || "active",
    });

    setFilteredInventories(filtered);

    setImagePreview(
      product.productImage
        ? `http://localhost:9999${product.productImage}`
        : null
    );
  }
}, [product, categories, inventories]);
  // Lọc lại danh sách kệ khi chọn danh mục
  useEffect(() => {
    if (productData.categoryId) {
      const filtered = inventories.filter(inv =>
        String(inv.categoryId) === String(productData.categoryId) ||
        (inv.category && String(inv.category._id) === String(productData.categoryId))
      );
      setFilteredInventories(filtered);

      // Nếu inventoryId hiện tại không thuộc danh mục thì reset
      if (!filtered.some(inv => inv._id === productData.inventoryId)) {
        setProductData(prev => ({ ...prev, inventoryId: "" }));
      }
    } else {
      setFilteredInventories([]);
      setProductData(prev => ({ ...prev, inventoryId: "" }));
    }
  }, [productData.categoryId, inventories]);

  // Validate fields
  const validateField = (name, value) => {
    switch (name) {
      case "productName":
        if (!value.trim()) return "Tên sản phẩm không được để trống.";
        if (value.length < 3) return "Tên sản phẩm phải dài ít nhất 3 ký tự.";
        return "";
      case "categoryId":
        if (!value) return "Vui lòng chọn một danh mục.";
        return "";
      case "unit":
        if (!value.trim()) return "Đơn vị không được để trống.";
        return "";
      case "inventoryId":
        if (!value) return "Vui lòng chọn vị trí (kệ).";
        return "";
      case "productImage":
        if (
          value &&
          typeof value !== "string" &&
          !["image/jpeg", "image/png"].includes(value.type)
        ) {
          return "Hình ảnh phải là định dạng JPEG hoặc PNG.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prevData) => ({
        ...prevData,
        productImage: file,
      }));
      setImagePreview(URL.createObjectURL(file));
      const error = validateField("productImage", file);
      setErrors((prevErrors) => ({
        ...prevErrors,
        productImage: error,
      }));
    }
  };

  const onUpdate = async () => {
    const newErrors = {};
    Object.keys(productData).forEach((key) => {
      if (key !== "status") {
        newErrors[key] = validateField(key, productData[key]);
      }
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      setGeneralError("Vui lòng sửa các lỗi trước khi cập nhật.");
      return;
    }

    setLoading(true);
    setGeneralError("");

    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key !== "productImage") {
        formData.append(key, productData[key]);
      }
    });

    if (
      productData.productImage &&
      typeof productData.productImage !== "string"
    ) {
      formData.append("productImage", productData.productImage);
    }

    try {
      await axios.put(
        `http://localhost:9999/products/updateProduct/${product._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onUpdateSuccess(); // Gọi callback để refresh danh sách sản phẩm
      handleClose();
    } catch (error) {
      console.error("Error updating product:", error);
      setGeneralError("Có lỗi xảy ra khi cập nhật sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập Nhật Sản Phẩm</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {generalError && <Alert severity="error">{generalError}</Alert>}
          <TextField
            autoFocus
            name="productName"
            label="Tên Sản Phẩm"
            value={productData.productName}
            onChange={handleChange}
            error={!!errors.productName}
            helperText={errors.productName}
            fullWidth
            required
          />
          <FormControl fullWidth error={!!errors.categoryId}>
            <InputLabel id="category-select-label">Danh Mục</InputLabel>
            <Select
              labelId="category-select-label"
              name="categoryId"
              value={productData.categoryId}
              label="Danh Mục"
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Chọn danh mục</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <FormHelperText>{errors.categoryId}</FormHelperText>
            )}
          </FormControl>
          <TextField
            name="unit"
            label="Đơn Vị (ví dụ: cái, hộp, kg)"
            value={productData.unit}
            onChange={handleChange}
            error={!!errors.unit}
            helperText={errors.unit}
            fullWidth
            required
          />
          <FormControl fullWidth error={!!errors.inventoryId}>
            <InputLabel id="inventory-select-label">Vị Trí (Kệ)</InputLabel>
            <Select
              labelId="inventory-select-label"
              name="inventoryId"
              value={productData.inventoryId}
              label="Vị Trí (Kệ)"
              onChange={handleChange}
              disabled={!productData.categoryId}
            >
              <MenuItem value="">
                <em>Chọn kệ</em>
              </MenuItem>
              {filteredInventories.map((inv) => {
                const isFull =
                  (typeof inv.maxQuantitative === "number" && typeof inv.currentQuantitative === "number" && inv.currentQuantitative >= inv.maxQuantitative) ||
                  (typeof inv.maxWeight === "number" && typeof inv.currentWeight === "number" && inv.currentWeight >= inv.maxWeight);
                return (
                  <MenuItem key={inv._id} value={inv._id} disabled={isFull}>
                    {inv.name} {inv.category?.categoryName ? `- ${inv.category.categoryName}` : ""}
                    {isFull ? " (Kệ đã đầy)" : ""}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.inventoryId && (
              <FormHelperText>{errors.inventoryId}</FormHelperText>
            )}
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            color={errors.productImage ? "error" : "primary"}
          >
            Chọn Hình Ảnh
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </Button>
          {errors.productImage && (
            <FormHelperText error>{errors.productImage}</FormHelperText>
          )}
          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={imagePreview}
                alt="Xem trước sản phẩm"
                style={{
                  maxWidth: "200px",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Trạng Thái</InputLabel>
            <Select
              labelId="status-select-label"
              name="status"
              value={productData.status}
              label="Trạng Thái"
              onChange={handleChange}
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={handleClose} disabled={loading} color="secondary">
          Đóng
        </Button>
        <Button
          onClick={onUpdate}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateProductModal;