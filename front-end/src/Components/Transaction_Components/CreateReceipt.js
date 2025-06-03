import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

// Định nghĩa validation schema cho Form
const validationSchema = Yup.object({
  transactionDate: Yup.date().required("Ngày nhập kho là bắt buộc"),
  supplierName: Yup.string().required("Nhà cung cấp là bắt buộc"),
  products: Yup.array().of(
    Yup.object().shape({
      productName: Yup.string().required("Tên sản phẩm là bắt buộc"),
      categoryName: Yup.string().required("Danh mục là bắt buộc"),
      quantity: Yup.number()
        .required("Số lượng là bắt buộc")
        .min(1, "Số lượng phải lớn hơn 0"),
      price: Yup.number()
        .required("Đơn giá là bắt buộc")
        .min(0, "Đơn giá không được âm"),
    })
  ),
});

const CreateReceipt = () => {
  //Khai báo state để lưu dữ liệu từ API
  const [products, setProducts] = useState([]); // Danh sách sản phẩm
  const [categories, setCategories] = useState([]); // Danh sách danh mục
  const [suppliers, setSuppliers] = useState([]); // Danh sách nhà cung cấp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null); // Nhà cung cấp được chọn
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm theo nhà cung cấp

  // Gọi API khi component được render lần đầu tiên
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        // Gọi 3 API để lấy danh sách sản phẩm, danh mục và nhà cung cấp
        axios.get("http://localhost:9999/products/getAllProducts"),
        axios.get("http://localhost:9999/categories/getAllCategories"),
        axios.get("http://localhost:9999/suppliers/getAllSuppliers"),
      ]);
      const activeSuppliers = suppliersRes.data.filter(
        (supplier) => supplier.status === "active"
      );

      console.log("Active Suppliers:", activeSuppliers);
      // Cập nhật state với dữ liệu từ API
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSuppliers(activeSuppliers);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    }
  };

  // Khởi tạo Formik để quản lý form
  const formik = useFormik({
    initialValues: {
      transactionDate: new Date().toISOString().split("T")[0], // Ngày mặc định là hôm nay
      supplierName: "",
      status: "pending", // Trạng thái mặc định là "Chờ xử lý"
      products: [
        {
          productName: "",
          categoryName: "",
          quantity: "",
          price: "",
        },
      ],
    },
    validationSchema, // Áp dụng validation
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess(false);
      try {
        // Gửi dữ liệu phiếu nhập lên server
        const response = await axios.post(
          "http://localhost:9999/inventoryTransactions/create-receipts",
          values
        );
        console.log("Receipt created:", response.data);
        setSuccess(true);
        formik.resetForm();
        setSelectedSupplier(null);
        setFilteredProducts([]);
      } catch (error) {
        console.error("Error creating receipt:", error);
        setError(
          error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu nhập"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSupplierChange = async (_, value) => {
    formik.setFieldValue("supplierName", value?.name || "");
    setSelectedSupplier(value);
    formik.setFieldValue("products", [
      {
        productName: "",
        categoryName: "",
        quantity: "",
        price: "",
      },
    ]); // Reset sản phẩm khi đổi nhà cung cấp
    console.log("ang:");
    if (value) {
      try {
        const response = await axios.get(
          `http://localhost:9999/supplierProducts/getProductsBySupplier/${value._id}`
        );
        // Đảm bảo filteredProducts luôn là một mảng
        const supplierProducts = Array.isArray(response.data)
          ? response.data.filter((item) => item.status === "active")
          : [];

        console.log("Supplier products:", supplierProducts);
        setFilteredProducts(supplierProducts);
      } catch (error) {
        setFilteredProducts([]);
        console.error("Lỗi khi tải sản phẩm của nhà cung cấp:", error);
      }
    } else {
      setFilteredProducts([]);
    }
  };

  // Hàm thêm một dòng sản phẩm vào danh sách
  const addProductRow = () => {
    formik.setFieldValue("products", [
      ...formik.values.products,
      {
        productName: "",
        categoryName: "",
        quantity: "",
        price: "",
      },
    ]);
  };

  // Hàm xóa một sản phẩm khỏi danh sách
  const removeProductRow = (index) => {
    const updatedProducts = formik.values.products.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("products", updatedProducts);
  };

  // Hàm tính tổng tiền của tất cả sản phẩm
  const calculateTotal = () => {
    return formik.values.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity || 0);
    }, 0);
  };

  const handleProductSelect = (index, value) => {
    if (value) {
      formik.setFieldValue(`products.${index}.productName`, value.productName);

      if (value.categoryId?.categoryName) {
        formik.setFieldValue(
          `products.${index}.categoryName`,
          value.categoryId.categoryName
        );
      } else {
        formik.setFieldValue(`products.${index}.categoryName`, "");
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tạo Phiếu Nhập Kho
        </Typography>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Phiếu nhập đã được tạo thành công!
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Nhập ngày nhập kho & chọn nhà cung cấp */}
          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              name="transactionDate"
              label="Ngày Nhập Kho"
              value={formik.values.transactionDate}
              onChange={formik.handleChange}
              error={
                formik.touched.transactionDate &&
                Boolean(formik.errors.transactionDate)
              }
              helperText={
                formik.touched.transactionDate && formik.errors.transactionDate
              }
              InputLabelProps={{ shrink: true }}
            />

            {/* Chọn nhà cung cấp */}
            <Autocomplete
              fullWidth
              options={suppliers}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nhà Cung Cấp"
                  error={
                    formik.touched.supplierName &&
                    Boolean(formik.errors.supplierName)
                  }
                  helperText={
                    formik.touched.supplierName && formik.errors.supplierName
                  }
                />
              )}
              value={selectedSupplier}
              onChange={handleSupplierChange}
            />

            {/* Trạng thái (không chỉnh sửa) */}
            <TextField
              fullWidth
              label="Trạng Thái"
              value="Chờ xử lý"
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>

          {/* Danh sách sản phẩm */}
          <TableContainer sx={{ maxHeight: 400, overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Sản Phẩm
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Danh Mục
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Số Lượng
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Đơn Giá
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Thành Tiền
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Thao Tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formik.values.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ width: "30%" }}>
                      <Autocomplete
                        options={filteredProducts}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.productName || ""
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Sản Phẩm"
                            error={
                              formik.touched.products?.[index]?.productName &&
                              Boolean(
                                formik.errors.products?.[index]?.productName
                              )
                            }
                            helperText={
                              formik.touched.products?.[index]?.productName &&
                              formik.errors.products?.[index]?.productName
                            }
                          />
                        )}
                        value={
                          Array.isArray(filteredProducts)
                            ? filteredProducts.find(
                                (p) => p.productName === product.productName
                              ) || null
                            : null
                        }
                        onChange={(_, value) =>
                          handleProductSelect(index, value)
                        }
                        disabled={!selectedSupplier}
                      />
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        options={categories}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.categoryName || ""
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Danh Mục"
                            error={
                              formik.touched.products?.[index]?.categoryName &&
                              Boolean(
                                formik.errors.products?.[index]?.categoryName
                              )
                            }
                            helperText={
                              formik.touched.products?.[index]?.categoryName &&
                              formik.errors.products?.[index]?.categoryName
                            }
                          />
                        )}
                        value={
                          categories.find(
                            (c) => c.categoryName === product.categoryName
                          ) || null
                        }
                        onChange={(_, value) => {
                          formik.setFieldValue(
                            `products.${index}.categoryName`,
                            value?.categoryName || ""
                          );
                        }}
                        disabled={!selectedSupplier}
                      />
                    </TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      <TextField
                        type="number"
                        value={product.quantity}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value));
                          formik.setFieldValue(
                            `products.${index}.quantity`,
                            value
                          );
                        }}
                        error={
                          formik.touched.products?.[index]?.quantity &&
                          Boolean(formik.errors.products?.[index]?.quantity)
                        }
                        helperText={
                          formik.touched.products?.[index]?.quantity &&
                          formik.errors.products?.[index]?.quantity
                        }
                        disabled={!selectedSupplier}
                      />
                    </TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      <TextField
                        type="number"
                        value={product.price}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value));
                          formik.setFieldValue(
                            `products.${index}.price`,
                            value
                          );
                        }}
                        error={
                          formik.touched.products?.[index]?.price &&
                          Boolean(formik.errors.products?.[index]?.price)
                        }
                        helperText={
                          formik.touched.products?.[index]?.price &&
                          formik.errors.products?.[index]?.price
                        }
                        disabled={!selectedSupplier}
                      />
                    </TableCell>
                    <TableCell sx={{ width: "13%" }}>
                      {(product.quantity * product.price || 0).toLocaleString()}{" "}
                      VNĐ
                    </TableCell>
                    <TableCell sx={{ width: "5%" }}>
                      <IconButton
                        onClick={() => removeProductRow(index)}
                        disabled={
                          formik.values.products.length === 1 ||
                          !selectedSupplier
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addProductRow}
              variant="outlined"
              disabled={!selectedSupplier}
            >
              Thêm Sản Phẩm
            </Button>
            <Typography variant="h6">
              Tổng Tiền: {calculateTotal().toLocaleString()} VNĐ
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Đang Xử Lý..." : "Tạo Phiếu Nhập"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateReceipt;
