import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";

const AddSupplierProductModal = ({ open, onClose, onSubmit, supplierId, palette, categories }) => {
  const [formData, setFormData] = useState({
    supplier: supplierId || "",
    stock: 0,
    expiry: "",
    categoryId: "",
    productImage: "",
    productName: "",
    quantitative: 1,
    unit: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const validate = (data) => {
    const errors = {};
    if (!data.supplier) errors.supplier = "Nhà cung cấp là bắt buộc";
    if (typeof data.stock !== "number" || data.stock < 0) errors.stock = "Tồn kho phải là số không âm";
    if (!data.productImage) errors.productImage = "Ảnh sản phẩm là bắt buộc";
    if (!data.productName.trim()) errors.productName = "Tên sản phẩm là bắt buộc";
    if (typeof data.quantitative !== "number" || data.quantitative <= 0) errors.quantitative = "Định lượng phải là số dương";
    if (!data.unit.trim()) errors.unit = "Đơn vị là bắt buộc";
    // if (!data.categoryId) errors.categoryId = "Danh mục là bắt buộc";
    if (data.expiry && isNaN(Date.parse(data.expiry))) errors.expiry = "Ngày hết hạn không hợp lệ";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "stock" || name === "quantitative" ? Number(value) : value }));
  };

  const handleSubmit = () => {
    const errors = validate(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit(formData);
    setFormData({
      supplier: supplierId || "",
      stock: 0,
      expiry: "",
      categoryId: "60f7c2b8e1d2c81234567891",
      productImage: "",
      productName: "",
      quantitative: 1,
      unit: ""
    });
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: palette.dark,
          color: palette.white,
          display: "flex",
          alignItems: "center",
          pb: 2,
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Thêm sản phẩm nhà cung cấp
        <IconButton
          onClick={onClose}
          sx={{
            ml: "auto",
            color: palette.white,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tên sản phẩm"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              error={!!formErrors.productName}
              helperText={formErrors.productName}
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tồn kho"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={!!formErrors.stock}
              helperText={formErrors.stock}
              required
              variant="outlined"
              inputProps={{ min: 0 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Định lượng"
              name="quantitative"
              type="number"
              value={formData.quantitative}
              onChange={handleChange}
              error={!!formErrors.quantitative}
              helperText={formErrors.quantitative}
              required
              variant="outlined"
              inputProps={{ min: 1 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Đơn vị"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              error={!!formErrors.unit}
              helperText={formErrors.unit}
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày hết hạn"
              name="expiry"
              type="date"
              value={formData.expiry}
              onChange={handleChange}
              error={!!formErrors.expiry}
              helperText={formErrors.expiry}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ảnh sản phẩm (URL)"
              name="productImage"
              value={formData.productImage}
              onChange={handleChange}
              error={!!formErrors.productImage}
              helperText={formErrors.productImage}
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.dark,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.dark,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ "&.Mui-focused": { color: palette.dark } }}>
                Danh mục sản phẩm
              </InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Danh mục sản phẩm"
                error={!!formErrors.categoryId}
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.dark,
                  },
                }}
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Không có danh mục
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc" }}>
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "grey.100" },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            backgroundColor: palette.dark,
            "&:hover": {
              backgroundColor: palette.medium,
              color: palette.dark,
            },
            borderRadius: 2,
            px: 3,
          }}
        >
          Thêm sản phẩm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSupplierProductModal;
