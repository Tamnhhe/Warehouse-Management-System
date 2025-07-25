// File: EditCategory.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Stack, Box, Typography, IconButton, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EditCategoryDialog = ({
  open,
  onClose,
  category,
  onCategoryUpdated,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  onUpdate
}) => {
  const [formData, setFormData] = useState({ categoryName: '', description: '' });
  const [subcategories, setSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (open && category) {
      setFormData({
        categoryName: category.categoryName,
        description: category.description,
      });
      setSubcategories(Array.isArray(category.classifications) ? JSON.parse(JSON.stringify(category.classifications)) : []);
      setFormErrors({});
    } else {
      setFormErrors({});
      setLoading(false);
      setConfirmDelete(null);
    }
  }, [open, category]);

  const handleAddSubcategory = () => {
    if (subcategories.some(sub => !sub.name.trim())) {
      setFormErrors((prev) => ({ ...prev, subcategories: "Vui lòng điền tên cho các danh mục con hiện có trước khi thêm mới." }));
      return;
    }
    setSubcategories([...subcategories, { _id: `temp_${Date.now()}`, name: "", description: "" }]);
    setFormErrors((prev) => ({ ...prev, subcategories: undefined }));
  };

  const handleUpdateSubcategory = (index, key, value) => {
    const updated = [...subcategories];
    updated[index][key] = value;
    setSubcategories(updated);
    setFormErrors((prev) => ({ ...prev, [`subcategories.${index}.${key}`]: undefined }));
  };

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`subcategories.${index}.`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const handleTriggerDelete = (subId) => {
    setConfirmDelete(subId);
  };

  const handleConfirmDelete = async () => {
    const subIdToDelete = confirmDelete;
    if (!subIdToDelete) return;

    // Nếu là sub mới (chưa có _id từ DB), chỉ xóa khỏi state
    if (subIdToDelete.toString().startsWith("temp_")) {
      setSubcategories(subcategories.filter(sub => sub._id !== subIdToDelete));
      setConfirmDelete(null);
      return;
    }

    // Nếu là sub đã có, gọi hàm xóa
    try {
      await deleteSubcategory(category._id, subIdToDelete);
      setSubcategories(subcategories.filter(sub => sub._id !== subIdToDelete));
    } catch (error) {
      setFormErrors({ general: "Lỗi khi xóa danh mục con. Vui lòng thử lại." });
    } finally {
      setConfirmDelete(null);
    }
  };

  // --- VALIDATE giống AddCategory ---
  const validate = () => {
    const errors = {};
    if (!formData.categoryName.trim()) {
      errors.categoryName = "Tên danh mục không được để trống.";
    } else if (formData.categoryName.length > 100) {
      errors.categoryName = "Tên danh mục tối đa 100 ký tự.";
    }
    if (formData.description.length > 250) {
      errors.description = "Mô tả tối đa 250 ký tự.";
    }
    subcategories.forEach((sub, idx) => {
      if (!sub.name.trim()) {
        errors[`subcategories.${idx}.name`] = "Tên danh mục con không được để trống.";
      }
      if (sub.description && sub.description.length > 100) {
        errors[`subcategories.${idx}.description`] = "Mô tả danh mục con tối đa 100 ký tự.";
      }
    });
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      // 1. Cập nhật thông tin danh mục cha
      await onUpdate(category._id, formData);

      // 2. Xử lý danh mục con (thêm mới hoặc cập nhật)
      for (const sub of subcategories) {
        if (sub.name.trim()) {
          if (sub._id.toString().startsWith("temp_")) {
            await addSubcategory(category._id, { name: sub.name, description: sub.description });
          } else {
            await updateSubcategory(category._id, sub._id, { name: sub.name, description: sub.description });
          }
        }
      }
      onCategoryUpdated();
      onClose();
    } catch (err) {
      setFormErrors(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {formErrors.general && <Alert severity="error">{formErrors.general}</Alert>}
            <TextField
              autoFocus
              label="Tên danh mục"
              fullWidth
              required
              value={formData.categoryName}
              onChange={(e) => {
                setFormData({ ...formData, categoryName: e.target.value });
                if (formErrors.categoryName) {
                  setFormErrors((prev) => ({ ...prev, categoryName: undefined }));
                }
              }}
              error={!!formErrors.categoryName}
              helperText={formErrors.categoryName}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) {
                  setFormErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            <Box>
              <Typography variant="h6" gutterBottom>Danh mục con</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên danh mục con</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell align="right">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subcategories.map((sub, index) => (
                      <TableRow key={sub._id}>
                        <TableCell>
                          <TextField
                            variant="standard"
                            fullWidth
                            value={sub.name}
                            onChange={(e) => {
                              handleUpdateSubcategory(index, 'name', e.target.value);
                              if (formErrors[`subcategories.${index}.name`]) {
                                setFormErrors((prev) => ({ ...prev, [`subcategories.${index}.name`]: undefined }));
                              }
                            }}
                            error={!!formErrors[`subcategories.${index}.name`]}
                            helperText={formErrors[`subcategories.${index}.name`]}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            variant="standard"
                            fullWidth
                            value={sub.description}
                            onChange={(e) => {
                              handleUpdateSubcategory(index, 'description', e.target.value);
                              if (formErrors[`subcategories.${index}.description`]) {
                                setFormErrors((prev) => ({ ...prev, [`subcategories.${index}.description`]: undefined }));
                              }
                            }}
                            error={!!formErrors[`subcategories.${index}.description`]}
                            helperText={formErrors[`subcategories.${index}.description`]}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => handleTriggerDelete(sub._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {formErrors.subcategories && (
                <Alert severity="error" sx={{ mt: 1 }}>{formErrors.subcategories}</Alert>
              )}
              <Button startIcon={<AddIcon />} onClick={handleAddSubcategory} sx={{ mt: 1 }}>
                Thêm dòng
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} disabled={loading} color="inherit">Hủy</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Lưu Thay Đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa danh mục con này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCategoryDialog;