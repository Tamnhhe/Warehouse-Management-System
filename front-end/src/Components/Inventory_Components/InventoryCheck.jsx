import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Tooltip,
  Chip,
  Grid,
  Popover,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import axios from "axios";
import "./inventoryPin.css"; // Thêm file CSS riêng cho từng kệ

const API_BASE = "http://localhost:9999/inventory";
const CATEGORY_API = "http://localhost:9999/category/getAllCategories";

// Danh sách màu cho từng loại sản phẩm
const colorList = [
  "#4fc3f7", "#f48fb1", "#aed581", "#ffd54f", "#ba68c8",
  "#ff8a65", "#81d4fa", "#e57373", "#fff176", "#a1887f",
  "#90caf9", "#ce93d8", "#ffb74d", "#b0bec5", "#dce775"
];

function InventoryCheck({ fetchInventoriesRef }) {
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    maxQuantitative: "",
    maxWeight: "",
    status: "active",
  });

  // Popover state
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverProducts, setHoverProducts] = useState([]);

  const openPopover = Boolean(anchorEl);

  const handlePopoverOpen = (event, products) => {
    setAnchorEl(event.currentTarget);
    setHoverProducts(products || []);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoverProducts([]);
  };

  const handleOpen = () => {
    setForm({
      name: "",
      categoryId: "",
      maxQuantitative: "",
      maxWeight: "",
      status: "active",
    });
    setOpen(true);
  };

  // Hàm fetchInventories cho phép truyền ref ra ngoài
  const fetchInventories = async () => {
    try {
      const res = await axios.get(API_BASE);
      setInventories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setInventories([]);
      alert("Lỗi khi tải danh sách kệ!");
    }
  };

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

  // Cho phép component cha gọi fetchInventories qua ref
  useEffect(() => {
    if (fetchInventoriesRef) {
      fetchInventoriesRef.current = fetchInventories;
    }
  }, [fetchInventoriesRef]);

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
    ? inventories.filter(
        (inv) =>
          inv.category?._id === selectedCategory ||
          inv.categoryId === selectedCategory
      )
    : inventories;

  // SẮP XẾP: Kệ nào 100% lên đầu
  const sortedInventories = [...filteredInventories].sort((a, b) => {
    const percentA = a.maxQuantitative > 0 ? Math.round((a.currentQuantitative / a.maxQuantitative) * 100) : 0;
    const percentB = b.maxQuantitative > 0 ? Math.round((b.currentQuantitative / b.maxQuantitative) * 100) : 0;
    if (percentA === 100 && percentB !== 100) return -1;
    if (percentB === 100 && percentA !== 100) return 1;
    return 0;
  });

  const usedCategoryIds = Array.from(
    new Set(
      (inventories || []).map((inv) => inv.category?._id || inv.categoryId)
    )
  );
  const filteredCategories = (categories || []).filter((cat) =>
    usedCategoryIds.includes(cat._id)
  );

  return (
    <Box sx={{ p: 3, background: "#fff", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom fontWeight={900} color="#1976d2" sx={{ letterSpacing: 2 }}>
        Quản Lý Kệ Hàng
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 220, mr: 2 }}>
          <InputLabel id="filter-category-label" sx={{ color: "#1976d2" }}>Lọc loại sản phẩm</InputLabel>
          <Select
            labelId="filter-category-label"
            value={selectedCategory}
            label="Lọc loại sản phẩm"
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{
              background: "#fff",
              borderRadius: 2,
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {filteredCategories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpen}
          sx={{
            background: "linear-gradient(90deg, #1976d2 60%, #22d3ee 100%)",
            color: "#fff",
            fontWeight: 700,
            boxShadow: 3,
            borderRadius: 3,
            px: 3,
            py: 1.2,
            fontSize: 18,
          }}
        >
          Thêm kệ mới
        </Button>
      </Box>
      <Grid container spacing={4}>
        {sortedInventories.map((inv) => {
          const percent =
            inv.maxQuantitative > 0
              ? Math.round(
                  (inv.currentQuantitative / inv.maxQuantitative) * 100
                )
              : 0;
          // Số hộp hàng trên kệ (tối đa 5 hộp/tầng, 3 tầng)
          const maxBoxes = 15;
          const products = inv.products || [];
          const sumWeight = products.reduce((sum, p) => sum + (p.weight || 0), 0);

          // Đảm bảo đủ số hộp: nếu có sản phẩm thì luôn có ít nhất 1 hộp màu
          let boxCount = 0;
          if (products.length > 0 && inv.maxQuantitative > 0) {
            boxCount = Math.max(
              1,
              Math.round((inv.currentQuantitative / inv.maxQuantitative) * maxBoxes)
            );
            boxCount = Math.min(boxCount, maxBoxes);
          }

          let boxColors = [];
          if (products.length === 0 || boxCount === 0) {
            // Không có sản phẩm hoặc boxCount = 0
            boxColors = [];
          } else {
            // Bước 1: Mỗi sản phẩm ít nhất 1 hộp (nếu còn chỗ)
            let minArr = Array(products.length).fill(1);
            let remain = boxCount - products.length;
            if (remain < 0) {
              // Nếu số hộp ít hơn số sản phẩm, chỉ lấy boxCount sản phẩm đầu
              minArr = Array(boxCount).fill(1);
              remain = 0;
            }

            // Bước 2: Phân bổ hộp còn lại theo tỷ lệ số lượng sản phẩm
            let totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
            let extraArr = Array(products.length).fill(0);
            if (remain > 0 && totalQuantity > 0) {
              let assigned = 0;
              let fractions = products.map(p => (p.quantity / totalQuantity) * remain);
              // Làm tròn xuống trước
              fractions.forEach((f, idx) => {
                extraArr[idx] = Math.floor(f);
                assigned += extraArr[idx];
              });
              // Phân bổ phần dư còn lại cho sản phẩm có phần thập phân lớn nhất
              let left = remain - assigned;
              let sorted = fractions
                .map((f, idx) => ({ idx, frac: f - Math.floor(f) }))
                .sort((a, b) => b.frac - a.frac);
              for (let i = 0; i < left; i++) {
                extraArr[sorted[i % products.length].idx]++;
              }
            }

            // Bước 3: Gộp lại và tạo boxColors
            minArr.forEach((min, idx) => {
              let total = min + (extraArr[idx] || 0);
              for (let i = 0; i < total; i++) {
                boxColors.push(colorList[idx % colorList.length]);
              }
            });
            // Nếu dư hộp (do số sản phẩm > boxCount), cắt bớt
            boxColors = boxColors.slice(0, boxCount);
          }

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={inv._id}>
              <Box
                className="shelf-card"
                onClick={(e) => handlePopoverOpen(e, inv.products)}
              >
                {/* Badge trạng thái và nút xóa trên đầu */}
                <Box className="shelf-card-header">
                  <Chip
                    label={inv.status === "active" ? "Hoạt động" : "Ngừng"}
                    color={inv.status === "active" ? "success" : "default"}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      px: 1.2,
                      background:
                        inv.status === "active"
                          ? "linear-gradient(90deg,#22d3ee,#1976d2)"
                          : "#e0e0e0",
                      color: inv.status === "active" ? "#fff" : "#333",
                      boxShadow: 1,
                      fontSize: 14,
                      minWidth: 0,
                      maxWidth: 110,
                      textAlign: "center",
                      height: 32,
                    }}
                  />
                  <Button
                    color="error"
                    onClick={(e) => { e.stopPropagation(); handleDelete(inv._id); }}
                    startIcon={<DeleteIcon />}
                    size="small"
                    variant="contained"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 3,
                      background: "linear-gradient(90deg,#ef4444,#facc15)",
                      color: "#fff",
                      boxShadow: 2,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 0,
                      maxWidth: 110,
                      fontSize: 14,
                      "&:hover": {
                        background: "linear-gradient(90deg,#f87171,#fde047)",
                        color: "#222",
                      },
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      height: 32,
                    }}
                  >
                    XÓA
                  </Button>
                </Box>
                {/* SVG minh họa kệ để hàng */}
                <Box className="shelf-card-svg">
                  <svg width="220" height="200" viewBox="0 0 220 200">
                    {/* 3 tầng kệ */}
                    {[0, 1, 2].map((t) => (
                      <g key={t}>
                        {/* Tầng */}
                        <rect
                          x="20"
                          y={50 + t * 50}
                          width="180"
                          height="20"
                          rx="8"
                          fill="#b0bec5"
                          stroke="#78909c"
                          strokeWidth="3"
                        />
                        {/* Chân kệ trái/phải */}
                        <rect
                          x="28"
                          y={50 + t * 50 + 20}
                          width="14"
                          height={t === 2 ? 45 : 35}
                          rx="6"
                          fill="#90a4ae"
                        />
                        <rect
                          x="178"
                          y={50 + t * 50 + 20}
                          width="14"
                          height={t === 2 ? 45 : 35}
                          rx="6"
                          fill="#90a4ae"
                        />
                        {/* Hộp hàng trên tầng */}
                        {boxColors
                          .slice(t * 7, t * 7 + 7)
                          .map((color, i) =>
                            color ? (
                              <rect
                                key={i}
                                x={36 + i * 24}
                                y={46 + t * 50}
                                width="22"
                                height="28"
                                rx="5"
                                fill={inv.status === "active" ? color : "#bdbdbd"}
                                stroke="#0288d1"
                                strokeWidth="1.5"
                                style={{
                                  filter:
                                    inv.status === "active"
                                      ? "drop-shadow(0 2px 4px #0288d155)"
                                      : "none",
                                }}
                              />
                            ) : null
                          )}
                      </g>
                    ))}
                    {/* Đế kệ */}
                    <rect
                      x="20"
                      y={50 + 3 * 50}
                      width="180"
                      height="16"
                      rx="8"
                      fill="#78909c"
                    />
                  </svg>
                </Box>
                <Typography className="shelf-card-title">
                  {inv.name}
                </Typography>
                <Typography className="shelf-card-category">
                  {inv.category?.categoryName || inv.categoryId || "Không xác định"}
                </Typography>
                <Box className="shelf-card-progress">
                  <Tooltip title="Sức chứa hiện tại">
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <CircularProgress
                        variant="determinate"
                        value={percent}
                        size={54}
                        thickness={5}
                        sx={{
                          color:
                            percent < 20
                              ? "#ef4444"
                              : percent < 60
                              ? "#facc15"
                              : "#22d3ee",
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: "absolute",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                          fontWeight={800}
                        >
                          {percent}%
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </Box>
                <Box className="shelf-card-chips">
                  <Chip
                    label={`SL: ${inv.currentQuantitative}/${inv.maxQuantitative}`}
                    color="primary"
                    size="small"
                  />
                
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Popover hiển thị danh sách sản phẩm khi click */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: { p: 2, minWidth: 220, borderRadius: 2, pointerEvents: "auto" },
        }}
        disableRestoreFocus
        disablePortal
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Sản phẩm trong kệ
        </Typography>
        {hoverProducts && hoverProducts.length > 0 ? (
          hoverProducts.map((prod, idx) => (
            <Box
              key={prod.productId || idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
                px: 1,
              }}
            >
              <Box sx={{
                width: 16, height: 16, borderRadius: "4px", mr: 1,
                background: colorList[idx % colorList.length], display: "inline-block"
              }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {prod.productName}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                SL: {prod.quantity} {prod.unit ? prod.unit : ""}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Không có sản phẩm
          </Typography>
        )}
      </Popover>

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
              label="Sức chứa tối đa"
              name="maxQuantitative"
              type="number"
              value={form.maxQuantitative}
              onChange={handleChange}
              fullWidth
              required
            />
          
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                label="Trạng thái"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Ngừng</MenuItem>
              </Select>
            </FormControl>
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