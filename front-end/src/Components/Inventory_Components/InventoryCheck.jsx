import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const API_BASE = "http://localhost:9999/inventory";
const CATEGORY_API = "http://localhost:9999/category/getAllCategories";

function InventoryCheck() {
  // Đảm bảo userData luôn là object hoặc null
  const user = JSON.parse(localStorage.getItem("userData") || "null");

  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // State lọc

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    creator: user?.name || "",
    maxQuantitative: "",
    maxWeight: "",
    status: "active",
  });

  const handleOpen = () => {
    setForm({
      name: "",
      categoryId: "",
      creator: user?.name || "",
      maxQuantitative: "",
      maxWeight: "",
      status: "active",
    });
    setOpen(true);
  };

  // Lấy danh sách kệ
  const fetchInventories = async () => {
    try {
      const res = await axios.get(API_BASE);
      setInventories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setInventories([]);
      alert("Lỗi khi tải danh sách kệ!");
    }
  };

  // Lấy danh sách category
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCategories([]);
      alert("Lỗi khi tải danh sách loại sản phẩm!");
    }
  };

  useEffect(() => {
    fetchInventories();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  // Xử lý form
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/add`, form);
      setOpen(false);
      setForm({
        name: "",
        categoryId: "",
        creator: user?.name || "",
        maxQuantitative: "",
        maxWeight: "",
        status: "active",
      });
      fetchInventories();
    } catch (err) {
      alert("Lỗi khi tạo kệ mới!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kệ này?")) {
      try {
        await axios.delete(`${API_BASE}/delete/${id}`);
        fetchInventories();
      } catch (err) {
        alert("Lỗi khi xóa kệ!");
      }
    }
  };

  // Lọc inventories theo category
  const filteredInventories = selectedCategory
    ? inventories.filter((inv) => inv.categoryId === selectedCategory)
    : inventories;

  const usedCategoryIds = Array.from(
    new Set((inventories || []).map((inv) => inv.categoryId))
  );
  const filteredCategories = (categories || []).filter((cat) =>
    usedCategoryIds.includes(cat._id)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Kệ
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="filter-category-label">Lọc loại sản phẩm</InputLabel>
          <Select
            labelId="filter-category-label"
            value={selectedCategory}
            label="Lọc loại sản phẩm"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {filteredCategories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleOpen}>
          Thêm kệ mới
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên kệ</TableCell>
              <TableCell>Người tạo</TableCell>
              <TableCell>Sức chứa tối đa</TableCell>
              <TableCell>Cân nặng tối đa</TableCell>
              <TableCell>Số lượng hiện tại</TableCell>
              <TableCell>Cân nặng hiện tại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventories.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell>{inv.name}</TableCell>
                <TableCell>{inv.creator}</TableCell>
                <TableCell>{inv.maxQuantitative}</TableCell>
                <TableCell>{inv.maxWeight}</TableCell>
                <TableCell>{inv.currentQuantitative}</TableCell>
                <TableCell>{inv.currentWeight}</TableCell>
                <TableCell>{inv.status}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleDelete(inv._id)}
                    startIcon={<DeleteIcon />}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog thêm kệ mới */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Thêm kệ mới</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="dense" required>
              <TextField
                margin="dense"
                label="Tên kệ"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </FormControl>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="category-label">Loại sản phẩm</InputLabel>
              <Select
                labelId="category-label"
                label="Loại sản phẩm"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Người tạo"
              name="creator"
              value={form.creator}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Sức chứa tối đa"
              name="maxQuantitative"
              type="number"
              value={form.maxQuantitative}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Cân nặng tối đa"
              name="maxWeight"
              type="number"
              value={form.maxWeight}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Trạng thái"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              Thêm
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default InventoryCheck;