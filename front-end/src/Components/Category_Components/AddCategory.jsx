// File: AddCategory.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Stack, Box, Typography, IconButton, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const AddCategoryDialog = ({ open, onClose, onCategoryAdded, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hàm để reset form khi dialog đóng hoặc sau khi lưu thành công
  const resetForm = () => {
    setCategoryName('');
    setDescription('');
    setSubcategories([]);
    setFormErrors({});
    setLoading(false);
  };

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => resetForm(), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAddSubcategory = () => {
    if (subcategories.some(sub => !sub.name.trim())) {
      setFormErrors({ subcategories: "Vui lòng điền tên cho các danh mục con hiện có trước khi thêm mới." });
      return;
    }
    setSubcategories([...subcategories, { name: '', description: '' }]);
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

  const validate = () => {
    const errors = {};
    if (!categoryName.trim()) {
      errors.categoryName = "Tên danh mục không được để trống.";
    } else if (categoryName.length > 100) {
      errors.categoryName = "Tên danh mục tối đa 100 ký tự.";
    }
    if (description.length > 250) {
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
    console.log("Saving category:")
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      await onAdd({
        categoryName,
        description,
        classifications: subcategories.filter(sub => sub.name.trim()),
      });
      onClose();
    } catch (err) {
      console.log(err.response?.data);
      setFormErrors(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {formErrors.general && (
            <Alert severity="error">{formErrors.general}</Alert>
          )}
          <TextField
            autoFocus
            label="Tên danh mục"
            fullWidth
            required
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
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
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
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
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          variant="standard"
                          fullWidth
                          placeholder="Tên"
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
                          placeholder="Mô tả ngắn"
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
                        <IconButton size="small" color="error" onClick={() => handleRemoveSubcategory(index)}>
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
          {loading ? <CircularProgress size={24} /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;